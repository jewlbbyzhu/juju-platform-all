const { Group, GroupMember, GroupMessage, User, Party, Order, Ticket } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const webSocketService = require('./webSocketService');

class GroupChatService {
  async createGroup(creatorId, groupData) {
    try {
      const group = await Group.create({
        name: groupData.name,
        description: groupData.description || '',
        creator_id: creatorId,
        type: groupData.type || 'party',
        party_id: groupData.party_id || null,
        max_members: groupData.max_members || 100,
        is_public: groupData.is_public !== false
      });

      await GroupMember.create({
        group_id: group.id,
        user_id: creatorId,
        role: 'admin',
        joined_at: new Date()
      });

      return await this.getGroupById(group.id);
    } catch (error) {
      logger.error('Create group error:', error);
      throw error;
    }
  }

  async createPartyGroup(partyId, creatorId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      const existingGroup = await Group.findOne({
        where: { party_id: partyId, type: 'party' }
      });

      if (existingGroup) {
        return existingGroup;
      }

      const group = await this.createGroup(creatorId, {
        name: `${party.title} 群聊`,
        description: `聚会「${party.title}」的讨论群`,
        type: 'party',
        party_id: partyId,
        max_members: 100
      });

      return group;
    } catch (error) {
      logger.error('Create party group error:', error);
      throw error;
    }
  }

  async getGroupById(groupId) {
    try {
      const group = await Group.findByPk(groupId, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'nickname', 'avatar']
          },
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'images', 'start_time']
          }
        ]
      });

      if (!group) {
        throw new Error('Group not found');
      }

      const memberCount = await GroupMember.count({ where: { group_id: groupId } });

      return {
        ...group.toJSON(),
        member_count: memberCount
      };
    } catch (error) {
      logger.error('Get group by ID error:', error);
      throw error;
    }
  }

  async getGroups(userId, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;

      const userGroups = await GroupMember.findAll({
        where: { user_id: userId },
        attributes: ['group_id', 'role', 'joined_at'],
        order: [['joined_at', 'DESC']],
        limit: pageSize,
        offset
      });

      const groupIds = userGroups.map(ug => ug.group_id);

      const { count, rows } = await Group.findAndCountAll({
        where: { id: groupIds },
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'nickname', 'avatar']
          },
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'images']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const groupsWithRole = rows.map(group => {
        const userGroup = userGroups.find(ug => ug.group_id === group.id);
        return {
          ...group.toJSON(),
          role: userGroup?.role || 'member',
          joined_at: userGroup?.joined_at
        };
      });

      return {
        total: count,
        page,
        pageSize,
        data: groupsWithRole
      };
    } catch (error) {
      logger.error('Get groups error:', error);
      throw error;
    }
  }

  async getGroupMembers(groupId, page = 1, pageSize = 50) {
    try {
      const offset = (page - 1) * pageSize;

      const { count, rows } = await GroupMember.findAndCountAll({
        where: { group_id: groupId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar', 'is_vip']
          }
        ],
        order: [
          ['role', 'ASC'],
          ['joined_at', 'ASC']
        ],
        limit: pageSize,
        offset
      });

      return {
        total: count,
        page,
        pageSize,
        data: rows
      };
    } catch (error) {
      logger.error('Get group members error:', error);
      throw error;
    }
  }

  async joinGroup(userId, groupId) {
    try {
      const group = await Group.findByPk(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      const existingMember = await GroupMember.findOne({
        where: { group_id: groupId, user_id: userId }
      });

      if (existingMember) {
        return { message: 'Already a member', is_member: true };
      }

      const memberCount = await GroupMember.count({ where: { group_id: groupId } });
      if (memberCount >= group.max_members) {
        throw new Error('Group is full');
      }

      if (group.type === 'party') {
        const hasTicket = await this.checkUserHasPartyTicket(userId, group.party_id);
        if (!hasTicket) {
          throw new Error('You need a ticket to join this group');
        }
      }

      await GroupMember.create({
        group_id: groupId,
        user_id: userId,
        role: 'member',
        joined_at: new Date()
      });

      const groupAfterJoin = await this.getGroupById(groupId);

      await webSocketService.sendGroupMessage(groupId, {
        type: 'member_joined',
        userId,
        groupId,
        timestamp: new Date()
      }, userId);

      return {
        message: 'Joined successfully',
        group: groupAfterJoin
      };
    } catch (error) {
      logger.error('Join group error:', error);
      throw error;
    }
  }

  async leaveGroup(userId, groupId) {
    try {
      const member = await GroupMember.findOne({
        where: { group_id: groupId, user_id: userId }
      });

      if (!member) {
        throw new Error('Not a member of this group');
      }

      const group = await Group.findByPk(groupId);
      if (group.creator_id === userId && member.role === 'admin') {
        throw new Error('Creator cannot leave the group');
      }

      await member.destroy();

      await webSocketService.sendGroupMessage(groupId, {
        type: 'member_left',
        userId,
        groupId,
        timestamp: new Date()
      });

      return { message: 'Left successfully' };
    } catch (error) {
      logger.error('Leave group error:', error);
      throw error;
    }
  }

  async removeMember(adminId, groupId, targetUserId) {
    try {
      const adminMember = await GroupMember.findOne({
        where: { group_id: groupId, user_id: adminId, role: 'admin' }
      });

      if (!adminMember) {
        throw new Error('You are not an admin');
      }

      const targetMember = await GroupMember.findOne({
        where: { group_id: groupId, user_id: targetUserId }
      });

      if (!targetMember) {
        throw new Error('Target user is not a member');
      }

      if (targetMember.role === 'admin' && adminMember.role !== 'creator') {
        throw new Error('Cannot remove another admin');
      }

      await targetMember.destroy();

      await webSocketService.sendGroupMessage(groupId, {
        type: 'member_removed',
        userId: targetUserId,
        groupId,
        timestamp: new Date()
      });

      return { message: 'Member removed successfully' };
    } catch (error) {
      logger.error('Remove member error:', error);
      throw error;
    }
  }

  async sendGroupMessage(userId, groupId, content, type = 'text') {
    try {
      const member = await GroupMember.findOne({
        where: { group_id: groupId, user_id: userId }
      });

      if (!member) {
        throw new Error('You are not a member of this group');
      }

      const message = await GroupMessage.create({
        group_id: groupId,
        sender_id: userId,
        content,
        type: type || 'text'
      });

      const messageWithSender = await GroupMessage.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'nickname', 'avatar']
          }
        ]
      });

      await webSocketService.sendGroupMessage(groupId, {
        type: 'message',
        groupId,
        data: messageWithSender
      }, userId);

      return messageWithSender;
    } catch (error) {
      logger.error('Send group message error:', error);
      throw error;
    }
  }

  async getGroupMessages(groupId, userId, page = 1, pageSize = 50) {
    try {
      const member = await GroupMember.findOne({
        where: { group_id: groupId, user_id: userId }
      });

      if (!member) {
        throw new Error('You are not a member of this group');
      }

      const offset = (page - 1) * pageSize;

      const { count, rows } = await GroupMessage.findAndCountAll({
        where: { group_id: groupId },
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

      return {
        total: count,
        page,
        pageSize,
        data: rows.reverse()
      };
    } catch (error) {
      logger.error('Get group messages error:', error);
      throw error;
    }
  }

  async getGroupUnreadCount(userId, groupId) {
    try {
      const member = await GroupMember.findOne({
        where: { group_id: groupId, user_id: userId }
      });

      if (!member) {
        throw new Error('Not a member');
      }

      const lastRead = member.last_read_at || new Date(0);
      const unreadCount = await GroupMessage.count({
        where: {
          group_id: groupId,
          created_at: { [Op.gt]: lastRead }
        }
      });

      return { unread_count: unreadCount };
    } catch (error) {
      logger.error('Get group unread count error:', error);
      throw error;
    }
  }

  async markGroupMessagesAsRead(userId, groupId) {
    try {
      await GroupMember.update(
        { last_read_at: new Date() },
        { where: { group_id: groupId, user_id: userId } }
      );

      return { success: true };
    } catch (error) {
      logger.error('Mark group messages as read error:', error);
      throw error;
    }
  }

  async updateGroupInfo(adminId, groupId, updateData) {
    try {
      const adminMember = await GroupMember.findOne({
        where: { group_id: groupId, user_id: adminId, role: 'admin' }
      });

      if (!adminMember) {
        throw new Error('You are not an admin');
      }

      const allowedFields = ['name', 'description', 'max_members', 'is_public'];
      const updates = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      await Group.update(updates, { where: { id: groupId } });

      return await this.getGroupById(groupId);
    } catch (error) {
      logger.error('Update group info error:', error);
      throw error;
    }
  }

  async disbandGroup(creatorId, groupId) {
    try {
      const group = await Group.findOne({
        where: { id: groupId, creator_id: creatorId }
      });

      if (!group) {
        throw new Error('Group not found or you are not the creator');
      }

      await GroupMessage.destroy({ where: { group_id: groupId } });
      await GroupMember.destroy({ where: { group_id: groupId } });
      await group.destroy();

      return { message: 'Group disbanded successfully' };
    } catch (error) {
      logger.error('Disband group error:', error);
      throw error;
    }
  }

  async checkUserHasPartyTicket(userId, partyId) {
    const ticket = await Ticket.findOne({
      where: {
        user_id: userId,
        party_id: partyId,
        status: { [Op.in]: ['active', 'used'] }
      },
      include: [{
        model: Order,
        as: 'order',
        where: { status: 1 }
      }]
    });

    return !!ticket;
  }
}

module.exports = new GroupChatService();
