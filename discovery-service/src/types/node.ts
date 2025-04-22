export interface Node {
  nodeId: string;
  ipAddress: string;
  port: number;
  mailAddress: string;
  status: 'online' | 'offline';
  lastHeartbeat: number;
}

export interface NodeRegistrationRequest {
  ipAddress: string;
  port: number;
  mailAddress: string;
}

export interface NodeRegistrationResponse {
  nodeId: string;
  success: boolean;
  message?: string;
}

export interface NodeLookupRequest {
  mailAddress: string;
}

export interface NodeLookupResponse {
  success: boolean;
  node?: Node;
  message?: string;
}

export interface HeartbeatRequest {
  nodeId: string;
}

export interface HeartbeatResponse {
  success: boolean;
  message?: string;
} 