import WebSocket from 'ws';
import { randomUUID } from 'crypto';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || 'ba1147337c2a645316fb88ef1d1b6342ea76e64ade028a1d';
const PROTOCOL_VERSION = 3;

// User → Agent bindings
const USER_AGENT_BINDINGS: Record<string, string> = {
  'mathieu@openclawclient.com': 'agent-mathieu',
  'tania@openclawclient.com': 'agent-tania',
  'ezekiel@openclawclient.com': 'agent-ezekiel',
};

// Default agent for unbound users
const DEFAULT_AGENT = 'main';

export function resolveAgentForUser(email: string): string {
  return USER_AGENT_BINDINGS[email] || DEFAULT_AGENT;
}

export function buildSessionKey(agentId: string, userId: string): string {
  // Use webchat:dm:<userId> format for per-user sessions
  return `agent:${agentId}:webchat:dm:${userId}`;
}

interface PendingRequest {
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

interface ChatDelta {
  runId: string;
  sessionKey: string;
  seq: number;
  state: string;
  delta?: string;
  message?: any;
  errorMessage?: string;
}

type ChatListener = (event: ChatDelta) => void;

class GatewayClient {
  private ws: WebSocket | null = null;
  private connected = false;
  private pendingRequests = new Map<string, PendingRequest>();
  private chatListeners = new Map<string, ChatListener>(); // runId -> listener
  private sessionListeners = new Map<string, ChatListener>(); // sessionKey -> listener
  private reconnectTimer: NodeJS.Timeout | null = null;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔌 Connecting to OpenClaw Gateway at ${GATEWAY_URL}...`);
      this.ws = new WebSocket(GATEWAY_URL);

      this.ws.on('open', () => {
        console.log('🔌 WebSocket open, sending connect handshake...');
        this.sendConnect()
          .then(() => {
            this.connected = true;
            console.log('✅ Connected to OpenClaw Gateway');
            resolve();
          })
          .catch(reject);
      });

      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          this.handleMessage(msg);
        } catch (e) {
          console.error('Failed to parse gateway message:', e);
        }
      });

      this.ws.on('close', () => {
        console.log('🔌 Gateway connection closed');
        this.connected = false;
        this.scheduleReconnect();
      });

      this.ws.on('error', (err) => {
        console.error('Gateway WebSocket error:', err.message);
        if (!this.connected) reject(err);
      });
    });
  }

  private async sendConnect(): Promise<void> {
    const id = randomUUID().slice(0, 8);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Connect handshake timeout'));
      }, 10000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      this.send({
        type: 'req',
        id,
        method: 'connect',
        params: {
          minProtocol: PROTOCOL_VERSION,
          maxProtocol: PROTOCOL_VERSION,
          role: 'operator',
          scopes: ['operator.admin'],
          auth: { mode: 'token', token: GATEWAY_TOKEN },
          client: {
            id: 'openclaw-client-backend',
            displayName: 'OpenClaw Client Backend',
            mode: 'webchat',
            version: '1.0.0',
          },
        },
      });
    });
  }

  private handleMessage(msg: any) {
    // Response to a request
    if (msg.type === 'res' && msg.id) {
      const pending = this.pendingRequests.get(msg.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(msg.id);
        if (msg.ok) {
          pending.resolve(msg.data);
        } else {
          pending.reject(new Error(msg.error?.message || 'Request failed'));
        }
      }
      return;
    }

    // Broadcast events (chat deltas, etc.)
    if (msg.type === 'evt') {
      const { event, data } = msg;
      if (event === 'chat' && data) {
        const delta = data as ChatDelta;
        
        // Route to runId listener
        const runListener = this.chatListeners.get(delta.runId);
        if (runListener) runListener(delta);

        // Route to sessionKey listener
        const sessionListener = this.sessionListeners.get(delta.sessionKey);
        if (sessionListener) sessionListener(delta);
      }
    }
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch((err) => {
        console.error('Gateway reconnect failed:', err.message);
      });
    }, 5000);
  }

  async request(method: string, params: any, timeoutMs = 30000): Promise<any> {
    if (!this.connected || !this.ws) {
      throw new Error('Not connected to gateway');
    }

    const id = randomUUID().slice(0, 8);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request ${method} timeout`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timeout });
      this.send({ type: 'req', id, method, params });
    });
  }

  async sendChat(sessionKey: string, message: string): Promise<string> {
    const idempotencyKey = randomUUID().slice(0, 8);
    const result = await this.request('chat.send', {
      sessionKey,
      message,
      idempotencyKey,
    });
    return result?.runId || idempotencyKey;
  }

  async getChatHistory(sessionKey: string, limit = 50): Promise<any[]> {
    const result = await this.request('chat.history', {
      sessionKey,
      limit,
    });
    return result?.messages || [];
  }

  onChatRun(runId: string, listener: ChatListener) {
    this.chatListeners.set(runId, listener);
  }

  offChatRun(runId: string) {
    this.chatListeners.delete(runId);
  }

  onSession(sessionKey: string, listener: ChatListener) {
    this.sessionListeners.set(sessionKey, listener);
  }

  offSession(sessionKey: string) {
    this.sessionListeners.delete(sessionKey);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const gatewayClient = new GatewayClient();
