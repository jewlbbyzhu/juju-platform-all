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
            { user_id_1: userId, user_id_2: targetUserId },
            { user_id_1: targetUserId, user_id_2: userId }
          ]
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
          user_id_1: userId,
          user_id_2: targetUserId,
          type: 'private',
          last_message: '',
          last_message_time: new Date()
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
            { user_id_1: userId },
            { user_id_2: userId }
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
        order: [['last_message_time', 'DESC']],
        limit: pageSize,
        offset
      });

      const conversationsWithOther = rows.map(conv => {
        const otherUser = conv.user_id_1 === userId ? conv.user2 : conv.user1;
        const unreadCount = 0;
        return {
          id: conv.id,
          otherUser: {
            id: otherUser.id,
            nickname: otherUser.nickname,
            avatar: otherUser.avatar,
            is_vip: otherUser.is_vip
          },
          last_message: conv.last_message,
          last_message_time: conv.last_message_time,
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
            { user_id_1: userId },
            { user_id_2: userId }
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
        { is_read: true },
        { where: { conversation_id: conversationId, is_read: false } }
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
            { user_id_1: userId },
            { user_id_2: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const recipientId = conversation.user_id_1 === userId ? conversation.user_id_2 : conversation.user_id_1;

      const message = await Message.create({
        conversation_id: conversationId,
        sender_id: userId,
        content,
        type: type || 'text',
        is_read: false
      });

      await conversation.update({
        last_message: content.substring(0, 100),
        last_message_time: new Date()
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
            { user_id_1: userId },
            { user_id_2: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      await Message.update(
        { is_read: true },
        { where: { conversation_id: conversationId } }
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
            { user_id_1: userId },
            { user_id_2: userId }
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
            { user_id_1: userId },
            { user_id_2: userId }
          ],
          type: 'private'
        }
      });

      let totalUnread = 0;
      for (const conv of conversations) {
        // unread count not tracked in this model
      }

      return { unread_count: totalUnread };
    } catch (error) {
      logger.error('Get unread message count error:', error);
      throw error;
    }
  }

  async getGroupList(userId) {
    try {
      const { Group, GroupMember } = require('../models');
      const groups = await Group.findAll({
        include: [{
          model: GroupMember,
          as: 'members',
          where: { user_id: userId },
          required: true
        }]
      });
      return groups;
    } catch (error) {
      logger.error('Get group list error:', error);
      throw error;
    }
  }

  async createGroup(userId, name, description, memberIds) {
    try {
      const { Group, GroupMember } = require('../models');
      const group = await Group.create({
        name,
        description,
        owner_id: userId,
        status: 1
      });
      
      // Add owner as member
      await GroupMember.create({
        group_id: group.id,
        user_id: userId,
        role: 'owner'
      });
      
      // Add other members
      if (memberIds && memberIds.length > 0) {
        const members = memberIds.map(id => ({
          group_id: group.id,
          user_id: id,
          role: 'member'
        }));
        await GroupMember.bulkCreate(members);
      }
      
      return group;
    } catch (error) {
      logger.error('Create group error:', error);
      throw error;
    }
  }

  async getGroupMessages(userId, groupId, page = 1, pageSize = 50) {
    try {
      const { GroupMessage, GroupMember } = require('../models');
      const member = await GroupMember.findOne({
        where: { group_id: groupId, user_id: userId }
      });
      if (!member) {
        throw new Error('Not a member of this group');
      }
      const { count, rows } = await GroupMessage.findAndCountAll({
        where: { group_id: groupId },
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
      return { total: count, page, pageSize, data: rows.reverse() };
    } catch (error) {
      logger.error('Get group messages error:', error);
      throw error;
    }
  }

  async sendGroupMessage(userId, groupId, content, type = 'text') {
    try {
      const { GroupMessage, GroupMember } = require('../models');
      const member = await GroupMember.findOne({
        where: { group_id: groupId, user_id: userId }
      });
      if (!member) {
        throw new Error('Not a member of this group');
      }
      const message = await GroupMessage.create({
        group_id: groupId,
        sender_id: userId,
        content,
        type: type || 'text'
      });
      return message;
    } catch (error) {
      logger.error('Send group message error:', error);
      throw error;
    }
  }

  async joinGroup(userId, groupId) {
    try {
      const { GroupMember } = require('../models');
      const [member, created] = await GroupMember.findOrCreate({
        where: { group_id: groupId, user_id: userId },
        defaults: { role: 'member' }
      });
      return { member, isNew: created };
    } catch (error) {
      logger.error('Join group error:', error);
      throw error;
    }
  }

  async leaveGroup(userId, groupId) {
    try {
      const { GroupMember } = require('../models');
      await GroupMember.destroy({
        where: { group_id: groupId, user_id: userId }
      });
      return { success: true };
    } catch (error) {
      logger.error('Leave group error:', error);
      throw error;
    }
  }

  async getGroupMembers(userId, groupId) {
    try {
      const { GroupMember, User } = require('../models');
      const members = await GroupMember.findAll({
        where: { group_id: groupId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar']
        }]
      });
      return members;
    } catch (error) {
      logger.error('Get group members error:', error);
      throw error;
    }
  }

  async searchMessages(userId, keyword, page = 1, pageSize = 20) {
    try {
      const { Message, Conversation } = require('../models');
      const { count, rows } = await Message.findAndCountAll({
        where: {
          content: { [Op.like]: `%${keyword}%` }
        },
        include: [{
          model: Conversation,
          as: 'conversation',
          where: {
            [Op.or]: [
              { user_id_1: userId },
              { user_id_2: userId }
            ]
          }
        }],
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
      return { total: count, page, pageSize, data: rows };
    } catch (error) {
      logger.error('Search messages error:', error);
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

  // 获取单个群组详情（前端兼容性）
  async getGroupDetail(userId, groupId) {
    try {
      const { GroupChat, User } = require('../models');
      const group = await GroupChat.findByPk(groupId, {
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'nickname', 'avatar']
        }]
      });

      if (!group) {
        throw new Error('Group not found');
      }

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        avatar: group.avatar,
        creator: group.creator,
        memberCount: group.member_count || 0,
        createdAt: group.created_at
      };
    } catch (error) {
      logger.error('Get group detail error:', error);
      throw error;
    }
  }

  // 解散群组（前端兼容性）
  async disbandGroup(userId, groupId) {
    try {
      const { GroupChat } = require('../models');
      const group = await GroupChat.findByPk(groupId);

      if (!group) {
        throw new Error('Group not found');
      }

      // 检查是否是群主
      if (group.creator_id !== userId) {
        throw new Error('Only group creator can disband the group');
      }

      await group.destroy();
      return { groupId };
    } catch (error) {
      logger.error('Disband group error:', error);
      throw error;
    }
  }
}

module.exports = new ChatService();
