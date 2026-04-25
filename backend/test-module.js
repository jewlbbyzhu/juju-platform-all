// 测试模块加载
try {
  const chatController = require('./src/controllers/chatController');
  console.log('✅ chatController 加载成功');
  console.log('导出内容:', Object.keys(chatController));
} catch (err) {
  console.error('❌ chatController 加载失败:', err.message);
}

try {
  const chatService = require('./src/services/chatService');
  console.log('✅ chatService 加载成功');
} catch (err) {
  console.error('❌ chatService 加载失败:', err.message);
}

try {
  const auth = require('./src/middleware/auth');
  console.log('✅ auth middleware 加载成功');
} catch (err) {
  console.error('❌ auth middleware 加载失败:', err.message);
}
