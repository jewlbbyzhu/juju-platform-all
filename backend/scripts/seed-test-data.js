require('dotenv').config({ path: '.env.development' });
const { sequelize } = require('../src/config/database');
const db = require('../src/models');

const seedParties = async () => {
  try {
    console.log('开始添加聚会测试数据...');
    
    // 创建分类（如果不存在）
    let categories = await db.PartyCategory.findAll();
    if (categories.length === 0) {
      categories = await db.PartyCategory.bulkCreate([
        { name: '户外', name_en: 'Outdoor', slug: 'outdoor', icon: '🏔️', color: '#4CAF50', description: '户外活动', sort_order: 1, status: 1 },
        { name: '音乐', name_en: 'Music', slug: 'music', icon: '🎵', color: '#9C27B0', description: '音乐活动', sort_order: 2, status: 1 },
        { name: '美食', name_en: 'Food', slug: 'food', icon: '🍔', color: '#FF9800', description: '美食活动', sort_order: 3, status: 1 },
        { name: '运动', name_en: 'Sports', slug: 'sports', icon: '⚽', color: '#2196F3', description: '运动活动', sort_order: 4, status: 1 }
      ]);
    }
    
    // 创建聚会
    const parties = await db.Party.bulkCreate([
      {
        title: '周末户外徒步',
        description: '一起探索城市周边的美丽风景',
        location: '紫山公园',
        category: '户外',
        city: '邯郸',
        latitude: 36.6099,
        longitude: 114.4905,
        start_time: new Date('2026-05-01 09:00:00'),
        end_time: new Date('2026-05-01 17:00:00'),
        max_participants: 20,
        status: 1,
        user_id: 1,
        images: ['https://example.com/hiking1.jpg']
      },
      {
        title: '城市摄影漫步',
        description: '记录城市的美好瞬间',
        location: '市中心广场',
        category: '户外',
        city: '邯郸',
        latitude: 36.6099,
        longitude: 114.4905,
        start_time: new Date('2026-05-02 14:00:00'),
        end_time: new Date('2026-05-02 18:00:00'),
        max_participants: 15,
        status: 1,
        user_id: 1,
        images: ['https://example.com/photo1.jpg']
      },
      {
        title: '音乐分享会',
        description: '分享你喜爱的音乐',
        location: '音乐酒吧',
        category: '音乐',
        city: '邯郸',
        latitude: 36.6099,
        longitude: 114.4905,
        start_time: new Date('2026-05-03 19:00:00'),
        end_time: new Date('2026-05-03 22:00:00'),
        max_participants: 30,
        status: 1,
        user_id: 1,
        images: ['https://example.com/music1.jpg']
      }
    ]);
    
    // 创建票种
    const ticketTypes = await db.TicketType.bulkCreate([
      {
        party_id: parties[0].id,
        name: '普通票',
        description: '标准入场券',
        type: 1,
        price: 99.00,
        original_price: 129.00,
        available_count: 50,
        sold_count: 0,
        status: 1
      },
      {
        party_id: parties[0].id,
        name: '早鸟票',
        description: '限时优惠',
        type: 2,
        price: 79.00,
        original_price: 99.00,
        available_count: 20,
        sold_count: 0,
        status: 1
      },
      {
        party_id: parties[1].id,
        name: '普通票',
        description: '标准入场券',
        type: 1,
        price: 59.00,
        original_price: 79.00,
        available_count: 30,
        sold_count: 0,
        status: 1
      }
    ]);
    
    console.log('✅ 测试数据添加成功！');
    console.log(`   分类: ${categories.length} 个`);
    console.log(`   聚会: ${parties.length} 个`);
    console.log(`   票种: ${ticketTypes.length} 个`);
    
    process.exit(0);
  } catch (error) {
    console.error('添加测试数据失败:', error);
    process.exit(1);
  }
};

seedParties();
