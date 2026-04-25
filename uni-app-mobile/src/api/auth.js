import request from '../utils/request'

export const authApi = {
  login(code) {
    return request.post('/users/login', { code }).then((response) => {
      if (!response?.success) return response
      const { token, refreshToken, ...userInfo } = response.data || {}
      return {
        ...response,
        data: {
          token,
          refreshToken,
          userInfo
        }
      }
    })
  },

  getUserInfo() {
    return request.get('/users/profile').then((response) => {
      if (!response?.success) return response
      return {
        ...response,
        data: {
          userInfo: response.data,
          vipInfo: null,
          statistics: null
        }
      }
    })
  },

  updateProfile(data) {
    return request.put('/users/profile', data)
  },

  logout() {
    return Promise.resolve({ success: true, message: 'Logout successful', data: null })
  },

  sendVerifyCode(phone) {
    return request.post('/auth/verify-code', { phone })
  },

  phoneLogin(phone, code) {
    return request.post('/auth/phone-login', { phone, code })
  }
}
