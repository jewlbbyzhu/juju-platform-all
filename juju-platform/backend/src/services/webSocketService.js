const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.heartbeatInterval = 30000;
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', async (ws, req) => {
      try {
        const token = this.extractToken(req);
        if (!token) {
          ws.close(4001, 'Authentication required');
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
          ws.close(4002, 'User not found');
          return;
        }

        ws.userId = user.id;
        ws.lastHeartbeat = Date.now();
        this.clients.set(user.id, ws);

        logger.info(`WebSocket client connected: userId=${user.id}`);

        ws.send(JSON.stringify({
          type: 'connected',
          message: 'WebSocket connection established',
          userId: user.id
        }));

        this.startHeartbeat(ws);

      } catch (error) {
        logger.error('WebSocket connection error:', error);
        ws.close(4003, 'Authentication failed');
      }
    });

    this.wss.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });

    this.wss.on('connection', (ws) => {
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });
    });

    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          if (ws.userId) {
            this.clients.delete(ws.userId);
          }
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, this.heartbeatInterval);

    logger.info('WebSocket service initialized');
  }

  extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.searchParams.get('token');
  }

  startHeartbeat(ws) {
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        }));
      } else {
        clearInterval(interval);
      }
    }, this.heartbeatInterval);
  }

  async sendToUser(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  async sendToMultiple(userIds, message) {
    const results = [];
    for (const userId of userIds) {
      const sent = await this.sendToUser(userId, message);
      results.push({ userId, sent });
    }
    return results;
  }

  async broadcast(message) {
    const results = [];
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        results.push({ userId, sent: true });
      }
    });
    return results;
  }

  async sendNotification(userId, notification) {
    return this.sendToUser(userId, {
      type: 'notification',
      data: notification
    });
  }

  async sendMessage(userId, message) {
    return this.sendToUser(userId, {
      type: 'message',
      data: message
    });
  }

  async sendGroupMessage(groupId, message, excludeUserId = null) {
    const results = [];
    this.clients.forEach((client, userId) => {
      if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'group_message',
          groupId,
          data: message
        }));
        results.push({ userId, sent: true });
      }
    });
    return results;
  }

  async sendOrderUpdate(userId, orderData) {
    return this.sendToUser(userId, {
      type: 'order_update',
      data: orderData
    });
  }

  async sendPaymentResult(userId, paymentData) {
    return this.sendToUser(userId, {
      type: 'payment_result',
      data: paymentData
    });
  }

  async sendRefundStatus(userId, refundData) {
    return this.sendToUser(userId, {
      type: 'refund_status',
      data: refundData
    });
  }

  async sendPartyUpdate(userId, partyData) {
    return this.sendToUser(userId, {
      type: 'party_update',
      data: partyData
    });
  }

  async sendVIPUpdate(userId, vipData) {
    return this.sendToUser(userId, {
      type: 'vip_update',
      data: vipData
    });
  }

  disconnectUser(userId) {
    const client = this.clients.get(userId);
    if (client) {
      client.close(1000, 'Client disconnect');
      this.clients.delete(userId);
      logger.info(`WebSocket client disconnected: userId=${userId}`);
    }
  }

  getConnectedUsers() {
    return Array.from(this.clients.keys());
  }

  getConnectionCount() {
    return this.clients.size;
  }

  isUserOnline(userId) {
    return this.clients.has(userId);
  }
}

module.exports = new WebSocketService();
