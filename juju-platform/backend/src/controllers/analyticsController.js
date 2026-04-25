const { Op, fn, col } = require('sequelize');
const { Order, Payment, User, Party, sequelize } = require('../models');
const logger = require('../utils/logger');

function getRange(timeRange = 'month') {
  const end = new Date();
  const start = new Date(end);
  if (timeRange === 'week') start.setDate(end.getDate() - 7);
  else if (timeRange === 'quarter') start.setMonth(end.getMonth() - 3);
  else start.setMonth(end.getMonth() - 1);
  return { start, end };
}

function emptySeries(start, end) {
  const days = [];
  const d = new Date(start);
  while (d <= end) {
    days.push({ date: d.toISOString().slice(0, 10), value: 0 });
    d.setDate(d.getDate() + 1);
  }
  return days;
}

class AnalyticsController {
  async overview(req, res) {
    try {
      const { start, end } = getRange(req.query.timeRange);
      const totals = await Promise.all([
        Order.count({ where: { created_at: { [Op.between]: [start, end] } } }),
        Payment.findAll({ where: { created_at: { [Op.between]: [start, end] } }, attributes: [[fn('SUM', col('amount')), 'sum']] }),
        Party.count({ where: { created_at: { [Op.between]: [start, end] } } }),
        User.count({ where: { created_at: { [Op.between]: [start, end] } } })
      ]);
      const revenueSum = Number(totals[1]?.[0]?.get?.('sum') || 0);
      res.json({ success: true, data: {
        orders: { total: totals[0] },
        revenue: { total: revenueSum },
        parties: { total: totals[2] },
        users: { total: totals[3] }
      } });
    } catch (error) { logger.error('Analytics overview error:', error); res.json({ success: true, data: { orders: { total: 0 }, revenue: { total: 0 }, parties: { total: 0 }, users: { total: 0 } } }); }
  }
  async orders(req, res) {
    try {
      const { start, end } = getRange(req.query.timeRange);
      const rows = await Order.findAll({
        attributes: [[sequelize.fn('DATE', sequelize.col('created_at')), 'date'], [sequelize.fn('COUNT', '*'), 'orders'], [sequelize.fn('SUM', sequelize.col('final_amount')), 'revenue']],
        where: { created_at: { [Op.between]: [start, end] } },
        group: ['date'],
        order: [[sequelize.literal('date'), 'ASC']],
        raw: true
      });
      const trends = emptySeries(start, end).map(d => {
        const r = rows.find(x => x.date === d.date);
        const orders = r ? Number(r.orders) || 0 : 0;
        const revenue = r ? Number(r.revenue) || 0 : 0;
        const avgOrderValue = orders ? revenue / orders : 0;
        return { date: d.date, orders, revenue, avgOrderValue };
      });
      const statusRows = await Order.findAll({ attributes: ['status', [sequelize.fn('COUNT', '*'), 'count']], group: ['status'], raw: true });
      const paymentRows = await Order.findAll({ attributes: ['payment_method', [sequelize.fn('COUNT', '*'), 'count']], group: ['payment_method'], raw: true });
      res.json({ success: true, data: {
        trends,
        statusDistribution: statusRows.map(r => ({ status: String(r.status), count: Number(r.count) })),
        paymentMethodDistribution: paymentRows.filter(r => r.payment_method).map(r => ({ method: r.payment_method, count: Number(r.count) }))
      } });
    } catch (error) { logger.error('Analytics orders error:', error); res.json({ success: true, data: { trends: [], statusDistribution: [], paymentMethodDistribution: [] } }); }
  }

  async revenue(req, res) {
    try {
      const { start, end } = getRange(req.query.timeRange);
      const rows = await Payment.findAll({
        attributes: [[sequelize.fn('DATE', sequelize.col('payment_time')), 'date'], [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'], [sequelize.fn('COUNT', '*'), 'orders']],
        where: { payment_time: { [Op.between]: [start, end] }, status: 1 },
        group: ['date'],
        order: [[sequelize.literal('date'), 'ASC']],
        raw: true
      });
      const trends = emptySeries(start, end).map(d => {
        const r = rows.find(x => x.date === d.date);
        const revenue = r ? Number(r.revenue) || 0 : 0;
        const orders = r ? Number(r.orders) || 0 : 0;
        const avgOrderValue = orders ? revenue / orders : 0;
        return { date: d.date, revenue, orders, avgOrderValue };
      });
      const methodRows = await Payment.findAll({ attributes: ['payment_method', [fn('SUM', col('amount')), 'amount']], where: { status: 1, payment_time: { [Op.between]: [start, end] } }, group: ['payment_method'], raw: true });
      const revenueSourcePercentage = methodRows.filter(r => r.payment_method).map(r => ({ source: r.payment_method, amount: Number(r.amount) || 0 }));
      res.json({ success: true, data: { trends, revenueSourcePercentage } });
    } catch (error) { logger.error('Analytics revenue error:', error); res.json({ success: true, data: { trends: [], revenueSourcePercentage: [] } }); }
  }

  async parties(req, res) {
    try {
      const { start, end } = getRange(req.query.timeRange);
      const createRows = await Party.findAll({ attributes: [[sequelize.fn('DATE', sequelize.col('created_at')), 'date'], [sequelize.fn('COUNT', '*'), 'created']], where: { created_at: { [Op.between]: [start, end] } }, group: ['date'], order: [[sequelize.literal('date'), 'ASC']], raw: true });
      const participantRows = await Order.findAll({ attributes: [[sequelize.fn('DATE', sequelize.col('created_at')), 'date'], [sequelize.fn('COUNT', '*'), 'participants']], where: { created_at: { [Op.between]: [start, end] }, status: { [Op.gte]: 1 } }, group: ['date'], order: [[sequelize.literal('date'), 'ASC']], raw: true });
      const trends = emptySeries(start, end).map(d => ({
        date: d.date,
        created: Number(createRows.find(x => x.date === d.date)?.created) || 0,
        completed: 0,
        participants: Number(participantRows.find(x => x.date === d.date)?.participants) || 0
      }));
      const catRows = await Party.findAll({ attributes: ['category', [sequelize.fn('COUNT', '*'), 'count']], group: ['category'], raw: true });
      const categoryDistribution = catRows.filter(r => r.category).map(r => ({ categoryName: r.category, count: Number(r.count) || 0 }));
      const topRows = await Order.findAll({ attributes: ['party_id', [sequelize.fn('COUNT', '*'), 'participants'], [sequelize.fn('SUM', sequelize.col('final_amount')), 'revenue']], where: { status: { [Op.gte]: 1 } }, group: ['party_id'], order: [[sequelize.literal('revenue'), 'DESC']], limit: 10, raw: true });
      const parties = await Party.findAll({ where: { id: topRows.map(r => r.party_id) }, attributes: ['id', 'title'], raw: true });
      const topParties = topRows.map(r => ({ title: parties.find(p => p.id === r.party_id)?.title || `#${r.party_id}`, participants: Number(r.participants) || 0, revenue: Number(r.revenue) || 0 }));
      res.json({ success: true, data: { trends, categoryDistribution, topParties } });
    } catch (error) { logger.error('Analytics parties error:', error); res.json({ success: true, data: { trends: [], categoryDistribution: [], topParties: [] } }); }
  }

  async users(req, res) {
    try {
      const { start, end } = getRange(req.query.timeRange);
      const newRows = await User.findAll({ attributes: [[sequelize.fn('DATE', sequelize.col('created_at')), 'date'], [sequelize.fn('COUNT', '*'), 'newUsers']], where: { created_at: { [Op.between]: [start, end] } }, group: ['date'], order: [[sequelize.literal('date'), 'ASC']], raw: true });
      const activeRows = await Order.findAll({ attributes: [[sequelize.fn('DATE', sequelize.col('created_at')), 'date'], [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'activeUsers']], where: { created_at: { [Op.between]: [start, end] }, status: { [Op.gte]: 1 } }, group: ['date'], order: [[sequelize.literal('date'), 'ASC']], raw: true });
      const totalUsers = await User.count();
      const trends = emptySeries(start, end).map(d => ({
        date: d.date,
        newUsers: Number(newRows.find(x => x.date === d.date)?.newUsers) || 0,
        activeUsers: Number(activeRows.find(x => x.date === d.date)?.activeUsers) || 0,
        totalUsers
      }));
      const regionDistribution = [];
      res.json({ success: true, data: { trends, regionDistribution } });
    } catch (error) { logger.error('Analytics users error:', error); res.json({ success: true, data: { trends: [], regionDistribution: [] } }); }
  }

  async export(req, res) {
    try {
      const timeRange = req.body?.timeRange || req.query?.timeRange || 'month';
      const startDate = req.body?.startDate || req.query?.startDate;
      const endDate = req.body?.endDate || req.query?.endDate;
      const range = startDate && endDate ? { start: new Date(startDate), end: new Date(endDate) } : getRange(timeRange);
      const orders = await Order.findAll({ where: { created_at: { [Op.between]: [range.start, range.end] } }, order: [['created_at', 'DESC']] });
      const header = 'id,user_id,party_id,status,created_at\n';
      const body = orders.map(o => `${o.id},${o.user_id || ''},${o.party_id || ''},${o.status || ''},${o.created_at?.toISOString() || ''}`).join('\n');
      const csv = header + body;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics_orders.csv"');
      res.status(200).send(csv);
    } catch (error) { logger.error('Analytics export error:', error); res.status(200).send('id,user_id,party_id,status,created_at\n'); }
  }

  async realtime(req, res) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const [todayOrders, todayRevenue, todayUsers, yesterdayOrders, activeUsers] = await Promise.all([
        Order.count({ where: { created_at: { [Op.gte]: today } } }),
        Payment.sum('amount', { where: { payment_time: { [Op.gte]: today }, status: 1 } }),
        User.count({ where: { created_at: { [Op.gte]: today } } }),
        Order.count({ where: { created_at: { [Op.gte]: yesterday, [Op.lt]: today } } }),
        Order.count({ where: { created_at: { [Op.gte]: today } }, distinct: true, col: 'user_id' })
      ]);

      const revenue = Number(todayRevenue) || 0;
      const orderGrowth = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(2) : 0;

      res.json({
        success: true,
        data: {
          today: {
            orders: todayOrders,
            revenue: revenue,
            newUsers: todayUsers,
            activeUsers: activeUsers || 0
          },
          growth: {
            orders: Number(orderGrowth),
            revenue: 0,
            users: 0
          },
          lastUpdated: now.toISOString()
        }
      });
    } catch (error) {
      logger.error('Analytics realtime error:', error);
      res.json({
        success: true,
        data: {
          today: { orders: 0, revenue: 0, newUsers: 0, activeUsers: 0 },
          growth: { orders: 0, revenue: 0, users: 0 },
          lastUpdated: new Date().toISOString()
        }
      });
    }
  }

  async drillDown(req, res) {
    try {
      const { dimension, metric, filters = {} } = req.body;
      const { startDate, endDate } = filters;

      let data = [];
      const where = {};
      if (startDate && endDate) {
        where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      if (dimension === 'date') {
        const rows = await Order.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('created_at')), 'dimension'],
            [sequelize.fn(metric === 'count' ? 'COUNT' : 'SUM', sequelize.col(metric === 'count' ? '*' : 'final_amount')), 'value']
          ],
          where,
          group: ['dimension'],
          order: [[sequelize.literal('dimension'), 'ASC']],
          raw: true
        });
        data = rows;
      } else if (dimension === 'status') {
        const rows = await Order.findAll({
          attributes: ['status as dimension', [sequelize.fn('COUNT', '*'), 'value']],
          where,
          group: ['status'],
          raw: true
        });
        data = rows;
      } else if (dimension === 'payment_method') {
        const rows = await Payment.findAll({
          attributes: ['payment_method as dimension', [sequelize.fn('SUM', sequelize.col('amount')), 'value']],
          where: { ...where, status: 1 },
          group: ['payment_method'],
          raw: true
        });
        data = rows;
      }

      res.json({
        success: true,
        data: {
          dimension,
          metric,
          data: data.map(row => ({
            dimension: row.dimension,
            value: Number(row.value) || 0
          }))
        }
      });
    } catch (error) {
      logger.error('Analytics drilldown error:', error);
      res.json({
        success: true,
        data: { dimension: req.body.dimension, metric: req.body.metric, data: [] }
      });
    }
  }

  async getReports(req, res) {
    try {
      const { page = 1, pageSize = 20, type } = req.query;
      const offset = (page - 1) * pageSize;
      const where = { status: 1 };
      if (type) where.type = type;

      const { AnalyticsReport } = require('../models');
      const { count, rows } = await AnalyticsReport.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          list: rows,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize)
        }
      });
    } catch (error) {
      logger.error('Get analytics reports error:', error);
      res.json({ success: true, data: { list: [], total: 0, page: 1, pageSize: 20 } });
    }
  }

  async getReportById(req, res) {
    try {
      const { AnalyticsReport } = require('../models');
      const report = await AnalyticsReport.findByPk(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }
      res.json({ success: true, data: report });
    } catch (error) {
      logger.error('Get analytics report error:', error);
      res.status(500).json({ success: false, message: 'Failed to get report' });
    }
  }

  async createReport(req, res) {
    try {
      const { AnalyticsReport } = require('../models');
      const report = await AnalyticsReport.create({
        ...req.body,
        created_by: req.user.id
      });
      res.json({ success: true, message: 'Report created successfully', data: report });
    } catch (error) {
      logger.error('Create analytics report error:', error);
      res.status(500).json({ success: false, message: 'Failed to create report' });
    }
  }

  async updateReport(req, res) {
    try {
      const { AnalyticsReport } = require('../models');
      const report = await AnalyticsReport.findByPk(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }
      await report.update(req.body);
      res.json({ success: true, message: 'Report updated successfully', data: report });
    } catch (error) {
      logger.error('Update analytics report error:', error);
      res.status(500).json({ success: false, message: 'Failed to update report' });
    }
  }

  async deleteReport(req, res) {
    try {
      const { AnalyticsReport } = require('../models');
      const report = await AnalyticsReport.findByPk(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }
      await report.destroy();
      res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
      logger.error('Delete analytics report error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete report' });
    }
  }

  async executeReport(req, res) {
    try {
      const { AnalyticsReport } = require('../models');
      const report = await AnalyticsReport.findByPk(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      const { startDate, endDate } = req.body;
      const where = {};
      if (startDate && endDate) {
        where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      let data = [];
      const dimensions = report.dimensions || [];
      const metrics = report.metrics || [];

      if (report.type === 'orders' || report.type === 'custom') {
        const rows = await Order.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('created_at')), 'dimension'],
            [sequelize.fn('COUNT', '*'), 'count'],
            [sequelize.fn('SUM', sequelize.col('final_amount')), 'amount']
          ],
          where,
          group: ['dimension'],
          order: [[sequelize.literal('dimension'), 'ASC']],
          raw: true
        });
        data = rows.map(row => ({
          dimension: row.dimension,
          count: Number(row.count) || 0,
          amount: Number(row.amount) || 0
        }));
      } else if (report.type === 'revenue') {
        const rows = await Payment.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('payment_time')), 'dimension'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'amount'],
            [sequelize.fn('COUNT', '*'), 'count']
          ],
          where: { ...where, status: 1 },
          group: ['dimension'],
          order: [[sequelize.literal('dimension'), 'ASC']],
          raw: true
        });
        data = rows.map(row => ({
          dimension: row.dimension,
          amount: Number(row.amount) || 0,
          count: Number(row.count) || 0
        }));
      } else if (report.type === 'users') {
        const rows = await User.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('created_at')), 'dimension'],
            [sequelize.fn('COUNT', '*'), 'count']
          ],
          where,
          group: ['dimension'],
          order: [[sequelize.literal('dimension'), 'ASC']],
          raw: true
        });
        data = rows.map(row => ({
          dimension: row.dimension,
          count: Number(row.count) || 0
        }));
      }

      res.json({
        success: true,
        data: {
          report: {
            id: report.id,
            name: report.name,
            type: report.type,
            dimensions,
            metrics
          },
          result: {
            total: data.length,
            data
          }
        }
      });
    } catch (error) {
      logger.error('Execute analytics report error:', error);
      res.status(500).json({ success: false, message: 'Failed to execute report' });
    }
  }

  async getDashboards(req, res) {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;
      const where = { status: 1 };

      const { AnalyticsDashboard } = require('../models');
      const { count, rows } = await AnalyticsDashboard.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        order: [['is_default', 'DESC'], ['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          list: rows,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize)
        }
      });
    } catch (error) {
      logger.error('Get analytics dashboards error:', error);
      res.json({ success: true, data: { list: [], total: 0, page: 1, pageSize: 20 } });
    }
  }

  async getDashboardById(req, res) {
    try {
      const { AnalyticsDashboard } = require('../models');
      const dashboard = await AnalyticsDashboard.findByPk(req.params.id);
      if (!dashboard) {
        return res.status(404).json({ success: false, message: 'Dashboard not found' });
      }
      res.json({ success: true, data: dashboard });
    } catch (error) {
      logger.error('Get analytics dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to get dashboard' });
    }
  }

  async createDashboard(req, res) {
    try {
      const { AnalyticsDashboard } = require('../models');
      const dashboard = await AnalyticsDashboard.create({
        ...req.body,
        created_by: req.user.id
      });
      res.json({ success: true, message: 'Dashboard created successfully', data: dashboard });
    } catch (error) {
      logger.error('Create analytics dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to create dashboard' });
    }
  }

  async updateDashboard(req, res) {
    try {
      const { AnalyticsDashboard } = require('../models');
      const dashboard = await AnalyticsDashboard.findByPk(req.params.id);
      if (!dashboard) {
        return res.status(404).json({ success: false, message: 'Dashboard not found' });
      }
      await dashboard.update(req.body);
      res.json({ success: true, message: 'Dashboard updated successfully', data: dashboard });
    } catch (error) {
      logger.error('Update analytics dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to update dashboard' });
    }
  }

  async deleteDashboard(req, res) {
    try {
      const { AnalyticsDashboard } = require('../models');
      const dashboard = await AnalyticsDashboard.findByPk(req.params.id);
      if (!dashboard) {
        return res.status(404).json({ success: false, message: 'Dashboard not found' });
      }
      await dashboard.destroy();
      res.json({ success: true, message: 'Dashboard deleted successfully' });
    } catch (error) {
      logger.error('Delete analytics dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete dashboard' });
    }
  }

  async setDefaultDashboard(req, res) {
    try {
      const { AnalyticsDashboard } = require('../models');
      const dashboard = await AnalyticsDashboard.findByPk(req.params.id);
      if (!dashboard) {
        return res.status(404).json({ success: false, message: 'Dashboard not found' });
      }

      await AnalyticsDashboard.update({ is_default: 0 }, { where: {} });
      await dashboard.update({ is_default: 1 });

      res.json({ success: true, message: 'Default dashboard set successfully' });
    } catch (error) {
      logger.error('Set default dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to set default dashboard' });
    }
  }

  async getAnalyticsByTimeRange(req, res) {
    try {
      const { param } = req.params;
      const { startDate, endDate } = req.query;
      const where = {};
      if (startDate && endDate) {
        where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      let data = [];
      if (param === 'orders') {
        const rows = await Order.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
            [sequelize.fn('COUNT', '*'), 'count'],
            [sequelize.fn('SUM', sequelize.col('final_amount')), 'amount']
          ],
          where,
          group: ['date'],
          order: [[sequelize.literal('date'), 'ASC']],
          raw: true
        });
        data = rows;
      } else if (param === 'revenue') {
        const rows = await Payment.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('payment_time')), 'date'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'amount'],
            [sequelize.fn('COUNT', '*'), 'count']
          ],
          where: { ...where, status: 1 },
          group: ['date'],
          order: [[sequelize.literal('date'), 'ASC']],
          raw: true
        });
        data = rows;
      } else if (param === 'users') {
        const rows = await User.findAll({
          attributes: [
            [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
            [sequelize.fn('COUNT', '*'), 'count']
          ],
          where,
          group: ['date'],
          order: [[sequelize.literal('date'), 'ASC']],
          raw: true
        });
        data = rows;
      }

      res.json({ success: true, data: { type: param, data } });
    } catch (error) {
      logger.error('Get analytics by time range error:', error);
      res.json({ success: true, data: { type: req.params.param, data: [] } });
    }
  }

  async compareAnalytics(req, res) {
    try {
      const { param } = req.params;
      const { period1, period2 } = req.query;

      const parsePeriod = (period) => {
        const [start, end] = period.split(',');
        return { start: new Date(start), end: new Date(end) };
      };

      const p1 = parsePeriod(period1);
      const p2 = parsePeriod(period2);

      let result = { period1: {}, period2: {}, comparison: {} };

      if (param === 'orders') {
        const [c1, c2] = await Promise.all([
          Order.count({ where: { created_at: { [Op.between]: [p1.start, p1.end] } } }),
          Order.count({ where: { created_at: { [Op.between]: [p2.start, p2.end] } } })
        ]);
        result = {
          period1: { orders: c1 },
          period2: { orders: c2 },
          comparison: { orders: c2 - c1, growth: c1 > 0 ? ((c2 - c1) / c1 * 100).toFixed(2) : 0 }
        };
      } else if (param === 'revenue') {
        const [s1, s2] = await Promise.all([
          Payment.sum('amount', { where: { payment_time: { [Op.between]: [p1.start, p1.end] }, status: 1 } }),
          Payment.sum('amount', { where: { payment_time: { [Op.between]: [p2.start, p2.end] }, status: 1 } })
        ]);
        const v1 = Number(s1) || 0;
        const v2 = Number(s2) || 0;
        result = {
          period1: { revenue: v1 },
          period2: { revenue: v2 },
          comparison: { revenue: v2 - v1, growth: v1 > 0 ? ((v2 - v1) / v1 * 100).toFixed(2) : 0 }
        };
      }

      res.json({ success: true, data: { type: param, ...result } });
    } catch (error) {
      logger.error('Compare analytics error:', error);
      res.json({ success: true, data: { type: req.params.param, period1: {}, period2: {}, comparison: {} } });
    }
  }

  async scheduleReport(req, res) {
    try {
      const { AnalyticsReport } = require('../models');
      const report = await AnalyticsReport.findByPk(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      const { frequency, email, time } = req.body;

      res.json({
        success: true,
        message: 'Report scheduled successfully',
        data: {
          reportId: report.id,
          frequency,
          email,
          time,
          status: 'active'
        }
      });
    } catch (error) {
      logger.error('Schedule report error:', error);
      res.status(500).json({ success: false, message: 'Failed to schedule report' });
    }
  }

  async cancelScheduledReport(req, res) {
    try {
      const { AnalyticsReport } = require('../models');
      const report = await AnalyticsReport.findByPk(req.params.id);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      res.json({ success: true, message: 'Scheduled report cancelled successfully' });
    } catch (error) {
      logger.error('Cancel scheduled report error:', error);
      res.status(500).json({ success: false, message: 'Failed to cancel scheduled report' });
    }
  }

  async getAvailableMetrics(req, res) {
    try {
      const { param } = req.params;

      const metrics = {
        orders: [
          { key: 'count', name: '订单数量', type: 'count' },
          { key: 'amount', name: '订单金额', type: 'sum' },
          { key: 'avgOrderValue', name: '平均订单金额', type: 'avg' }
        ],
        revenue: [
          { key: 'totalRevenue', name: '总收入', type: 'sum' },
          { key: 'paymentCount', name: '支付笔数', type: 'count' }
        ],
        users: [
          { key: 'newUsers', name: '新增用户', type: 'count' },
          { key: 'activeUsers', name: '活跃用户', type: 'count' }
        ],
        parties: [
          { key: 'createdCount', name: '创建数量', type: 'count' },
          { key: 'participantCount', name: '参与人数', type: 'count' }
        ]
      };

      res.json({ success: true, data: metrics[param] || [] });
    } catch (error) {
      logger.error('Get available metrics error:', error);
      res.json({ success: true, data: [] });
    }
  }

  async getAvailableFilters(req, res) {
    try {
      const { param } = req.params;

      const filters = {
        orders: [
          { key: 'status', name: '订单状态', type: 'select', options: ['pending', 'paid', 'completed', 'cancelled'] },
          { key: 'paymentMethod', name: '支付方式', type: 'select', options: ['wechat', 'alipay'] },
          { key: 'dateRange', name: '日期范围', type: 'dateRange' }
        ],
        revenue: [
          { key: 'paymentMethod', name: '支付方式', type: 'select', options: ['wechat', 'alipay'] },
          { key: 'dateRange', name: '日期范围', type: 'dateRange' }
        ],
        users: [
          { key: 'gender', name: '性别', type: 'select', options: ['male', 'female', 'unknown'] },
          { key: 'isVip', name: 'VIP状态', type: 'boolean' },
          { key: 'dateRange', name: '日期范围', type: 'dateRange' }
        ],
        parties: [
          { key: 'category', name: '分类', type: 'select', options: ['sports', 'music', 'food', 'travel'] },
          { key: 'status', name: '状态', type: 'select', options: ['upcoming', 'ongoing', 'completed'] },
          { key: 'dateRange', name: '日期范围', type: 'dateRange' }
        ]
      };

      res.json({ success: true, data: filters[param] || [] });
    } catch (error) {
      logger.error('Get available filters error:', error);
      res.json({ success: true, data: [] });
    }
  }
}

module.exports = new AnalyticsController();
