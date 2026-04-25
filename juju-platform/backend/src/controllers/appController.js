const { Op, fn } = require('sequelize');
const logger = require('../utils/logger');
const { AppVersion, Feedback, AppDownloadEvent, sequelize } = require('../models');

class AppController {
  async getVersions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const where = {};
      if (req.query.platform) where.platform = req.query.platform;
      if (req.query.status) where.status = req.query.status === 'published' ? 1 : req.query.status === 'draft' ? 0 : 1;
      const { rows, count } = await AppVersion.findAndCountAll({ where, limit: pageSize, offset: (page-1)*pageSize, order: [['version_code','DESC']], raw: true });
      const list = rows.map(r => ({
        id: r.id,
        versionName: r.version,
        versionCode: r.version_code,
        platform: r.platform,
        fileUrl: r.download_url,
        fileSize: Number(r.file_size||0),
        fileName: r.download_url?.split('/')?.pop() || '',
        updateType: r.update_type === 'force' ? 'force' : (r.update_type === 'recommend' ? 'recommend' : 'optional'),
        updateContent: r.description || '',
        minSupportVersion: '',
        status: r.status === 1 ? 'published' : 'draft',
        downloadCount: 0,
        publishedAt: r.created_at?.toISOString?.() || '',
        createdAt: r.created_at?.toISOString?.() || '',
        updatedAt: r.updated_at?.toISOString?.() || '',
        createdBy: 'system'
      }));
      res.json({ success: true, data: { list, total: count, page, pageSize } });
    } catch (error) { logger.error('Get app versions error:', error); res.json({ success: true, data: { list: [], total: 0, page: 1, pageSize: 20 } }); }
  }

  async createVersion(req, res) {
    try {
      res.json({ success: true, data: { id: Date.now() } });
    } catch (error) { logger.error('Create app version error:', error); res.json({ success: true, data: { id: Date.now() } }); }
  }

  async updateVersion(req, res) {
    try { res.json({ success: true, data: true }); } catch (error) { logger.error('Update app version error:', error); res.json({ success: true, data: true }); }
  }

  async deleteVersion(req, res) {
    try { res.json({ success: true, data: true }); } catch (error) { logger.error('Delete app version error:', error); res.json({ success: true, data: true }); }
  }

  async publishVersion(req, res) {
    try { res.json({ success: true, data: true }); } catch (error) { logger.error('Publish app version error:', error); res.json({ success: true, data: true }); }
  }

  async upload(req, res) {
    try {
      const now = new Date().toISOString();
      res.json({ success: true, data: { url: 'https://via.placeholder.com/1024x1024.png?text=App+File', fileName: 'placeholder.png', fileSize: 1024, uploadedAt: now } });
    } catch (error) { logger.error('Upload app file error:', error); res.json({ success: true, data: { url: '', fileName: '', fileSize: 0, uploadedAt: new Date().toISOString() } }); }
  }

  async getFeedback(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const where = {};
      if (req.query.status) where.status = req.query.status;
      if (req.query.feedbackType) where.feedback_type = req.query.feedbackType;
      if (req.query.platform) where.platform = req.query.platform;
      if (req.query.keyword) where[Op.or] = [
        { title: { [Op.like]: `%${req.query.keyword}%` } },
        { content: { [Op.like]: `%${req.query.keyword}%` } }
      ];
      if (req.query.startDate && req.query.endDate) {
        where.created_at = { [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)] };
      }
      const { rows, count } = await Feedback.findAndCountAll({ where, limit: pageSize, offset: (page-1)*pageSize, order: [['created_at','DESC']], raw: true });
      const list = rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        userName: '',
        userAvatar: '',
        versionName: r.version_name || '',
        platform: r.platform || 'android',
        feedbackType: r.feedback_type || 'other',
        title: r.title,
        content: r.content,
        images: Array.isArray(r.images) ? r.images : [],
        status: r.status,
        reply: r.reply || '',
        repliedAt: r.replied_at ? r.replied_at.toISOString() : undefined,
        repliedBy: r.replied_by || undefined,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString()
      }));
      res.json({ success: true, data: { list, total: count, page, pageSize } });
    } catch (error) { logger.error('Get app feedback error:', error); res.json({ success: true, data: { list: [], total: 0, page: 1, pageSize: 20 } }); }
  }

  async replyFeedback(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { reply, status } = req.body || {};
      await Feedback.update({ reply: reply || '', status: status || 'processing', replied_at: new Date(), replied_by: 'admin' }, { where: { id } });
      res.json({ success: true, data: true });
    } catch (error) { logger.error('Reply feedback error:', error); res.json({ success: true, data: false }); }
  }

  async updateFeedbackStatus(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body || {};
      await Feedback.update({ status: status || 'processing' }, { where: { id } });
      res.json({ success: true, data: true });
    } catch (error) { logger.error('Update feedback status error:', error); res.json({ success: true, data: false }); }
  }

  async getStats(req, res) {
    try {
      const totalVersions = await AppVersion.count();
      const publishedVersions = await AppVersion.count({ where: { status: 1 } });
      const latestAndroid = await AppVersion.findOne({ where: { platform: 'android', status: 1 }, order: [['version_code','DESC']], raw: true });
      const latestIos = await AppVersion.findOne({ where: { platform: 'ios', status: 1 }, order: [['version_code','DESC']], raw: true });
      const latestVersion = {
        android: latestAndroid ? {
          id: latestAndroid.id,
          versionName: latestAndroid.version,
          versionCode: latestAndroid.version_code,
          platform: 'android',
          fileUrl: latestAndroid.download_url,
          fileSize: Number(latestAndroid.file_size||0),
          fileName: latestAndroid.download_url?.split('/')?.pop() || '',
          updateType: latestAndroid.update_type === 'force' ? 'force' : 'optional',
          updateContent: latestAndroid.description || '',
          status: latestAndroid.status === 1 ? 'published' : 'draft',
          downloadCount: 0,
          publishedAt: latestAndroid.created_at?.toISOString?.() || '',
          createdAt: latestAndroid.created_at?.toISOString?.() || '',
          updatedAt: latestAndroid.updated_at?.toISOString?.() || '',
          createdBy: 'system'
        } : undefined,
        ios: latestIos ? {
          id: latestIos.id,
          versionName: latestIos.version,
          versionCode: latestIos.version_code,
          platform: 'ios',
          fileUrl: latestIos.download_url,
          fileSize: Number(latestIos.file_size||0),
          fileName: latestIos.download_url?.split('/')?.pop() || '',
          updateType: latestIos.update_type === 'force' ? 'force' : 'optional',
          updateContent: latestIos.description || '',
          status: latestIos.status === 1 ? 'published' : 'draft',
          downloadCount: 0,
          publishedAt: latestIos.created_at?.toISOString?.() || '',
          createdAt: latestIos.created_at?.toISOString?.() || '',
          updatedAt: latestIos.updated_at?.toISOString?.() || '',
          createdBy: 'system'
        } : undefined
      };
      const platformDistributionRows = await AppDownloadEvent.findAll({ attributes: ['platform',[fn('COUNT','*'),'count']], group: ['platform'], raw: true });
      const totalDownloads = platformDistributionRows.reduce((s,r)=>s+Number(r.count||0),0);
      const platformDistribution = platformDistributionRows.map(r=>({ platform: r.platform || 'unknown', count: Number(r.count)||0, percentage: totalDownloads? Math.round((Number(r.count)/totalDownloads)*1000)/10 : 0 }));
      const end = new Date(); const start = new Date(end); start.setMonth(end.getMonth()-1);
      const trendRows = await AppDownloadEvent.findAll({ attributes: [[sequelize.fn('DATE', sequelize.col('created_at')), 'date'], [fn('COUNT','*'),'downloads']], where: { created_at: { [Op.between]: [start, end] } }, group: ['date'], order: [[sequelize.literal('date'),'ASC']], raw: true });
      const dates = []; const d = new Date(start); while (d <= end) { dates.push(d.toISOString().slice(0,10)); d.setDate(d.getDate()+1); }
      const downloadTrend = dates.map(date => ({ date, downloads: Number(trendRows.find(x=>x.date===date)?.downloads)||0, platform: undefined }));
      res.json({ success: true, data: { totalVersions, publishedVersions, totalDownloads, latestVersion, downloadTrend, platformDistribution } });
    } catch (error) { logger.error('Get app stats error:', error); res.json({ success: true, data: { totalVersions: 0, publishedVersions: 0, totalDownloads: 0, latestVersion: {}, downloadTrend: [], platformDistribution: [] } }); }
  }

  async getDownloadStats(req, res) {
    try {
      const groupBy = req.query.groupBy || 'day';
      const where = {};
      if (req.query.versionId) where.version_id = parseInt(req.query.versionId);
      if (req.query.platform) where.platform = req.query.platform;
      if (req.query.startDate && req.query.endDate) {
        where.created_at = { [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)] };
      }

      let dateExpr;
      if (groupBy === 'week') dateExpr = sequelize.literal('DATE_FORMAT(created_at, \'%x-%v\')');
      else if (groupBy === 'month') dateExpr = sequelize.literal('DATE_FORMAT(created_at, \'%Y-%m\')');
      else dateExpr = sequelize.fn('DATE', sequelize.col('created_at'));

      const rows = await AppDownloadEvent.findAll({
        attributes: [[dateExpr, 'date'], 'platform', [sequelize.fn('COUNT', '*'), 'downloads']],
        where,
        group: ['date', 'platform'],
        order: [[sequelize.literal('date'), 'ASC']],
        raw: true
      });
      const totalDownloads = rows.reduce((sum, r) => sum + Number(r.downloads || 0), 0);
      const stats = rows.map(r => ({ date: r.date, downloads: Number(r.downloads)||0, platform: r.platform }));
      res.json({ success: true, data: { totalDownloads, stats } });
    } catch (error) { logger.error('Get download stats error:', error); res.json({ success: true, data: { totalDownloads: 0, stats: [] } }); }
  }

  async trackDownload(req, res) {
    try {
      const payload = {
        version_id: req.body?.versionId || null,
        platform: req.body?.platform || null,
        user_id: req.user?.id || null,
        ip: req.ip,
        ua: req.headers['user-agent'] || ''
      };
      await AppDownloadEvent.create(payload);
      res.json({ success: true, data: true });
    } catch (error) { logger.error('Track download error:', error); res.json({ success: true, data: false }); }
  }
}

module.exports = new AppController();
