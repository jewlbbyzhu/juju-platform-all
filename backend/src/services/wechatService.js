const axios = require('axios');
const logger = require('../utils/logger');

class WechatService {
  async getOpenIdByCode(code) {
    try {
      const appId = process.env.WECHAT_APP_ID;
      const appSecret = process.env.WECHAT_APP_SECRET;
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

      const response = await axios.get(url);

      if (response.data.errcode && response.data.errcode !== 0) {
        throw new Error(`WeChat API error: ${response.data.errmsg}`);
      }

      if (!response.data.openid) {
        throw new Error('WeChat API error: openid not found in response');
      }

      return {
        openid: response.data.openid,
        unionid: response.data.unionid || null,
        sessionKey: response.data.session_key
      };
    } catch (error) {
      logger.error('Get openid by code failed:', error);
      throw error;
    }
  }
}

module.exports = new WechatService();
