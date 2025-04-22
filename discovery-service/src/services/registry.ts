import { Node, NodeRegistrationRequest } from '../types/node';
import { v4 as uuidv4 } from 'uuid';

class RegistryService {
  private nodes: Map<string, Node>;
  private heartbeatTimeout: number;

  constructor(heartbeatTimeout: number = 30000) { // 30 seconds
    this.nodes = new Map();
    this.heartbeatTimeout = heartbeatTimeout;
    this.startHeartbeatCheck();
  }

  registerNode(request: NodeRegistrationRequest): Node {
    const nodeId = uuidv4();
    const node: Node = {
      nodeId,
      ...request,
      status: 'online',
      lastHeartbeat: Date.now()
    };
    
    this.nodes.set(nodeId, node);
    return node;
  }

  getNodeByMail(mailAddress: string): Node | undefined {
    for (const node of this.nodes.values()) {
      if (node.mailAddress === mailAddress && node.status === 'online') {
        return node;
      }
    }
    return undefined;
  }

  getNodeById(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  updateHeartbeat(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.lastHeartbeat = Date.now();
      node.status = 'online';
      this.nodes.set(nodeId, node);
      return true;
    }
    return false;
  }

  private startHeartbeatCheck() {
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

  getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }
}

export const registryService = new RegistryService(); 