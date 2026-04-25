const feedbackService = require('../services/feedbackService');
const logger = require('../utils/logger');

class FeedbackController {
  async createFeedback(req, res, next) {
    try {
      const { type, title, description, priority, images, contact } = req.body;
      const feedback = await feedbackService.createFeedback(req.user.id, {
        type,
        title,
        description,
        priority,
        images,
        contact
      });
      
      res.json({
        success: true,
        message: 'Feedback created successfully',
        data: feedback
      });
    } catch (error) {
      logger.error('Create feedback error:', error);
      next(error);
    }
  }

  async updateFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, priority, images, contact } = req.body;
      const feedback = await feedbackService.updateFeedback(id, req.user.id, {
        title,
        description,
        priority,
        images,
        contact
      });
      
      res.json({
        success: true,
        message: 'Feedback updated successfully',
        data: feedback
      });
    } catch (error) {
      logger.error('Update feedback error:', error);
      next(error);
    }
  }

  async deleteFeedback(req, res, next) {
    try {
      const { id } = req.params;
      await feedbackService.deleteFeedback(id, req.user.id);
      
      res.json({
        success: true,
        message: 'Feedback deleted successfully'
      });
    } catch (error) {
      logger.error('Delete feedback error:', error);
      next(error);
    }
  }

  async getUserFeedbacks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || 20;
      const { count, rows } = await feedbackService.getUserFeedbacks(req.user.id, page, limit);
      
      res.json({
        success: true,
        data: {
          total: count,
          page: parseInt(page),
          pageSize: parseInt(limit),
          data: rows
        }
      });
    } catch (error) {
      logger.error('Get user feedbacks error:', error);
      next(error);
    }
  }

  async getFeedbackById(req, res, next) {
    try {
      const feedback = await feedbackService.getFeedbackById(req.params.id);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback not found'
        });
      }
      
      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      logger.error('Get feedback by ID error:', error);
      next(error);
    }
  }

  async getFeedbackList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || 20;
      const filters = {
        status: req.query.status ? parseInt(req.query.status) : undefined,
        type: req.query.type,
        priority: req.query.priority ? parseInt(req.query.priority) : undefined,
        keyword: req.query.keyword,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const result = await feedbackService.getFeedbackList(page, limit, filters);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get feedback list error:', error);
      next(error);
    }
  }

  async replyFeedback(req, res, next) {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      const feedback = await feedbackService.replyFeedback(id, { reply }, req.user.id);
      
      res.json({
        success: true,
        message: 'Feedback replied successfully',
        data: feedback
      });
    } catch (error) {
      logger.error('Reply feedback error:', error);
      next(error);
    }
  }

  async updateFeedbackStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const feedback = await feedbackService.updateFeedbackStatus(id, status);
      
      res.json({
        success: true,
        message: 'Feedback status updated successfully',
        data: feedback
      });
    } catch (error) {
      logger.error('Update feedback status error:', error);
      next(error);
    }
  }

  async getFeedbackStats(req, res, next) {
    try {
      const stats = await feedbackService.getFeedbackStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get feedback stats error:', error);
      next(error);
    }
  }
}

module.exports = new FeedbackController();
