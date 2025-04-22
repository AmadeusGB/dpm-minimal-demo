export type MessageType = 
  | 'HEARTBEAT'
  | 'REGISTER'
  | 'LOOKUP'
  | 'MESSAGE'
  | 'BROADCAST'
  | 'EMAIL_SEND'
  | 'EMAIL_RECEIVED'
  | 'EMAIL_DELIVERED';

export interface BaseMessage {
  type: MessageType;
  timestamp: number;
  senderId: string;
}

export interface HeartbeatMessage extends BaseMessage {
  type: 'HEARTBEAT';
}

export interface RegisterMessage extends BaseMessage {
  type: 'REGISTER';
  data: {
    ipAddress: string;
    port: number;
    mailAddress: string;
  };
}

export interface LookupMessage extends BaseMessage {
  type: 'LOOKUP';
  data: {
    mailAddress: string;
  };
}

export interface NodeMessage extends BaseMessage {
  type: 'MESSAGE';
  data: {
    recipient: string;
    content: any;
  };
}

export interface BroadcastMessage extends BaseMessage {
  type: 'BROADCAST';
  data: {
    content: any;
  };
}

export interface EmailMessage extends BaseMessage {
  type: 'EMAIL_SEND';
  data: {
    email: {
      id: string;
      from: string;
      to: string;
      subject: string;
      content: string;
      timestamp: string;
      status?: 'sending' | 'delivered' | 'failed';
    };
  };
}

export interface EmailReceivedMessage extends BaseMessage {
  type: 'EMAIL_RECEIVED';
  data: {
    emailId: string;
    recipient: string;
  };
}

export interface EmailDeliveredMessage extends BaseMessage {
  type: 'EMAIL_DELIVERED';
  data: {
    emailId: string;
    recipient: string;
  };
}

export type WebSocketMessage = 
  | HeartbeatMessage
  | RegisterMessage
  | LookupMessage
  | NodeMessage
  | BroadcastMessage
  | EmailMessage
  | EmailReceivedMessage
  | EmailDeliveredMessage; 