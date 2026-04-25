const groupChatService = require('../services/groupChatService');
const logger = require('../utils/logger');

class GroupChatController {
  async createGroup(req, res, next) {
    try {
      const userId = req.user.id;
      const groupData = req.body;

      const group = await groupChatService.createGroup(userId, groupData);

      res.json({
        success: true,
        data: group
      });
    } catch (error) {
      logger.error('Create group error:', error);
      next(error);
    }
  }

  async createPartyGroup(req, res, next) {
    try {
      const userId = req.user.id;
      const { partyId } = req.params;

      const group = await groupChatService.createPartyGroup(partyId, userId);

      res.json({
        success: true,
        data: group
      });
    } catch (error) {
      logger.error('Create party group error:', error);
      next(error);
    }
  }

  async getGroups(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const result = await groupChatService.getGroups(userId, page, pageSize);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get groups error:', error);
      next(error);
    }
  }

  async getGroup(req, res, next) {
    try {
      const { groupId } = req.params;

      const group = await groupChatService.getGroupById(groupId);

      res.json({
        success: true,
        data: group
      });
    } catch (error) {
      logger.error('Get group error:', error);
      next(error);
    }
  }

  async getGroupMembers(req, res, next) {
    try {
      const { groupId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const result = await groupChatService.getGroupMembers(groupId, page, pageSize);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get group members error:', error);
      next(error);
    }
  }

  async joinGroup(req, res, next) {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;

      const result = await groupChatService.joinGroup(userId, groupId);

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
      const { groupId } = req.params;

      const result = await groupChatService.leaveGroup(userId, groupId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Leave group error:', error);
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      const adminId = req.user.id;
      const { groupId, userId: targetUserId } = req.params;

      const result = await groupChatService.removeMember(adminId, groupId, targetUserId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Remove member error:', error);
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
      const { content, type } = req.body;

      if (!content || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: '消息内容不能为空'
        });
      }

      const message = await groupChatService.sendMessage(userId, groupId, content, type);

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      logger.error('Send group message error:', error);
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 50;

      const result = await groupChatService.getGroupMessages(groupId, userId, page, pageSize);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get group messages error:', error);
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;

      const result = await groupChatService.getGroupUnreadCount(userId, groupId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get group unread count error:', error);
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;

      const result = await groupChatService.markGroupMessagesAsRead(userId, groupId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Mark group messages as read error:', error);
      next(error);
    }
  }

  async updateGroupInfo(req, res, next) {
    try {
      const adminId = req.user.id;
      const { groupId } = req.params;
      const updateData = req.body;

      const result = await groupChatService.updateGroupInfo(adminId, groupId, updateData);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Update group info error:', error);
      next(error);
    }
  }

  async disbandGroup(req, res, next) {
    try {
      const creatorId = req.user.id;
      const { groupId } = req.params;

      const result = await groupChatService.disbandGroup(creatorId, groupId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Disband group error:', error);
      next(error);
    }
  }
}

module.exports = new GroupChatController();
