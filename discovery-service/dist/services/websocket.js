"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const ws_1 = require("ws");
const registry_1 = require("./registry");
class WebSocketService {
    constructor(port, heartbeatInterval = 30000) {
        this.wss = new ws_1.WebSocketServer({ port });
        this.connections = new Map();
        this.heartbeatInterval = heartbeatInterval;
        this.setupServer();
    }
    setupServer() {
        this.wss.on('connection', (ws) => {
            let nodeId = null;
            // 设置心跳检测
            const heartbeat = setInterval(() => {
                if (ws.readyState === ws_1.WebSocket.OPEN) {
                    ws.ping();
                }
            }, this.heartbeatInterval);
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.handleMessage(ws, message);
                }
                catch (error) {
                    console.error('Error handling message:', error);
                }
            });
            ws.on('close', () => {
                clearInterval(heartbeat);
                if (nodeId) {
                    this.connections.delete(nodeId);
                    const node = registry_1.registryService.getNodeById(nodeId);
                    if (node) {
                        node.status = 'offline';
                    }
                }
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                if (nodeId) {
                    this.connections.delete(nodeId);
                    const node = registry_1.registryService.getNodeById(nodeId);
                    if (node) {
                        node.status = 'offline';
                    }
                }
            });
        });
    }
    handleMessage(ws, message) {
        switch (message.type) {
            case 'REGISTER':
                this.handleRegister(ws, message);
                break;
            case 'LOOKUP':
                this.handleLookup(ws, message);
                break;
            case 'MESSAGE':
                this.handleNodeMessage(message);
                break;
            case 'HEARTBEAT':
                this.handleHeartbeat(message);
                break;
            case 'BROADCAST':
                this.handleBroadcast(message);
                break;
            case 'EMAIL_SEND':
                this.handleEmailSend(message);
                break;
            case 'EMAIL_RECEIVED':
                this.handleEmailReceived(message);
                break;
            case 'EMAIL_DELIVERED':
                this.handleEmailDelivered(message);
                break;
        }
    }
    handleRegister(ws, message) {
        const { ipAddress, port, mailAddress } = message.data;
        console.log(`[Register] New node registering: ${mailAddress}`);
        const node = registry_1.registryService.registerNode({ ipAddress, port, mailAddress });
        this.connections.set(node.nodeId, ws);
        console.log(`[Register] Node registered with ID: ${node.nodeId}`);
        ws.send(JSON.stringify({
            type: 'REGISTER',
            success: true,
            node
        }));
    }
    handleLookup(ws, message) {
        const { mailAddress } = message.data;
        console.log(`[Lookup] Looking up node for: ${mailAddress}`);
        const node = registry_1.registryService.getNodeByMail(mailAddress);
        console.log(`[Lookup] Found node:`, node);
        ws.send(JSON.stringify({
            type: 'LOOKUP',
            success: true,
            node
        }));
    }
    handleNodeMessage(message) {
        const { recipient, content } = message.data;
        const node = registry_1.registryService.getNodeByMail(recipient);
        if (node && this.connections.has(node.nodeId)) {
            const ws = this.connections.get(node.nodeId);
            if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'MESSAGE',
                    from: message.senderId,
                    content
                }));
            }
        }
    }
    handleHeartbeat(message) {
        const node = registry_1.registryService.getNodeById(message.senderId);
        if (node) {
            registry_1.registryService.updateHeartbeat(node.nodeId);
        }
    }
    handleBroadcast(message) {
        this.broadcast(message);
    }
    handleEmailSend(message) {
        const { email } = message.data;
        console.log(`[Email] Sending email from ${email.from} to ${email.to}`);
        const recipientNode = registry_1.registryService.getNodeByMail(email.to);
        if (recipientNode && this.connections.has(recipientNode.nodeId)) {
            const ws = this.connections.get(recipientNode.nodeId);
            if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
                console.log(`[Email] Delivering email to node: ${recipientNode.nodeId}`);
                ws.send(JSON.stringify(message));
                // 发送投递确认
                this.sendEmailDelivered(email.id, email.to, message.senderId);
            }
        }
        else {
            console.log(`[Email] Recipient node not found or not connected: ${email.to}`);
        }
    }
    handleEmailReceived(message) {
        const { emailId, recipient } = message.data;
        const senderNode = registry_1.registryService.getNodeById(message.senderId);
        if (senderNode && this.connections.has(senderNode.nodeId)) {
            const ws = this.connections.get(senderNode.nodeId);
            if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        }
    }
    handleEmailDelivered(message) {
        const { emailId, recipient } = message.data;
        const senderNode = registry_1.registryService.getNodeById(message.senderId);
        if (senderNode && this.connections.has(senderNode.nodeId)) {
            const ws = this.connections.get(senderNode.nodeId);
            if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        }
    }
    sendEmailDelivered(emailId, recipient, senderId) {
        const message = {
            type: 'EMAIL_DELIVERED',
            timestamp: Date.now(),
            senderId: 'server',
            data: { emailId, recipient }
        };
        const senderWs = this.connections.get(senderId);
        if (senderWs && senderWs.readyState === ws_1.WebSocket.OPEN) {
            senderWs.send(JSON.stringify(message));
        }
    }
    broadcast(message) {
        this.connections.forEach((ws) => {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        });
    }
    sendToNode(nodeId, message) {
        const ws = this.connections.get(nodeId);
        if (ws && ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
}
exports.WebSocketService = WebSocketService;
