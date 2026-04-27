#!/usr/bin/env node
/**
 * UI Notes 集成工具
 * 将APP截图/页面转换为Figma设计稿，用于竞品分析和设计参考
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  screenshotDir: './assets/screenshots',
  outputDir: './design-reference',
  targetApps: [
    'xiaohongshu',  // 小红书 - 社区功能参考
    'meituan',      // 美团 - 团购功能参考
    'douyin',       // 抖音 - 社交功能参考
    'dazhong',      // 大众点评 - 活动参考
  ]
};

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 模拟UI Notes分析 - 分析截图并生成设计文档
function analyzeScreenshot(appName, screenshotPath) {
  console.log(`🔍 分析 ${appName} 截图...`);
  
  // 这里应该调用UI Notes API进行实际分析
  // 现在生成设计参考文档
  const designDoc = {
    app: appName,
    source: screenshotPath,
    analyzedAt: new Date().toISOString(),
    components: {
      navigation: extractNavigation(appName),
      cards: extractCardDesign(appName),
      colors: extractColorScheme(appName),
      typography: extractTypography(appName),
    },
    recommendations: generateRecommendations(appName)
  };
  
  return designDoc;
}

// 提取导航设计
function extractNavigation(appName) {
  const designs = {
    xiaohongshu: {
      type: 'bottom-tab',
      tabs: ['首页', '购物', '发布', '消息', '我'],
      style: 'minimal-icons-with-labels',
      color: '#FF2442'
    },
    meituan: {
      type: 'bottom-tab',
      tabs: ['首页', '附近', '订单', '我的'],
      style: 'icons-with-badges',
      color: '#FFD100'
    },
    douyin: {
      type: 'bottom-tab',
      tabs: ['首页', '朋友', '发布', '消息', '我'],
      style: 'center-action-button',
      color: '#000000'
    },
    dazhong: {
      type: 'bottom-tab',
      tabs: ['首页', '发现', '消息', '我的'],
      style: 'standard-icons',
      color: '#FF6633'
    }
  };
  return designs[appName] || {};
}

// 提取卡片设计
function extractCardDesign(appName) {
  const designs = {
    xiaohongshu: {
      layout: 'masonry-grid',
      borderRadius: 8,
      shadow: 'subtle',
      imageRatio: '3:4',
      infoPosition: 'bottom'
    },
    meituan: {
      layout: 'list-with-cards',
      borderRadius: 12,
      shadow: 'medium',
      imageRatio: '16:9',
      infoPosition: 'right'
    },
    douyin: {
      layout: 'full-screen-vertical',
      borderRadius: 0,
      shadow: 'none',
      imageRatio: '9:16',
      infoPosition: 'overlay'
    },
    dazhong: {
      layout: 'horizontal-cards',
      borderRadius: 8,
      shadow: 'light',
      imageRatio: '4:3',
      infoPosition: 'right'
    }
  };
  return designs[appName] || {};
}

// 提取配色方案
function extractColorScheme(appName) {
  const schemes = {
    xiaohongshu: {
      primary: '#FF2442',
      secondary: '#FF6B6B',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#333333',
      textSecondary: '#666666'
    },
    meituan: {
      primary: '#FFD100',
      secondary: '#FF6B00',
      background: '#F8F8F8',
      surface: '#FFFFFF',
      text: '#333333',
      textSecondary: '#999999'
    },
    douyin: {
      primary: '#FE2C55',
      secondary: '#25F4EE',
      background: '#161823',
      surface: '#252632',
      text: '#FFFFFF',
      textSecondary: '#8A8B91'
    },
    dazhong: {
      primary: '#FF6633',
      secondary: '#FFA500',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#333333',
      textSecondary: '#666666'
    }
  };
  return schemes[appName] || {};
}

// 提取字体设计
function extractTypography(appName) {
  return {
    heading: { size: '18px', weight: '600', lineHeight: 1.4 },
    body: { size: '14px', weight: '400', lineHeight: 1.5 },
    caption: { size: '12px', weight: '400', lineHeight: 1.3 },
    button: { size: '16px', weight: '600', lineHeight: 1 }
  };
}

// 生成JUJU App设计建议
function generateRecommendations(appName) {
  const recommendations = {
    xiaohongshu: [
      '采用瀑布流布局展示聚会列表',
      '图片比例3:4，突出视觉吸引力',
      '底部导航使用图标+文字组合',
      '强调红色品牌色用于CTA按钮'
    ],
    meituan: [
      '列表+卡片混合布局',
      '突出价格信息和优惠信息',
      '使用徽章显示热门/推荐标签',
      '黄色强调团购/优惠属性'
    ],
    douyin: [
      '全屏沉浸式浏览体验',
      '左右滑动切换不同聚会',
      '重叠式信息展示',
      '深色模式更适合夜间使用'
    ],
    dazhong: [
      '横向滑动卡片展示精选活动',
      '星级评分系统',
      '距离和地点信息突出显示',
      '橙色强调活力和热情'
    ]
  };
  return recommendations[appName] || [];
}

// 生成Figma设计文档
function generateFigmaDoc(analysisResults) {
  const doc = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    project: 'JUJU App Design Reference',
    pages: [
      {
        name: '竞品分析 - 小红书',
        content: analysisResults.find(r => r.app === 'xiaohongshu')
      },
      {
        name: '竞品分析 - 美团',
        content: analysisResults.find(r => r.app === 'meituan')
      },
      {
        name: '竞品分析 - 抖音',
        content: analysisResults.find(r => r.app === 'douyin')
      },
      {
        name: '竞品分析 - 大众点评',
        content: analysisResults.find(r => r.app === 'dazhong')
      },
      {
        name: 'JUJU设计建议',
        content: generateJujuDesignGuide(analysisResults)
      }
    ]
  };
  return doc;
}

// 生成JUJU设计指南
function generateJujuDesignGuide(analysisResults) {
  return {
    name: 'JUJU App Design System',
    recommendations: {
      navigation: {
        type: 'bottom-tab',
        tabs: ['发现', '社区', '发布', '订单', '我的'],
        style: '小红书风格，简洁图标+文字',
        activeColor: '#FF6B6B'
      },
      cards: {
        layout: '瀑布流网格',
        borderRadius: 12,
        shadow: 'medium',
        imageRatio: '4:3',
        info: '显示标题、时间、价格、距离'
      },
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        background: '#FFFFFF',
        surface: '#F8F9FA',
        text: '#2D3436',
        textSecondary: '#636E72'
      },
      typography: {
        heading: { size: '20px', weight: '700' },
        body: { size: '14px', weight: '400' },
        price: { size: '18px', weight: '700', color: '#FF6B6B' }
      }
    },
    screenGuidelines: {
      home: '瀑布流展示聚会卡片，顶部搜索+筛选',
      community: '小红书风格帖子流，支持图文视频',
      create: '简洁表单，步骤指示器',
      orders: '美团风格订单列表，状态标签',
      profile: '抖音风格个人信息页'
    }
  };
}

// 主函数
function main() {
  console.log('🎨 UI Notes 设计分析工具');
  console.log('========================\n');
  
  ensureDir(CONFIG.outputDir);
  
  // 分析每个竞品APP
  const results = CONFIG.targetApps.map(app => {
    const screenshotPath = path.join(CONFIG.screenshotDir, `${app}.png`);
    return analyzeScreenshot(app, screenshotPath);
  });
  
  // 生成Figma设计文档
  const figmaDoc = generateFigmaDoc(results);
  
  // 保存结果
  const outputPath = path.join(CONFIG.outputDir, 'design-reference.json');
  fs.writeFileSync(outputPath, JSON.stringify(figmaDoc, null, 2));
  
  // 生成Markdown报告
  generateMarkdownReport(results, figmaDoc);
  
  console.log('\n✅ 分析完成！');
  console.log(`📄 设计文档: ${outputPath}`);
  console.log(`📊 Markdown报告: ${path.join(CONFIG.outputDir, 'design-report.md')}`);
}

// 生成Markdown报告
function generateMarkdownReport(results, figmaDoc) {
  let md = `# JUJU App 竞品设计分析报告\n\n`;
  md += `生成时间: ${new Date().toLocaleString()}\n\n`;
  md += `---\n\n`;
  
  results.forEach(r => {
    md += `## ${r.app.toUpperCase()} 分析\n\n`;
    md += `### 导航设计\n`;
    md += `- 类型: ${r.components.navigation.type}\n`;
    md += `- 风格: ${r.components.navigation.style}\n`;
    md += `- 主色调: ${r.components.navigation.color}\n\n`;
    
    md += `### 卡片设计\n`;
    md += `- 布局: ${r.components.cards.layout}\n`;
    md += `- 圆角: ${r.components.cards.borderRadius}px\n`;
    md += `- 图片比例: ${r.components.cards.imageRatio}\n\n`;
    
    md += `### 配色方案\n`;
    md += `- 主色: ${r.components.colors.primary}\n`;
    md += `- 背景: ${r.components.colors.background}\n\n`;
    
    md += `### 对JUJU的建议\n`;
    r.recommendations.forEach(rec => {
      md += `- ${rec}\n`;
    });
    md += '\n---\n\n';
  });
  
  // 添加JUJU设计建议
  const jujuGuide = figmaDoc.pages.find(p => p.name === 'JUJU设计建议');
  if (jujuGuide) {
    md += `## JUJU App 设计建议\n\n`;
    md += `### 导航设计\n`;
    md += `- 底部5个Tab: ${jujuGuide.content.recommendations.navigation.tabs.join(', ')}\n`;
    md += `- 风格: ${jujuGuide.content.recommendations.navigation.style}\n`;
    md += `- 激活色: ${jujuGuide.content.recommendations.navigation.activeColor}\n\n`;
    
    md += `### 页面规范\n`;
    Object.entries(jujuGuide.content.screenGuidelines).forEach(([screen, desc]) => {
      md += `- **${screen}**: ${desc}\n`;
    });
  }
  
  const mdPath = path.join(CONFIG.outputDir, 'design-report.md');
  fs.writeFileSync(mdPath, md);
}

// 如果直接运行
if (require.main === module) {
  main();
}

module.exports = { analyzeScreenshot, generateFigmaDoc };
