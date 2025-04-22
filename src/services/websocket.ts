import { WebSocketMessage, NodeMessage, LookupMessage, RegisterMessage, EmailMessage, EmailReceivedMessage, EmailDeliveredMessage } from '../../discovery-service/src/types/message';
import { Email } from '../store/useStore';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 5000;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private nodeId: string | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private isConnected: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private currentUser: string | null = null;

  constructor(url: string) {
    this.url = url;
    console.log('[WebSocket] Initializing connection to:', url);
    this.connect();
  }

  private connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Attempting to connect to:', this.url);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // 如果有用户信息，重新注册
      if (this.currentUser) {
        console.log('[WebSocket] Re-registering user after reconnect:', this.currentUser);
        this.register('localhost', 3000, this.currentUser);
      }
      
      this.startHeartbeat();
      this.flushMessageQueue();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('[WebSocket] Received message:', message);
        
        // 如果是注册响应，保存节点ID
        if (message.type === 'REGISTER' && 'success' in message && message.success && 'node' in message) {
          const registerResponse = message as { node: { nodeId: string } };
          this.nodeId = registerResponse.node.nodeId;
          console.log('[WebSocket] Node ID set after registration:', this.nodeId);
        }
        
        this.handleMessage(message);
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      this.isConnected = false;
      this.nodeId = null;  // 清除节点ID
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      // 在发生错误时尝试重连
      if (this.ws) {
        this.ws.close();
      }
    };
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), this.reconnectTimeout);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  private flushMessageQueue() {
    console.log('[WebSocket] Flushing message queue:', this.messageQueue.length);
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Sending message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('[WebSocket] Connection not ready, queueing message');
      this.messageQueue.push(message);
    }
  }

  public register(ipAddress: string, port: number, mailAddress: string) {
    console.log('[WebSocket] Registering node:', mailAddress);
    const message: RegisterMessage = {
      type: 'REGISTER',
      timestamp: Date.now(),
      senderId: this.nodeId || 'unknown',
      data: { ipAddress, port, mailAddress }
    };
    this.send(message);
  }

  public lookup(mailAddress: string) {
    const message: LookupMessage = {
      type: 'LOOKUP',
      timestamp: Date.now(),
      senderId: this.nodeId || 'unknown',
      data: { mailAddress }
    };
    this.send(message);
  }

  public sendMessage(recipient: string, content: Email) {
    const message: NodeMessage = {
      type: 'MESSAGE',
      timestamp: Date.now(),
      senderId: this.nodeId || 'unknown',
      data: { recipient, content }
    };
    this.send(message);
  }

  public sendHeartbeat() {
    if (!this.nodeId) return;
    
    const message: WebSocketMessage = {
      type: 'HEARTBEAT',
      timestamp: Date.now(),
      senderId: this.nodeId
    };
    this.send(message);
  }

  public sendEmail(email: Email) {
    const message: EmailMessage = {
      type: 'EMAIL_SEND',
      timestamp: Date.now(),
      senderId: this.nodeId || 'unknown',
      data: { email }
    };
    this.send(message);
  }

  public sendEmailReceived(emailId: string, recipient: string) {
    const message: EmailReceivedMessage = {
      type: 'EMAIL_RECEIVED',
      timestamp: Date.now(),
      senderId: this.nodeId || 'unknown',
      data: { emailId, recipient }
    };
    this.send(message);
  }

  public sendEmailDelivered(emailId: string, recipient: string) {
    const message: EmailDeliveredMessage = {
      type: 'EMAIL_DELIVERED',
      timestamp: Date.now(),
      senderId: this.nodeId || 'unknown',
      data: { emailId, recipient }
    };
    this.send(message);
  }

  public onMessage(type: string, handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.set(type, handler);
  }

  public setNodeId(nodeId: string) {
    this.nodeId = nodeId;
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Send heartbeat every 15 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentUser) {
        console.log('[WebSocket] Sending heartbeat for user:', this.currentUser);
        this.send({
          type: 'HEARTBEAT',
          timestamp: Date.now(),
          senderId: this.currentUser,
        });
      } else {
        console.log('[WebSocket] Cannot send heartbeat - connection not ready or no user set');
        // Try to reconnect if needed
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          this.connect();
        }
      }
    }, 15000); // 减少心跳间隔到15秒
  }

  setCurrentUser(email: string) {
    this.currentUser = email;
  }
} 