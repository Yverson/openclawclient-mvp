import { Router } from 'express';
import { verifyToken } from '../services/auth.js';

export function setupWebSocketRoutes(app: any) {
  // WebSocket handler for chat
  app.ws('/ws', (ws: any, req: any) => {
    const token = req.query.token;
    
    if (!token) {
      ws.close(4001, 'Missing token');
      return;
    }

    try {
      const decoded = verifyToken(token);
      
      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connected',
        userId: decoded.userId,
        timestamp: new Date().toISOString()
      }));

      // Handle incoming messages
      ws.on('message', (msg: string) => {
        try {
          const data = JSON.parse(msg);
          
          // Echo the message back with assistant response
          if (data.type === 'message') {
            ws.send(JSON.stringify({
              type: 'response',
              role: 'assistant',
              content: `Mock response to: "${data.content}"`,
              timestamp: new Date().toISOString()
            }));
          }
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      });

      ws.on('close', () => {
        console.log(`WebSocket closed for user ${decoded.userId}`);
      });

      ws.on('error', (error: any) => {
        console.error('WebSocket error:', error);
      });
    } catch (error) {
      ws.close(4003, 'Invalid token');
    }
  });
}

export default Router();
