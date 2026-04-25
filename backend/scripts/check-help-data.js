/**
 * 检查帮助文档数据
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') })

const { Announcement } = require('../src/models')

async function checkHelpData() {
  try {
    console.log('=== 检查帮助文档数据 ===\n')
    
    // 统计总数
    const total = await Announcement.count({ where: { type: 'help' } })
    console.log(`帮助文档总数: ${total}\n`)
    
    // 按分类统计
    const categories = await Announcement.findAll({
      where: { type: 'help' },
      attributes: ['category', 'status'],
      raw: true
    })
    
    const categoryCount = {}
    categories.forEach(item => {
      const cat = item.category || 'null'
      categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })
    
    console.log('按分类统计:')
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`)
    })
    
    console.log('\n前5条帮助文档:')
    const articles = await Announcement.findAll({
      where: { type: 'help' },
      attributes: ['id', 'title', 'category', 'status'],
      limit: 5,
      raw: true
    })
    
    articles.forEach(article => {
      console.log(`  [${article.category}] ${article.title} (status: ${article.status})`)
    })
    
    console.log('\n=== 检查完成 ===')
    process.exit(0)
  } catch (error) {
    console.error('检查失败:', error)
    process.exit(1)
  }
}

checkHelpData()
