"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registryService = void 0;
const uuid_1 = require("uuid");
class RegistryService {
    constructor(heartbeatTimeout = 30000) {
        this.nodes = new Map();
        this.heartbeatTimeout = heartbeatTimeout;
        this.startHeartbeatCheck();
    }
    registerNode(request) {
        const nodeId = (0, uuid_1.v4)();
        const node = {
            nodeId,
            ...request,
            status: 'online',
            lastHeartbeat: Date.now()
        };
        this.nodes.set(nodeId, node);
        return node;
    }
    getNodeByMail(mailAddress) {
        for (const node of this.nodes.values()) {
            if (node.mailAddress === mailAddress && node.status === 'online') {
                return node;
            }
        }
        return undefined;
    }
    getNodeById(nodeId) {
        return this.nodes.get(nodeId);
    }
    updateHeartbeat(nodeId) {
        const node = this.nodes.get(nodeId);
        if (node) {
            node.lastHeartbeat = Date.now();
            node.status = 'online';
            this.nodes.set(nodeId, node);
            return true;
        }
        return false;
    }
    startHeartbeatCheck() {
        setInterval(() => {
            const now = Date.now();
            for (const [nodeId, node] of this.nodes.entries()) {
                if (now - node.lastHeartbeat > this.heartbeatTimeout) {
                    node.status = 'offline';
                    this.nodes.set(nodeId, node);
                }
            }
        }, this.heartbeatTimeout);
    }
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
}
exports.registryService = new RegistryService();
