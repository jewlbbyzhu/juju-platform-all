const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.development' })

const { sequelize } = require('../src/config/database')
const db = require('../src/models')
const partyService = require('../src/services/partyService')
const { generateAccessToken } = require('../src/config/jwt')

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

async function ensureUser5() {
  const existed = await db.User.findByPk(5)
  if (existed) return existed

  const user = await db.User.create({
    id: 5,
    openid: 'e2e-openid-user-5',
    nickname: 'E2E用户5',
    avatar: '',
    gender: 0,
    status: 1
  })
  return user
}

async function findPartyByTitle(userId, title) {
  return await db.Party.findOne({
    where: { user_id: userId, title }
  })
}

async function ensureE2eParties(userId) {
  const now = new Date()
  const base = [
    {
      title: '[E2E] 霓虹派对-回归用例A',
      category: '0',
      min_price: 68,
      max_price: 168
    },
    {
      title: '[E2E] 潮酷派对-回归用例B',
      category: '1',
      min_price: 88,
      max_price: 188
    },
    {
      title: '[E2E] 未来派对-回归用例C',
      category: '3',
      min_price: 58,
      max_price: 158
    }
  ]

  const created = []
  for (let i = 0; i < base.length; i++) {
    const item = base[i]
    const existed = await findPartyByTitle(userId, item.title)
    if (existed) {
      created.push(existed)
      continue
    }

    const start = addHours(now, 24 + i * 3)
    const end = addHours(start, 4)

    const party = await partyService.createParty(userId, {
      title: item.title,
      description: '自动化测试种子数据，用于小程序回归集。',
      cover_image: '',
      images: [],
      category: item.category,
      start_time: start,
      end_time: end,
      location: '合肥',
      address: 'E2E 测试地址',
      latitude: 31.8206,
      longitude: 117.2272,
      max_participants: 30,
      min_price: item.min_price,
      max_price: item.max_price,
      ticket_types: [
        {
          name: '普通票',
          description: 'E2E 普通票',
          type: 1,
          price: item.min_price,
          original_price: item.min_price + 20,
          available_count: 100,
          max_per_user: 2,
          sort_order: 1
        },
        {
          name: '早鸟票',
          description: 'E2E 早鸟票',
          type: 2,
          price: Math.max(item.min_price - 10, 1),
          original_price: item.min_price,
          available_count: 50,
          max_per_user: 1,
          sort_order: 0,
          early_bird_deadline: addHours(now, 12)
        }
      ]
    })

    const published = await partyService.publishParty(party.id, userId)
    created.push(published)
  }

  return created
}

async function writeBootstrapFile({ user, token, parties }) {
  const outDir = path.resolve(__dirname, '../.e2e')
  ensureDir(outDir)
  const outPath = path.join(outDir, 'bootstrap-user5.json')

  const payload = {
    userId: user.id,
    userInfo: {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar || '',
      gender: user.gender || 0
    },
    token,
    partyIds: parties.map((p) => p.id)
  }

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8')
  return outPath
}

async function main() {
  try {
    await sequelize.authenticate()

    const user = await ensureUser5()
    await db.Wallet.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        user_id: user.id,
        balance: 500,
        frozen_balance: 0,
        total_income: 500,
        total_expense: 0,
        status: 1
      }
    })

    const parties = await ensureE2eParties(user.id)
    const token = generateAccessToken({ id: user.id, openid: user.openid, role: 'user' })
    const filePath = await writeBootstrapFile({ user, token, parties })

    console.log(`[e2e-bootstrap] userId=${user.id} parties=${parties.length} file=${filePath}`)
    process.exit(0)
  } catch (err) {
    console.error('[e2e-bootstrap] failed:', err && (err.stack || err.message || err))
    process.exit(1)
  }
}

main()

