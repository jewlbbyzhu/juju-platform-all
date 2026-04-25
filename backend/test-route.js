// 测试路由文件加载
console.log('开始测试路由文件加载...\n');

try {
  console.log('1. 测试加载 chatController...');
  const chatController = require('../../controllers/chatController');
  console.log('✅ chatController 加载成功');
  console.log('   类型:', typeof chatController);
  console.log('   是否有 createConversation:', typeof chatController.createConversation);
} catch (err) {
  console.error('❌ chatController 加载失败:', err.message);
}

try {
  console.log('\n2. 测试加载 auth middleware...');
  const auth = require('../../middleware/auth');
  console.log('✅ auth middleware 加载成功');
  console.log('   类型:', typeof auth);
} catch (err) {
  console.error('❌ auth middleware 加载失败:', err.message);
}

try {
  console.log('\n3. 测试加载 express...');
  const express = require('express');
  console.log('✅ express 加载成功');
} catch (err) {
  console.error('❌ express 加载失败:', err.message);
}

console.log('\n测试完成!');
