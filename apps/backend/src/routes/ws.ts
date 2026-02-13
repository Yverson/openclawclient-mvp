import { Router } from 'express';
import { verifyToken } from '../services/auth.js';
import { gatewayClient, resolveAgentForUser, buildSessionKey } from '../services/gateway.js';
import { getUserById } from '../services/database.js';

export function setupWebSocketRoutes(app: any) {
  app.ws('/ws', async (ws: any, req: any) => {
    const token = req.query.token;

    if (!token) {
      ws.close(4001, 'Missing token');
      return;
    }

    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      ws.close(4003, 'Invalid token');
      return;
    }

    const userId = decoded.userId;
    const email = decoded.email;

    // Resolve which agent this user is bound to
    const agentId = resolveAgentForUser(email);
    const sessionKey = buildSessionKey(agentId, userId);

    console.log(`🔗 User ${email} → agent ${agentId} (session: ${sessionKey})`);

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      userId,
      agentId,
      timestamp: new Date().toISOString(),
    }));

    // Listen for agent responses on this session
    const sessionListener = (event: any) => {
      try {
        if (event.state === 'delta' && event.delta) {
          ws.send(JSON.stringify({
            type: 'typing',
            timestamp: new Date().toISOString(),
          }));
        } else if (event.state === 'final' && event.message) {
          const content = typeof event.message === 'string'
            ? event.message
            : event.message.content?.[0]?.text || event.message.text || JSON.stringify(event.message);

          ws.send(JSON.stringify({
            type: 'message',
            data: {
              id: `msg-${Date.now()}`,
              content,
              sender: 'assistant',
              timestamp: new Date().toISOString(),
              read: false,
            },
          }));
        } else if (event.state === 'error') {
          ws.send(JSON.stringify({
            type: 'error',
            error: event.errorMessage || 'Agent error',
            timestamp: new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.error('Error sending to client:', e);
      }
    };

    gatewayClient.onSession(sessionKey, sessionListener);

    // Handle incoming messages from user
    ws.on('message', async (msg: string) => {
      try {
        const data = JSON.parse(msg);

        if (data.type === 'message' && data.content) {
          if (!gatewayClient.isConnected()) {
            ws.send(JSON.stringify({
              type: 'error',
              error: 'Gateway not connected',
              timestamp: new Date().toISOString(),
            }));
            return;
          }

          console.log(`📨 ${email} → ${agentId}: "${data.content.substring(0, 50)}..."`);

          try {
            const runId = await gatewayClient.sendChat(sessionKey, data.content);
            console.log(`🚀 Chat sent, runId: ${runId}`);
          } catch (err: any) {
            console.error('Failed to send to gateway:', err.message);
            ws.send(JSON.stringify({
              type: 'error',
              error: 'Failed to send message to agent',
              timestamp: new Date().toISOString(),
            }));
          }
        }
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          timestamp: new Date().toISOString(),
        }));
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket closed for user ${email}`);
      gatewayClient.offSession(sessionKey);
    });

    ws.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      gatewayClient.offSession(sessionKey);
    });

    // Load and send chat history
    try {
      const history = await gatewayClient.getChatHistory(sessionKey, 50);
      if (history.length > 0) {
        ws.send(JSON.stringify({
          type: 'history',
          messages: history.map((m: any, i: number) => ({
            id: `hist-${i}`,
            content: typeof m.content === 'string' ? m.content
              : m.content?.[0]?.text || JSON.stringify(m.content),
            sender: m.role === 'user' ? 'user' : 'assistant',
            timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
            read: true,
          })),
        }));
      }
    } catch (err: any) {
      console.log('Could not load history:', err.message);
    }
  });
}

export default Router();
