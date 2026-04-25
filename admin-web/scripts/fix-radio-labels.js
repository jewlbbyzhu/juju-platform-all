/**
 * 批量修复 el-radio 和 el-radio-button 的 label 属性为 value 属性
 * Element Plus 3.0 将弃用 label 作为值的做法
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/views/analytics/index.vue',
  'src/views/app/components/FeedbackList.vue',
  'src/components/app/VersionEditor.vue',
  'src/components/system/BatchPermissionOperations.vue',
  'src/components/system/RolePermissionManager.vue',
  'src/views/content/index.vue',
  'src/components/orders/RefundAuditDialog.vue',
  'src/components/parties/PartyAuditForm.vue'
];

const srcDir = path.join(__dirname, '..');

filesToFix.forEach(file => {
  const filePath = path.join(srcDir, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ 文件不存在: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // 替换 el-radio-button 的 label 为 value
  content = content.replace(/<el-radio-button\s+label=/g, '<el-radio-button value=');

  // 替换 el-radio 的 label 为 value (但保留 :label 用于动态绑定)
  // 注意：:label 是动态绑定，需要保留，但 Element Plus 建议使用 :value
  content = content.replace(/<el-radio\s+label=/g, '<el-radio value=');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ 已修复: ${file}`);
  } else {
    console.log(`⏭️ 无需修复: ${file}`);
  }
});

console.log('\n🎉 批量修复完成！');
