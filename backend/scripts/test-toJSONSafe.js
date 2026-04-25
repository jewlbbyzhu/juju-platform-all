const { toJSONSafe } = require('../src/utils/circularRefCleaner');

// 模拟 Sequelize 模型的 toJSON 输出
const mockParty = {
  id: 12,
  title: '周末桌游聚会 - 狼人杀之夜',
  cover_image: 'https://images.unsplash.com/photo-1610890716171-6b1c9e2e1d8e?w=800',
  start_time: new Date('2026-02-15T11:00:00.000Z'),
  end_time: new Date('2026-02-16T15:00:00.000Z'),
  created_at: new Date('2026-01-31T06:08:30.000Z'),
  user: {
    id: 1,
    nickname: 'Smoke',
    avatar: 'https://a.b/c.png'
  }
};

console.log('Input mockParty:');
console.log('  cover_image:', mockParty.cover_image);
console.log('  start_time:', mockParty.start_time);
console.log('  user:', mockParty.user);

const result = toJSONSafe(mockParty);

console.log('\nOutput result:');
console.log('  cover_image:', result.cover_image);
console.log('  start_time:', result.start_time);
console.log('  user:', result.user);
console.log('\nFull result:', JSON.stringify(result, null, 2));
