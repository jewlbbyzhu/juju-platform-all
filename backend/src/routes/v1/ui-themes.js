const express = require('express');
const router = express.Router();
const { sequelize } = require('../../config/database');

// 获取所有UI主题（用户选择用）
router.get('/', async (req, res) => {
  try {
    const [themes] = await sequelize.query(
      `SELECT id, slug, name, name_en, description, 
              target_age, target_interest, colors, icon, sort_order 
       FROM ui_themes 
       WHERE status = 1 
       ORDER BY sort_order ASC`
    );

    res.json({
      success: true,
      data: themes.map(t => {
        let colors = t.colors;
        if (typeof colors === 'string') {
          try {
            colors = JSON.parse(colors);
          } catch (e) {
            colors = {};
          }
        }
        return {
          ...t,
          colors: colors || {}
        };
      })
    });
  } catch (error) {
    console.error('Get UI themes error:', error);
    const isDev = process.env.NODE_ENV === 'development';
    res.status(500).json({
      success: false,
      message: '获取主题失败',
      error: isDev ? error.message : 'Internal server error'
    });
  }
});

// 获取热门标签
router.get('/tags/hot', async (req, res) => {
  try {
    const [tags] = await sequelize.query(
      `SELECT id, name, icon, usage_count 
       FROM tags 
       WHERE status = 1 
       ORDER BY usage_count DESC, sort_order ASC 
       LIMIT 20`
    );

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get hot tags error:', error);
    const isDev = process.env.NODE_ENV === 'development';
    res.status(500).json({
      success: false,
      message: '获取热门标签失败',
      error: isDev ? error.message : 'Internal server error'
    });
  }
});

// 筛选聚会列表（核心API）
router.get('/parties/filter', async (req, res) => {
  try {
    const {
      theme,
      scale,
      priceRange,
      timeRange,
      tag,
      distance,
      lat,
      lng,
      page = 1,
      pageSize = 10
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const conditions = ['p.status = 1', 'p.audit_status = 1'];
    const replacements = [];

    if (theme) {
      conditions.push('p.ui_theme = ?');
      replacements.push(theme);
    }

    if (scale) {
      switch(scale) {
      case 'small':
        conditions.push('p.max_participants <= 10');
        break;
      case 'medium':
        conditions.push('p.max_participants BETWEEN 11 AND 30');
        break;
      case 'large':
        conditions.push('p.max_participants > 30');
        break;
      }
    }

    if (priceRange) {
      switch(priceRange) {
      case 'free':
        conditions.push('p.min_price = 0 AND p.max_price = 0');
        break;
      case 'low':
        conditions.push('p.max_price > 0 AND p.max_price <= 50');
        break;
      case 'medium':
        conditions.push('p.max_price > 50 AND p.max_price <= 200');
        break;
      case 'high':
        conditions.push('p.max_price > 200');
        break;
      }
    }

    if (timeRange) {
      switch(timeRange) {
      case 'today':
        conditions.push('DATE(p.start_time) = CURDATE()');
        break;
      case 'tomorrow':
        conditions.push('DATE(p.start_time) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)');
        break;
      case 'week':
        conditions.push('p.start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)');
        break;
      case 'month':
        conditions.push('p.start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)');
        break;
      }
    }

    if (tag) {
      // 对tag进行严格白名单校验：仅允许字母、数字、中文，长度1-20
      const tagStr = String(tag).trim();
      const sanitizedTag = tagStr.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').substring(0, 20);
      // 如果原始输入包含非法字符，直接拒绝而非静默过滤
      if (tagStr !== sanitizedTag || !sanitizedTag || sanitizedTag.length < 1) {
        return res.status(400).json({
          success: false,
          message: 'tag参数包含非法字符，仅允许字母、数字和中文',
          code: 'INVALID_TAG_FORMAT'
        });
      }
      conditions.push('p.tags LIKE ?');
      replacements.push(`%${sanitizedTag}%`);
    }

    let distanceSelect = '';
    let distanceOrder = '';
    
    if (distance && lat && lng) {
      const distanceKm = parseFloat(distance);
      distanceSelect = `, (
        6371 * acos(
          cos(radians(?)) * cos(radians(p.latitude)) * 
          cos(radians(p.longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(p.latitude))
        )
      ) AS distance`;
      conditions.push('p.latitude IS NOT NULL AND p.longitude IS NOT NULL');
      conditions.push(`(
        6371 * acos(
          cos(radians(?)) * cos(radians(p.latitude)) * 
          cos(radians(p.longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(p.latitude))
        )
      ) <= ?`);
      distanceOrder = 'distance ASC,';
      replacements.push(lat, lng, lat, lat, lng, lat, distanceKm);
    }

    const whereClause = conditions.join(' AND ');

    const query = `SELECT p.*, u.nickname as organizer_name, u.avatar as organizer_avatar
       ${distanceSelect}
       FROM parties p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE ${whereClause}
       ORDER BY ${distanceOrder} p.is_featured DESC, p.is_hot DESC, p.created_at DESC
       LIMIT ? OFFSET ?`;

    const result = await sequelize.query(query, {
      replacements: [...replacements, parseInt(pageSize), offset]
    });

    // 处理结果
    const parties = Array.isArray(result[0]) ? result[0] : result;

    const countQuery = `SELECT COUNT(*) as total 
       FROM parties p
       WHERE ${whereClause}`;

    const countResult = await sequelize.query(countQuery, {
      replacements: [...replacements]
    });

    const total = countResult[0][0]?.total || 0;

    const formattedParties = parties.map(p => ({
      ...p,
      organizer: {
        id: p.user_id,
        nickname: p.organizer_name,
        avatar: p.organizer_avatar
      },
      price_range: {
        min: p.min_price,
        max: p.max_price,
        text: p.min_price === '0.00' && p.max_price === '0.00' ? '免费' : 
          `¥${p.min_price}-${p.max_price}`
      },
      distance: p.distance ? parseFloat(p.distance).toFixed(2) : null
    }));

    res.json({
      success: true,
      data: {
        list: formattedParties,
        total: parseInt(total),
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        filters: {
          theme,
          scale,
          priceRange,
          timeRange,
          tag,
          distance
        }
      }
    });
  } catch (error) {
    console.error('Filter parties error:', error);
    // 生产环境不返回原始error.message，防止泄露数据库结构等敏感信息
    const isDev = process.env.NODE_ENV === 'development';
    res.status(500).json({
      success: false,
      message: '筛选聚会失败',
      error: isDev ? error.message : 'Internal server error',
      ...(isDev ? { stack: error.stack } : {})
    });
  }
});

module.exports = router;
