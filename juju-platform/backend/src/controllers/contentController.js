/* eslint-disable no-unused-vars */
const { Banner, Announcement } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const toBannerDTO = (b) => ({
  id: b.id,
  title: b.title,
  imageUrl: b.image_url,
  linkUrl: b.link_url,
  sortOrder: b.sort_order,
  status: b.status,
  createdAt: b.created_at,
  updatedAt: b.updated_at
});

const toAnnouncementDTO = (a) => ({
  id: a.id,
  title: a.title,
  content: a.content,
  type: a.type,
  status: a.status,
  publishedAt: a.published_at,
  createdAt: a.created_at,
  updatedAt: a.updated_at
});

const toArticleDTO = (a) => ({
  id: a.id,
  title: a.title,
  content: a.content,
  category: a.category,
  type: a.type,
  status: a.status,
  publishedAt: a.published_at,
  createdAt: a.created_at,
  updatedAt: a.updated_at
});

class ContentController {
  // Articles
  async getArticles(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const type = req.query.type;
      const category = req.query.category;
      const offset = (page - 1) * pageSize;
      const where = {};
      
      // 支持按类型过滤
      if (type) where.type = type;
      
      // 支持按分类过滤（帮助文档分类）
      if (category) where.category = category;
      
      // 帮助文档默认只查询已发布的
      if (type === 'help' || category) {
        where.status = 'published';
      }
      
      const { count, rows } = await Announcement.findAndCountAll({ 
        where, 
        offset, 
        limit: pageSize, 
        order: [['created_at', 'DESC']]
      });
      res.json({ success: true, data: { list: rows.map(toArticleDTO), total: count, page, pageSize } });
    } catch (error) {
      logger.error('Get articles error:', error);
      res.json({ success: true, data: { list: [], total: 0, page: 1, pageSize: parseInt(req.query.pageSize) || 20 } });
    }
  }

  async getArticleDetail(req, res, next) { // eslint-disable-line no-unused-vars
    try {
      const article = await Announcement.findByPk(parseInt(req.params.id));
      if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
      res.json({ success: true, data: toArticleDTO(article) });
    } catch (error) { logger.error('Get article detail error:', error); next(error); }
  }

  // Banners
  async getBanners(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const keyword = req.query.keyword;
      const status = req.query.status;
      const offset = (page - 1) * pageSize;
      const where = {};
      if (keyword) where.title = { [Op.like]: `%${keyword}%` };
      if (status) where.status = status;
      const { count, rows } = await Banner.findAndCountAll({ where, offset, limit: pageSize, order: [['sort_order', 'ASC'], ['created_at', 'DESC']] });
      res.json({ success: true, data: { items: rows.map(toBannerDTO), total: count, page, pageSize } });
    } catch (error) {
      logger.error('Get banners error:', error);
      res.json({ success: true, data: { list: [], total: 0, page: 1, pageSize: parseInt(req.query.pageSize) || 20 } });
    }
  }

  async getBannerDetail(req, res, next) {
    try {
      const banner = await Banner.findByPk(parseInt(req.params.id));
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      res.json({ success: true, data: toBannerDTO(banner) });
    } catch (error) { logger.error('Get banner detail error:', error); next(error); }
  }

  async createBanner(req, res, next) {
    try {
      const { title, imageUrl, linkUrl, sortOrder, status } = req.body;
      const banner = await Banner.create({ title, image_url: imageUrl, link_url: linkUrl, sort_order: sortOrder ?? 0, status: status ?? 'inactive' });
      res.json({ success: true, data: toBannerDTO(banner) });
    } catch (error) { logger.error('Create banner error:', error); next(error); }
  }

  async updateBanner(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const { title, imageUrl, linkUrl, sortOrder, status } = req.body;
      const banner = await Banner.findByPk(id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      banner.title = title ?? banner.title;
      banner.image_url = imageUrl ?? banner.image_url;
      banner.link_url = linkUrl ?? banner.link_url;
      banner.sort_order = sortOrder ?? banner.sort_order;
      banner.status = status ?? banner.status;
      await banner.save();
      res.json({ success: true, data: toBannerDTO(banner) });
    } catch (error) { logger.error('Update banner error:', error); next(error); }
  }

  async deleteBanner(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const banner = await Banner.findByPk(id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      await banner.destroy();
      res.json({ success: true, data: true });
    } catch (error) { logger.error('Delete banner error:', error); next(error); }
  }

  async updateBannerStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const banner = await Banner.findByPk(id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      banner.status = status;
      await banner.save();
      res.json({ success: true, data: toBannerDTO(banner) });
    } catch (error) { logger.error('Update banner status error:', error); next(error); }
  }

  async sortBanners(req, res, next) {
    try {
      const items = req.body?.items || [];
      for (const it of items) {
        await Banner.update({ sort_order: it.sortOrder }, { where: { id: it.id } });
      }
      res.json({ success: true, data: true });
    } catch (error) { logger.error('Sort banners error:', error); next(error); }
  }

  async batchDeleteBanners(req, res, next) {
    try {
      const ids = req.body?.ids || [];
      await Banner.destroy({ where: { id: { [Op.in]: ids } } });
      res.json({ success: true, data: true });
    } catch (error) { logger.error('Batch delete banners error:', error); next(error); }
  }

  async batchUpdateBannerStatus(req, res, next) {
    try {
      const { ids, status } = req.body || {};
      await Banner.update({ status }, { where: { id: { [Op.in]: ids } } });
      res.json({ success: true, data: true });
    } catch (error) { logger.error('Batch update banner status error:', error); next(error); }
  }

  // Announcements
  async getAnnouncements(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const keyword = req.query.keyword;
      const status = req.query.status;
      const type = req.query.type;
      const offset = (page - 1) * pageSize;
      const where = {};
      if (keyword) where.title = { [Op.like]: `%${keyword}%` };
      if (status) where.status = status;
      if (type) where.type = type;
      const { count, rows } = await Announcement.findAndCountAll({ where, offset, limit: pageSize, order: [['created_at', 'DESC']] });
      res.json({ success: true, data: { items: rows.map(toAnnouncementDTO), total: count, page, pageSize } });
    } catch (error) {
      logger.error('Get announcements error:', error);
      res.json({ success: true, data: { list: [], total: 0, page: 1, pageSize: parseInt(req.query.pageSize) || 20 } });
    }
  }

  async getAnnouncementDetail(req, res, next) {
    try {
      const ann = await Announcement.findByPk(parseInt(req.params.id));
      if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
      res.json({ success: true, data: toAnnouncementDTO(ann) });
    } catch (error) { logger.error('Get announcement detail error:', error); next(error); }
  }

  async createAnnouncement(req, res, next) {
    try {
      const { title, content, type, status } = req.body;
      const ann = await Announcement.create({ title, content, type: type ?? 'system', status: status ?? 'draft' });
      res.json({ success: true, data: toAnnouncementDTO(ann) });
    } catch (error) { logger.error('Create announcement error:', error); next(error); }
  }

  async updateAnnouncement(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const { title, content, type, status } = req.body;
      const ann = await Announcement.findByPk(id);
      if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
      ann.title = title ?? ann.title;
      ann.content = content ?? ann.content;
      ann.type = type ?? ann.type;
      ann.status = status ?? ann.status;
      await ann.save();
      res.json({ success: true, data: toAnnouncementDTO(ann) });
    } catch (error) { logger.error('Update announcement error:', error); next(error); }
  }

  async deleteAnnouncement(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const ann = await Announcement.findByPk(id);
      if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
      await ann.destroy();
      res.json({ success: true, data: true });
    } catch (error) { logger.error('Delete announcement error:', error); next(error); }
  }

  async publishAnnouncement(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const ann = await Announcement.findByPk(id);
      if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
      ann.status = 'published';
      ann.published_at = new Date();
      await ann.save();
      res.json({ success: true, data: toAnnouncementDTO(ann) });
    } catch (error) { logger.error('Publish announcement error:', error); next(error); }
  }

  async archiveAnnouncement(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const ann = await Announcement.findByPk(id);
      if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found' });
      ann.status = 'archived';
      await ann.save();
      res.json({ success: true, data: toAnnouncementDTO(ann) });
    } catch (error) { logger.error('Archive announcement error:', error); next(error); }
  }

  async batchDeleteAnnouncements(req, res, next) {
    try {
      const ids = req.body?.ids || [];
      await Announcement.destroy({ where: { id: { [Op.in]: ids } } });
      res.json({ success: true, data: true });
    } catch (error) { logger.error('Batch delete announcements error:', error); next(error); }
  }

  // Upload & Stats (简化实现)
  async upload(req, res, _next) {
    try {
      const type = req.body?.type || 'other';
      // 简化：返回占位图，避免引入上传依赖
      const url = type === 'banner'
        ? 'https://via.placeholder.com/800x400.png?text=Banner+Mock'
        : 'https://via.placeholder.com/1200x600.png?text=Content+Mock';
      res.json({ success: true, data: { url } });
    } catch (error) { logger.error('Upload error:', error); }
  }

  async getContentStats(req, res, next) {
    try {
      const bannerCount = await Banner.count();
      const activeBannerCount = await Banner.count({ where: { status: 'active' } });
      const announcementCount = await Announcement.count();
      const publishedAnnouncementCount = await Announcement.count({ where: { status: 'published' } });
      res.json({ success: true, data: {
        banners: bannerCount,
        activeBanners: activeBannerCount,
        announcements: announcementCount,
        publishedAnnouncements: publishedAnnouncementCount
      } });
    } catch (error) {
      logger.error('Get content stats error:', error);
      res.json({ success: true, data: { banners: 0, activeBanners: 0, announcements: 0, publishedAnnouncements: 0 } });
    }
  }

  async searchHelp(req, res, next) {
    try {
      const q = req.query.q || '';
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const offset = (page - 1) * pageSize;
      
      if (!q || q.trim().length === 0) {
        return res.json({ success: true, data: [] });
      }
      
      const { rows } = await Announcement.findAndCountAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { content: { [Op.like]: `%${q}%` } }
          ]
        },
        offset,
        limit: pageSize,
        order: [['created_at', 'DESC']]
      });
      
      res.json({ success: true, data: rows.map(toArticleDTO) });
    } catch (error) {
      logger.error('Search help error:', error);
      res.json({ success: true, data: [] });
    }
  }
}

module.exports = new ContentController();
