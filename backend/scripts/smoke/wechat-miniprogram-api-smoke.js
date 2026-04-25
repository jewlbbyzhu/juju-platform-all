const axios = require('axios')

async function main() {
  const baseUrl = (process.env.JUJU_API_BASE_URL || 'http://127.0.0.1:3010/api/v1').replace(/\/$/, '')
  const openid =
    process.env.JUJU_SMOKE_OPENID || `smoke_openid_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
  const nickname = process.env.JUJU_SMOKE_NICKNAME || 'smoke-user'

  const client = axios.create({
    baseURL: baseUrl,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true
  })

  const safePost = async (path, data) => {
    const res = await client.post(path, data)
    return { status: res.status, data: res.data }
  }

  const safeGet = async (path, token) => {
    const res = await client.get(path, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
    return { status: res.status, data: res.data }
  }

  process.stdout.write(`BaseUrl=${baseUrl}\nOpenId=${openid}\n`)

  await safePost('/users/register', { openid, nickname })

  const login = await safePost('/users/login', { openid })
  if (login.status !== 200 || !login.data?.success) {
    throw new Error(`login failed: HTTP ${login.status} ${JSON.stringify(login.data)}`)
  }
  const token = login.data?.data?.token
  const refreshToken = login.data?.data?.refreshToken
  if (!token || !refreshToken) {
    throw new Error(`login response missing token/refreshToken: ${JSON.stringify(login.data)}`)
  }

  const profile = await safeGet('/users/profile', token)
  if (profile.status !== 200 || !profile.data?.success) {
    throw new Error(`profile failed: HTTP ${profile.status} ${JSON.stringify(profile.data)}`)
  }

  const refresh = await safePost('/auth/refresh', { refreshToken })
  if (refresh.status !== 200 || !refresh.data?.success) {
    throw new Error(`refresh failed: HTTP ${refresh.status} ${JSON.stringify(refresh.data)}`)
  }
  const token2 = refresh.data?.data?.token
  if (!token2) throw new Error(`refresh response missing token: ${JSON.stringify(refresh.data)}`)

  const profile2 = await safeGet('/users/profile', token2)
  if (profile2.status !== 200 || !profile2.data?.success) {
    throw new Error(`profile after refresh failed: HTTP ${profile2.status} ${JSON.stringify(profile2.data)}`)
  }

  const invalidProfile = await safeGet('/users/profile', 'invalid.token.value')
  if (invalidProfile.status !== 401) {
    throw new Error(`invalid token expected 401 but got ${invalidProfile.status}: ${JSON.stringify(invalidProfile.data)}`)
  }

  process.stdout.write('OK\n')
}

main().catch((err) => {
  process.stderr.write(`${err.message}\n`)
  process.exit(1)
})
