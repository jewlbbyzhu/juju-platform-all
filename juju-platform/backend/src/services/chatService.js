const { Conversation, Message, User, Follow } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const webSocketService = require('./webSocketService');

class ChatService {
  async createConversation(userId, targetUserId) {
    try {
      let conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1_id: userId, user2_id: targetUserId },
            { user1_id: targetUserId, user2_id: userId }
          ],
          type: 'private'
        }
      });

      if (!conversation) {
        const [user1, user2] = await Promise.all([
          User.findByPk(userId),
          User.findByPk(targetUserId)
        ]);

        if (!user1 || !user2) {
          throw new Error('User not found');
        }

        conversation = await Conversation.create({
          user1_id: userId,
          user2_id: targetUserId,
          type: 'private',
          last_message: '',
          last_message_at: new Date()
        });

        conversation = await Conversation.findByPk(conversation.id, {
          include: [
            {
              model: User,
              as: 'user1',
              attributes: ['id', 'nickname', 'avatar', 'is_vip']
            },
            {
              model: User,
              as: 'user2',
              attributes: ['id', 'nickname', 'avatar', 'is_vip']
            }
          ]
        });
      }

      return conversation;
    } catch (error) {
      logger.error('Create conversation error:', error);
      throw error;
    }
  }

  async getConversations(userId, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Conversation.findAndCountAll({
        where: {
          [Op.or]: [
            { user1_id: userId },
            { user2_id: userId }
          ],
          type: 'private'
        },
        include: [
          {
            model: User,
            as: 'user1',
            attributes: ['id', 'nickname', 'avatar', 'is_vip']
          },
          {
            model: User,
            as: 'user2',
            attributes: ['id', 'nickname', 'avatar', 'is_vip']
          }
        ],
        order: [['last_message_at', 'DESC']],
        limit: pageSize,
        offset
      });

      const conversationsWithOther = rows.map(conv => {
        const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
        const unreadCount = conv.user1_id === userId ? conv.unread1 : conv.unread2;
        return {
          id: conv.id,
          otherUser: {
            id: otherUser.id,
            nickname: otherUser.nickname,
            avatar: otherUser.avatar,
            is_vip: otherUser.is_vip
          },
          last_message: conv.last_message,
          last_message_at: conv.last_message_at,
          unread_count: unreadCount,
          created_at: conv.created_at
        };
      });

      return {
        total: count,
        page,
        pageSize,
        data: conversationsWithOther
      };
    } catch (error) {
      logger.error('Get conversations error:', error);
      throw error;
    }
  }

  async getMessages(conversationId, userId, page = 1, pageSize = 50) {
    try {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1_id: userId },
            { user2_id: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const offset = (page - 1) * pageSize;

      const { count, rows } = await Message.findAndCountAll({
        where: { conversation_id: conversationId },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'nickname', 'avatar']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset
      });

      await Message.update(
        { 
          [conversation.user1_id === userId ? 'read1' : 'read2']: true 
        },
        { 
          where: { 
            conversation_id: conversationId,
            [conversation.user1_id === userId ? 'read1' : 'read2']: false
          }
        }
      );

      await Conversation.update(
        { 
          [conversation.user1_id === userId ? 'unread1' : 'unread2']: 0 
        },
        { where: { id: conversationId } }
      );

      return {
        total: count,
        page,
        pageSize,
        data: rows.reverse()
      };
    } catch (error) {
      logger.error('Get messages error:', error);
      throw error;
    }
  }

  async sendMessage(userId, conversationId, content, type = 'text') {
    try {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1_id: userId },
            { user2_id: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const recipientId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;

      const message = await Message.create({
        conversation_id: conversationId,
        sender_id: userId,
        content,
        type: type || 'text',
        read1: userId === conversation.user1_id,
        read2: userId === conversation.user2_id
      });

      await conversation.update({
        last_message: content.substring(0, 100),
        last_message_at: new Date()
      });

      const messageWithSender = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'nickname', 'avatar']
          }
        ]
      });

      const recipient = await User.findByPk(recipientId);
      if (recipient && webSocketService.isUserOnline(recipientId)) {
        await webSocketService.sendMessage(recipientId, {
          conversationId,
          message: messageWithSender
        });
      }

      return messageWithSender;
    } catch (error) {
      logger.error('Send message error:', error);
      throw error;
    }
  }

  async markMessagesAsRead(userId, conversationId) {
    try {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1_id: userId },
            { user2_id: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      await Message.update(
        { [conversation.user1_id === userId ? 'read1' : 'read2']: true },
        { where: { conversation_id: conversationId } }
      );

      await Conversation.update(
        { [conversation.user1_id === userId ? 'unread1' : 'unread2']: 0 },
        { where: { id: conversationId } }
      );

      return { success: true };
    } catch (error) {
      logger.error('Mark messages as read error:', error);
      throw error;
    }
  }

  async deleteConversation(userId, conversationId) {
    try {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1_id: userId },
            { user2_id: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      await Message.destroy({ where: { conversation_id: conversationId } });
      await conversation.destroy();

      return { success: true, message: 'Conversation deleted' };
    } catch (error) {
      logger.error('Delete conversation error:', error);
      throw error;
    }
  }

  async getUnreadMessageCount(userId) {
    try {
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { user1_id: userId },
            { user2_id: userId }
          ],
          type: 'private'
        }
      });

      let totalUnread = 0;
      for (const conv of conversations) {
        if (conv.user1_id === userId) {
          totalUnread += conv.unread1 || 0;
        } else {
          totalUnread += conv.unread2 || 0;
        }
      }

      return { unread_count: totalUnread };
    } catch (error) {
      logger.error('Get unread message count error:', error);
      throw error;
    }
  }

  async checkMutualFollow(userId, targetUserId) {
    const follow1 = await Follow.findOne({
      where: {
        follower_id: userId,
        following_id: targetUserId,
        status: 1
      }
    });

    const follow2 = await Follow.findOne({
      where: {
        follower_id: targetUserId,
        following_id: userId,
        status: 1
      }
    });

    return !!(follow1 && follow2);
  }
}

module.exports = new ChatService();
