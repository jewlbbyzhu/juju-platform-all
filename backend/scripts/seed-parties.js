/**
 * 插入测试聚会数据脚本
 * 用于前端UI测试 - 在用户IP附近位置(河北邯郸)
 */

const { Party } = require('../src/models');

// 用户位置：河北邯郸 (36.61, 114.4876)
// 在100km范围内插入聚会数据
const testParties = [
  {
    user_id: 1,
    title: '邯郸桌游聚会 - 狼人杀之夜',
    description: '欢迎加入我们的狼人杀桌游聚会！无论你是新手还是老手，都能在这里找到乐趣。我们提供零食饮料，还有专业主持人带队。快来结识新朋友吧！',
    cover_image: 'https://images.unsplash.com/photo-1610890716171-6b1c9e2e1d8e?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1610890716171-6b1c9e2e1d8e?w=800']),
    category: '桌游',
    start_time: new Date('2026-02-15 19:00:00'),
    end_time: new Date('2026-02-16 23:00:00'),
    location: '邯郸市丛台区新世纪广场',
    address: '河北省邯郸市丛台区中华北大街29号新世纪广场8楼',
    latitude: 36.6098,
    longitude: 114.4901,
    max_participants: 12,
    current_participants: 8,
    min_price: 68.00,
    max_price: 128.00,
    status: 1,
    audit_status: 1,
    city: '邯郸',
    registration_deadline: new Date('2026-02-15 12:00:00')
  },
  {
    user_id: 1,
    title: '邯郸户外徒步 - 紫山登山活动',
    description: '周末一起来紫山徒步吧！呼吸新鲜空气，欣赏城市美景。适合所有年龄段，我们会准备水和简单的食物。记得穿舒适的运动鞋哦！',
    cover_image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800']),
    category: '户外',
    start_time: new Date('2026-02-16 08:00:00'),
    end_time: new Date('2026-02-16 12:00:00'),
    location: '邯郸市丛台区紫山公园',
    address: '河北省邯郸市丛台区紫山风景区',
    latitude: 36.6502,
    longitude: 114.4523,
    max_participants: 20,
    current_participants: 15,
    min_price: 0.00,
    max_price: 0.00,
    status: 1,
    audit_status: 1,
    city: '邯郸',
    registration_deadline: new Date('2026-02-15 20:00:00')
  },
  {
    user_id: 1,
    title: '邯郸咖啡品鉴会 - 手冲咖啡体验',
    description: '学习手冲咖啡的艺术！专业咖啡师现场教学，品尝来自世界各地的精品咖啡豆。包含一杯手冲咖啡和一份甜点。',
    cover_image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800']),
    category: '美食',
    start_time: new Date('2026-02-14 14:00:00'),
    end_time: new Date('2026-02-14 17:00:00'),
    location: '邯郸市邯山区万达广场',
    address: '河北省邯郸市邯山区陵园路万达广场3楼',
    latitude: 36.5856,
    longitude: 114.5123,
    max_participants: 8,
    current_participants: 5,
    min_price: 88.00,
    max_price: 88.00,
    status: 1,
    audit_status: 1,
    city: '邯郸',
    registration_deadline: new Date('2026-02-14 10:00:00')
  },
  {
    user_id: 1,
    title: '邯郸KTV欢唱夜 - 周末放松时刻',
    description: '周末一起来KTV唱歌放松！我们已经预订了大包厢，音响效果超棒。欢迎各种曲风，从流行到经典，一起来嗨唱吧！',
    cover_image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800']),
    category: '娱乐',
    start_time: new Date('2026-02-15 18:00:00'),
    end_time: new Date('2026-02-16 02:00:00'),
    location: '邯郸市复兴区康德商场',
    address: '河北省邯郸市复兴区人民西路康德商场6楼',
    latitude: 36.6234,
    longitude: 114.4789,
    max_participants: 10,
    current_participants: 7,
    min_price: 58.00,
    max_price: 58.00,
    status: 1,
    audit_status: 1,
    city: '邯郸',
    registration_deadline: new Date('2026-02-15 12:00:00')
  },
  {
    user_id: 1,
    title: '邯郸羽毛球友谊赛 - 运动交友',
    description: '喜欢羽毛球的朋友看过来！我们每周固定组织羽毛球活动，水平不限，重在参与和交友。场地已预订，球拍可以租借。',
    cover_image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
    images: JSON.stringify(['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800']),
    category: '运动',
    start_time: new Date('2026-02-17 19:00:00'),
    end_time: new Date('2026-02-17 22:00:00'),
    location: '邯郸市体育中心',
    address: '河北省邯郸市丛台区人民东路邯郸市体育中心羽毛球馆',
    latitude: 36.5987,
    longitude: 114.5012,
    max_participants: 12,
    current_participants: 9,
    min_price: 30.00,
    max_price: 30.00,
    status: 1,
    audit_status: 1,
    city: '邯郸',
    registration_deadline: new Date('2026-02-17 15:00:00')
  }
];

async function seedParties() {
  try {
    console.log('开始插入测试聚会数据...');
    console.log('目标位置：河北邯郸 (36.61, 114.4876)');
    
    for (const partyData of testParties) {
      try {
        const party = await Party.create(partyData);
        console.log(`✅ 成功创建聚会: ${party.title} (ID: ${party.id})`);
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(`⚠️ 聚会已存在: ${partyData.title}`);
        } else {
          console.error(`❌ 创建聚会失败: ${partyData.title}`, error.message);
        }
      }
    }
    
    console.log('\n🎉 测试数据插入完成！');
    console.log('你可以现在打开微信小程序查看首页和聚会详情页的UI效果。');
    process.exit(0);
  } catch (error) {
    console.error('❌ 插入数据失败:', error.message);
    process.exit(1);
  }
}

// 运行种子脚本
seedParties();
