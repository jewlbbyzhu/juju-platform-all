const { Party, Order, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { sendNotification } = require('./notificationService');

class AutoCancelService {
  async checkAndCancelParties() {
    try {
      logger.info('Starting auto-cancel parties check...');

      const now = new Date();
      const partiesToCheck = await Party.findAll({
        where: {
          status: 1,
          min_participants: {
            [Op.ne]: null
          },
          registration_deadline: {
            [Op.lte]: now
          }
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ]
      });

      let cancelledCount = 0;
      // const notifiedCount = 0; // TODO: 实现通知功能

      for (const party of partiesToCheck) {
        const participantCount = await Order.count({
          where: {
            party_id: party.id,
            status: 1
          }
        });

        if (participantCount < party.min_participants) {
          await this.cancelParty(party, participantCount);
          cancelledCount++;
        } else {
          logger.info(`Party ${party.id} has ${participantCount} participants, meets minimum ${party.min_participants}`);
        }
      }

      logger.info(`Auto-cancel check completed. Cancelled: ${cancelledCount}, Checked: ${partiesToCheck.length}`);

      return {
        cancelled_count: cancelledCount,
        checked_count: partiesToCheck.length,
        message: `自动取消检查完成，共检查 ${partiesToCheck.length} 个聚会，取消 ${cancelledCount} 个聚会`
      };
    } catch (error) {
      logger.error('Auto-cancel parties failed:', error);
      throw error;
    }
  }

  async cancelParty(party, participantCount) {
    const TransactionManager = require('../utils/transactionManager');
    
    return await TransactionManager.execute(async (t) => {
      await Party.update(
        { 
          status: 4
        },
        { where: { id: party.id }, transaction: t }
      );

      const participants = await Order.findAll({
        where: {
          party_id: party.id,
          status: 1
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ],
        transaction: t
      });

      // 更新所有参与订单状态为已取消
      await Order.update(
        { status: 3, cancel_time: new Date() },
        { where: { party_id: party.id, status: 1 }, transaction: t }
      );

      logger.info(`Party ${party.id} auto-cancelled due to insufficient participants`);
      
      return { participants, cancelled: true };
    }).then(async (result) => {
      // 在事务外发送通知
      const { participants } = result;
      
      for (const participant of participants) {
        await sendNotification({
          user_id: participant.user_id,
          type: 'party_cancelled',
          title: '聚会已取消',
          content: `您报名的聚会"${party.title}"因报名人数不足已取消`,
          related_id: party.id,
          related_type: 'party'
        });
      }

      await sendNotification({
        user_id: party.user_id,
        type: 'party_cancelled',
        title: '聚会已自动取消',
        content: `您的聚会"${party.title}"因报名人数不足已自动取消（${participantCount}/${party.min_participants}人）`,
        related_id: party.id,
        related_type: 'party'
      });

      return result;
    });
  }

  async getPartiesToCancel() {
    try {
      const now = new Date();
      const parties = await Party.findAll({
        where: {
          status: 1,
          min_participants: {
            [Op.ne]: null
          },
          registration_deadline: {
            [Op.lte]: now
          }
        },
        include: [
          {
            model: Order,
            as: 'orders',
            where: { status: 1 },
            required: false
          }
        ]
      });

      const partiesToCancel = [];

      for (const party of parties) {
        const participantCount = party.orders ? party.orders.length : 0;
        if (participantCount < party.min_participants) {
          partiesToCancel.push({
            ...party.toJSON(),
            participant_count: participantCount
          });
        }
      }

      return partiesToCancel;
    } catch (error) {
      logger.error('Get parties to cancel failed:', error);
      throw error;
    }
  }
}

module.exports = new AutoCancelService();
