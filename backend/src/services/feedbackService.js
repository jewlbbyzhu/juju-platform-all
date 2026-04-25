const { Feedback, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class FeedbackService {
  async getFeedbackById(feedbackId) {
    try {
      const feedback = await Feedback.findByPk(feedbackId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ]
      });

      if (!feedback) {
        throw new Error('Feedback not found');
      }

      return feedback;
    } catch (error) {
      logger.error('Get feedback by ID failed:', error);
      throw error;
    }
  }

  async createFeedback(userId, feedbackData) {
    try {
      const { type, title, description, priority = 0, images, contact } = feedbackData;

      const feedback = await Feedback.create({
        user_id: userId,
        type,
        title,
        description,
        priority,
        images: images || null,
        contact: contact || null,
        status: 0
      });

      return await this.getFeedbackById(feedback.id);
    } catch (error) {
      logger.error('Create feedback failed:', error);
      throw error;
    }
  }

  async updateFeedback(feedbackId, userId, updateData) {
    try {
      const feedback = await Feedback.findByPk(feedbackId);

      if (!feedback) {
        throw new Error('Feedback not found');
      }

      if (feedback.user_id !== userId) {
        throw new Error('Unauthorized: You can only update your own feedback');
      }

      if (feedback.status !== 0) {
        throw new Error('Cannot update feedback that is being processed');
      }

      const { title, description, priority, images, contact } = updateData;

      if (title !== undefined) feedback.title = title;
      if (description !== undefined) feedback.description = description;
      if (priority !== undefined) feedback.priority = priority;
      if (images !== undefined) feedback.images = images;
      if (contact !== undefined) feedback.contact = contact;

      await feedback.save();

      return await this.getFeedbackById(feedbackId);
    } catch (error) {
      logger.error('Update feedback failed:', error);
      throw error;
    }
  }

  async deleteFeedback(feedbackId, userId) {
    try {
      const feedback = await Feedback.findByPk(feedbackId);

      if (!feedback) {
        throw new Error('Feedback not found');
      }

      if (feedback.user_id !== userId) {
        throw new Error('Unauthorized: You can only delete your own feedback');
      }

      await feedback.destroy();

      return true;
    } catch (error) {
      logger.error('Delete feedback failed:', error);
      throw error;
    }
  }

  async getUserFeedbacks(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const where = { user_id: userId };

      const { count, rows } = await Feedback.findAndCountAll({
        where,
        offset,
        limit,
        order: [['created_at', 'DESC']]
      });

      return {
        count,
        rows
      };
    } catch (error) {
      logger.error('Get user feedbacks failed:', error);
      throw error;
    }
  }

  async getFeedbackList(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.priority !== undefined) {
        where.priority = filters.priority;
      }

      if (filters.user_id) {
        where.user_id = filters.user_id;
      }

      if (filters.keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${filters.keyword}%` } },
          { description: { [Op.like]: `%${filters.keyword}%` } }
        ];
      }

      if (filters.start_date && filters.end_date) {
        where.created_at = {
          [Op.gte]: filters.start_date,
          [Op.lte]: filters.end_date
        };
      }

      const { count, rows } = await Feedback.findAndCountAll({
        where,
        offset,
        limit,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        limit,
        data: rows
      };
    } catch (error) {
      logger.error('Get feedback list failed:', error);
      throw error;
    }
  }

  async replyFeedback(feedbackId, replyData, adminId) {
    try {
      const { reply } = replyData;

      const feedback = await Feedback.findByPk(feedbackId);

      if (!feedback) {
        throw new Error('Feedback not found');
      }

      feedback.reply = reply;
      feedback.replied_at = new Date();
      feedback.replied_by = adminId;
      feedback.status = 2; // 已解决

      await feedback.save();

      return await this.getFeedbackById(feedbackId);
    } catch (error) {
      logger.error('Reply feedback failed:', error);
      throw error;
    }
  }

  async updateFeedbackStatus(feedbackId, status) {
    try {
      const feedback = await Feedback.findByPk(feedbackId);

      if (!feedback) {
        throw new Error('Feedback not found');
      }

      feedback.status = status;
      await feedback.save();

      return await this.getFeedbackById(feedbackId);
    } catch (error) {
      logger.error('Update feedback status failed:', error);
      throw error;
    }
  }

  async getFeedbackStats() {
    try {
      const totalFeedbacks = await Feedback.count();
      const pendingFeedbacks = await Feedback.count({ where: { status: 0 } });
      const processingFeedbacks = await Feedback.count({ where: { status: 1 } });
      const resolvedFeedbacks = await Feedback.count({ where: { status: 2 } });
      const closedFeedbacks = await Feedback.count({ where: { status: 3 } });

      const highPriorityFeedbacks = await Feedback.count({ where: { priority: 2 } });

      return {
        total: totalFeedbacks,
        pending: pendingFeedbacks,
        processing: processingFeedbacks,
        resolved: resolvedFeedbacks,
        closed: closedFeedbacks,
        high_priority: highPriorityFeedbacks
      };
    } catch (error) {
      logger.error('Get feedback stats failed:', error);
      throw error;
    }
  }
}

module.exports = new FeedbackService();
