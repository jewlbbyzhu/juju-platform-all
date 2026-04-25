const express = require('express');
const router = express.Router();
const { auth: authenticate } = require('../../middleware/auth');

// 前端兼容性路由 - VIP统计相关
// 这些路由对应前端 vipStats.ts 的调用

router.get('/users', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        vipUsers: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users/range', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        dates: [],
        values: []
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users/compare', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        comparison: []
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/revenue', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        totalRevenue: 0,
        dailyRevenue: 0,
        weeklyRevenue: 0,
        monthlyRevenue: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/overview', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        totalUsers: 0,
        totalParties: 0,
        totalOrders: 0,
        totalRevenue: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/export', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        downloadUrl: ''
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
