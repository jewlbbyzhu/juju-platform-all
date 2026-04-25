const chatService = require('../services/chatService');
const logger = require('../utils/logger');

class ChatController {
  async createConversation(req, res, next) {
    try {
      const { target_user_id } = req.body;
      const userId = req.user.id;

      const mutualFollow = await chatService.checkMutualFollow(userId, target_user_id);
      if (!mutualFollow) {
        return res.status(403).json({
          success: false,
          message: '需要互相关注才能发起私信'
        });
      }

      const conversation = await chatService.createConversation(userId, target_user_id);

      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      logger.error('Create conversation error:', error);
      next(error);
    }
  }

  async getConversations(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const result = await chatService.getConversations(userId, page, pageSize);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get conversations error:', error);
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const result = await chatService.getMessages(conversationId, userId, page, pageSize);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get messages error:', error);
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const { content, type } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '消息内容不能为空'
        });
      }

      const message = await chatService.sendMessage(userId, conversationId, content, type);

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      logger.error('Send message error:', error);
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;

      const result = await chatService.markMessagesAsRead(userId, conversationId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Mark messages as read error:', error);
      next(error);
    }
  }

  async deleteConversation(req, res, next) {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;

      const result = await chatService.deleteConversation(userId, conversationId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Delete conversation error:', error);
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await chatService.getUnreadMessageCount(userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get unread count error:', error);
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await chatService.deleteMessage(userId, id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Delete message error:', error);
      next(error);
    }
  }

  async recallMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await chatService.recallMessage(userId, id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Recall message error:', error);
      next(error);
    }
  }

  async searchMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const { keyword, page = 1, pageSize = 20 } = req.query;

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: '搜索关键词不能为空'
        });
      }

      const result = await chatService.searchMessages(userId, keyword, parseInt(page), parseInt(pageSize));

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Search messages error:', error);
      next(error);
    }
  }

  // 群组相关方法
  async getGroupList(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await chatService.getGroupList(userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get group list error:', error);
      next(error);
    }
  }

  async createGroup(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, description, memberIds } = req.body;

      const result = await chatService.createGroup(userId, name, description, memberIds);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Create group error:', error);
      next(error);
    }
  }

  async getGroupMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const result = await chatService.getGroupMessages(userId, id, page, pageSize);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get group messages error:', error);
      next(error);
    }
  }

  async sendGroupMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { content, type } = req.body;

      const result = await chatService.sendGroupMessage(userId, id, content, type);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Send group message error:', error);
      next(error);
    }
  }

  async joinGroup(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await chatService.joinGroup(userId, id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Join group error:', error);
      next(error);
    }
  }

  async leaveGroup(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await chatService.leaveGroup(userId, id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Leave group error:', error);
      next(error);
    }
  }

  async getGroupMembers(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await chatService.getGroupMembers(userId, id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get group members error:', error);
      next(error);
    }
  }

  // 上传相关方法
  async uploadImage(req, res, next) {
    try {
      // const userId = req.user.id; // 文件上传功能预留
      // 这里需要处理文件上传
      res.json({
        success: true,
        data: { url: '' }
      });
    } catch (error) {
      logger.error('Upload image error:', error);
      next(error);
    }
  }

  async uploadVoice(req, res, next) {
    try {
      // const userId = req.user.id; // 文件上传功能预留
      // 这里需要处理文件上传
      res.json({
        success: true,
        data: { url: '' }
      });
    } catch (error) {
      logger.error('Upload voice error:', error);
      next(error);
    }
  }

  // 获取单个群组详情（前端兼容性）
  async getGroupDetail(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await chatService.getGroupDetail(userId, id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get group detail error:', error);
      next(error);
    }
  }

  // 解散群组（前端兼容性）
  async disbandGroup(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await chatService.disbandGroup(userId, id);

      res.json({
        success: true,
        message: 'Group disbanded',
        data: result
      });
    } catch (error) {
      logger.error('Disband group error:', error);
      next(error);
    }
  }
}

module.exports = new ChatController();
