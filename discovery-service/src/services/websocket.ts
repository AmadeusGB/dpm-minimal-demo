import { WebSocketServer, WebSocket } from 'ws';
import { registryService } from './registry';
import { WebSocketMessage, NodeMessage, LookupMessage, RegisterMessage, EmailMessage, EmailReceivedMessage, EmailDeliveredMessage } from '../types/message';
import { Node } from '../types/node';

export class WebSocketService {
  private wss: WebSocketServer;
  private connections: Map<string, WebSocket>;
  private heartbeatInterval: number;

  constructor(port: number, heartbeatInterval: number = 30000) {
    this.wss = new WebSocketServer({ port });
    this.connections = new Map();
    this.heartbeatInterval = heartbeatInterval;
    this.setupServer();
  }

  private setupServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      let nodeId: string | null = null;

      // 设置心跳检测
      const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, this.heartbeatInterval);

      ws.on('message', (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      ws.on('close', () => {
        clearInterval(heartbeat);
        if (nodeId) {
          this.connections.delete(nodeId);
          const node = registryService.getNodeById(nodeId);
          if (node) {
            node.status = 'offline';
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (nodeId) {
          this.connections.delete(nodeId);
          const node = registryService.getNodeById(nodeId);
          if (node) {
            node.status = 'offline';
          }
        }
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'REGISTER':
        this.handleRegister(ws, message as RegisterMessage);
        break;
      case 'LOOKUP':
        this.handleLookup(ws, message as LookupMessage);
        break;
      case 'MESSAGE':
        this.handleNodeMessage(message as NodeMessage);
        break;
      case 'HEARTBEAT':
        this.handleHeartbeat(message);
        break;
      case 'BROADCAST':
        this.handleBroadcast(message);
        break;
      case 'EMAIL_SEND':
        this.handleEmailSend(message as EmailMessage);
        break;
      case 'EMAIL_RECEIVED':
        this.handleEmailReceived(message as EmailReceivedMessage);
        break;
      case 'EMAIL_DELIVERED':
        this.handleEmailDelivered(message as EmailDeliveredMessage);
        break;
    }
  }

  private handleRegister(ws: WebSocket, message: RegisterMessage) {
    const { ipAddress, port, mailAddress } = message.data;
    console.log(`[Register] New node registering: ${mailAddress}`);
    const node = registryService.registerNode({ ipAddress, port, mailAddress });
    this.connections.set(node.nodeId, ws);
    console.log(`[Register] Node registered with ID: ${node.nodeId}`);
    ws.send(JSON.stringify({
      type: 'REGISTER',
      success: true,
      node
    }));
  }

  private handleLookup(ws: WebSocket, message: LookupMessage) {
    const { mailAddress } = message.data;
    console.log(`[Lookup] Looking up node for: ${mailAddress}`);
    const node = registryService.getNodeByMail(mailAddress);
    console.log(`[Lookup] Found node:`, node);
    ws.send(JSON.stringify({
      type: 'LOOKUP',
      success: true,
      node
    }));
  }

  private handleNodeMessage(message: NodeMessage) {
    const { recipient, content } = message.data;
    const node = registryService.getNodeByMail(recipient);
    if (node && this.connections.has(node.nodeId)) {
      const ws = this.connections.get(node.nodeId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'MESSAGE',
          from: message.senderId,
          content
        }));
      }
    }
  }

  private handleHeartbeat(message: WebSocketMessage) {
    const node = registryService.getNodeById(message.senderId);
    if (node) {
      registryService.updateHeartbeat(node.nodeId);
    }
  }

  private handleBroadcast(message: WebSocketMessage) {
    this.broadcast(message);
  }

  private handleEmailSend(message: EmailMessage) {
    const { email } = message.data;
    console.log(`[Email] Sending email from ${email.from} to ${email.to}`);
    const recipientNode = registryService.getNodeByMail(email.to);
    
    if (recipientNode && this.connections.has(recipientNode.nodeId)) {
      const ws = this.connections.get(recipientNode.nodeId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log(`[Email] Delivering email to node: ${recipientNode.nodeId}`);
        ws.send(JSON.stringify(message));
        
        // 发送投递确认
        this.sendEmailDelivered(email.id, email.to, message.senderId);
      }
    } else {
      console.log(`[Email] Recipient node not found or not connected: ${email.to}`);
    }
  }

  private handleEmailReceived(message: EmailReceivedMessage) {
    const { emailId, recipient } = message.data;
    const senderNode = registryService.getNodeById(message.senderId);
    
    if (senderNode && this.connections.has(senderNode.nodeId)) {
      const ws = this.connections.get(senderNode.nodeId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }

  private handleEmailDelivered(message: EmailDeliveredMessage) {
    const { emailId, recipient } = message.data;
    const senderNode = registryService.getNodeById(message.senderId);
    
    if (senderNode && this.connections.has(senderNode.nodeId)) {
      const ws = this.connections.get(senderNode.nodeId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }

  private sendEmailDelivered(emailId: string, recipient: string, senderId: string) {
    const message: EmailDeliveredMessage = {
      type: 'EMAIL_DELIVERED',
      timestamp: Date.now(),
      senderId: 'server',
      data: { emailId, recipient }
    };

    const senderWs = this.connections.get(senderId);
    if (senderWs && senderWs.readyState === WebSocket.OPEN) {
      senderWs.send(JSON.stringify(message));
    }
  }

  public broadcast(message: WebSocketMessage) {
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  public sendToNode(nodeId: string, message: WebSocketMessage) {
    const ws = this.connections.get(nodeId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
} 