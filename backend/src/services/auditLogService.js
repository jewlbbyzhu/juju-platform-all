const { AuditLog } = require('../models');
const logger = require('../utils/logger');

class AuditLogService {
  async createAuditLog(data) {
    try {
      return await AuditLog.create({
        user_id: data.userId,
        action: data.action,
        entity_type: data.entityType,
        entity_id: data.entityId,
        old_value: data.oldValue ? JSON.stringify(data.oldValue) : null,
        new_value: data.newValue ? JSON.stringify(data.newValue) : null,
        reason: data.reason,
        ip_address: data.ipAddress,
        user_agent: data.userAgent
      });
    } catch (error) {
      logger.error('Create audit log failed:', error);
      throw error;
    }
  }

  async getAuditLogs(filters = {}) {
    try {
      const where = {};

      if (filters.userId) {
        where.user_id = filters.userId;
      }

      if (filters.entityType) {
        where.entity_type = filters.entityType;
      }

      if (filters.entityId) {
        where.entity_id = filters.entityId;
      }

      if (filters.action) {
        where.action = filters.action;
      }

      const { count, rows } = await AuditLog.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: filters.limit || 100,
        offset: filters.offset || 0
      });

      return {
        total: count,
        data: rows
      };
    } catch (error) {
      logger.error('Get audit logs failed:', error);
      throw error;
    }
  }

  async getAuditLogsByEntity(entityType, entityId) {
    try {
      const logs = await AuditLog.findAll({
        where: {
          entity_type: entityType,
          entity_id: entityId
        },
        order: [['created_at', 'DESC']]
      });

      return logs;
    } catch (error) {
      logger.error('Get audit logs by entity failed:', error);
      throw error;
    }
  }
}

module.exports = new AuditLogService();
