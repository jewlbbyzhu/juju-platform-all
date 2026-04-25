const { Op, fn, col, literal } = require('sequelize');
const db = require('../models');
const logger = require('../utils/logger');

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDateRange(days = 7) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  return { start, end: today };
}

async function sumPaidRevenue() {
  const result = await db.Order.findOne({
    attributes: [[fn('SUM', col('final_amount')), 'sum']],
    where: { payment_status: 1 }
  });
  const value = result?.get('sum');
  return Number(value || 0);
}

async function countByDate(model, dateField = 'created_at', start, end) {
  // 返回按天聚合的计数
  const rows = await model.findAll({
    attributes: [
      [fn('DATE_FORMAT', col(dateField), '%Y-%m-%d'), 'date'],
      [fn('COUNT', literal('*')), 'count']
    ],
    where: {
      [dateField]: {
        [Op.between]: [start, end]
      }
    },
    group: [literal('DATE_FORMAT(`' + dateField + '`, \'%Y-%m-%d\')')],
    order: [[literal('date'), 'ASC']]
  });

  const map = new Map();
  rows.forEach(r => map.set(r.get('date'), Number(r.get('count'))));

  const result = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = formatDate(cursor);
    result.push({ date: key, count: map.get(key) || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

async function sumByDate(model, field, dateField = 'created_at', start, end, where = {}) {
  const rows = await model.findAll({
    attributes: [
      [fn('DATE_FORMAT', col(dateField), '%Y-%m-%d'), 'date'],
      [fn('SUM', col(field)), 'sum']
    ],
    where: {
      ...where,
      [dateField]: { [Op.between]: [start, end] }
    },
    group: [literal('DATE_FORMAT(`' + dateField + '`, \'%Y-%m-%d\')')],
    order: [[literal('date'), 'ASC']]
  });
  const map = new Map();
  rows.forEach(r => map.set(r.get('date'), Number(r.get('sum') || 0)));

  const result = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = formatDate(cursor);
    result.push({ date: key, sum: map.get(key) || 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

class DashboardController {
  async getStats(req, res, next) {
    try {
      const userTotal = await db.User.count();
      const partyTotal = await db.Party.count();
      const orderTotal = await db.Order.count();
      const revenueTotal = await sumPaidRevenue();

      const { start, end } = getDateRange(7);

      const userDaily = await countByDate(db.User, 'created_at', start, end);
      const orderDaily = await countByDate(db.Order, 'created_at', start, end);
      const revenueDaily = await sumByDate(db.Order, 'final_amount', 'payment_time', start, end, { payment_status: 1 });

      const trends = userDaily.map((u, i) => ({
        date: u.date,
        userCount: u.count,
        orderCount: orderDaily[i]?.count || 0,
        revenue: revenueDaily[i]?.sum || 0
      }));

      // 简单增长率：最近一天与前一天的差异百分比
      const lastIdx = trends.length - 1;
      const prevIdx = Math.max(0, lastIdx - 1);
      const last = trends[lastIdx] || { userCount: 0, orderCount: 0, revenue: 0 };
      const prev = trends[prevIdx] || { userCount: 0, orderCount: 0, revenue: 0 };
      const pct = (a, b) => (b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100);

      const stats = {
        userTotal,
        partyTotal,
        orderTotal,
        revenueTotal,
        userGrowth: Number(pct(last.userCount, prev.userCount).toFixed(2)),
        partyGrowth: 0, // 简化：聚会增长率按0处理，如需可按发布数统计
        orderGrowth: Number(pct(last.orderCount, prev.orderCount).toFixed(2)),
        revenueGrowth: Number(pct(last.revenue, prev.revenue).toFixed(2))
      };

      res.json({
        success: true,
        data: {
          stats,
          trends,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Dashboard stats error:', error);
      next(error);
    }
  }

  async refresh(req, res, next) {
    // 与 getStats 相同，便于前端刷新
    return this.getStats(req, res, next);
  }
}

module.exports = new DashboardController();

