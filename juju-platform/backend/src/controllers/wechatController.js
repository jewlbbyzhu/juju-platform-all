const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const axios = require('axios');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');

/**
 * 微信小程序控制器
 */
class WechatController {
  /**
   * 微信小程序登录
   */
  async login(req, res) {
    try {
      const { code, userInfo } = req.body;

      if (!code) {
        return error(res, '请提供微信登录code', 400);
      }

      // 调用微信接口获取 openid 和 session_key
      const wxUrl = 'https://api.weixin.qq.com/sns/jscode2session';
      const wxResponse = await axios.get(wxUrl, {
        params: {
          appid: process.env.WECHAT_APPID,
          secret: process.env.WECHAT_SECRET,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });

      const { openid, unionid } = wxResponse.data;

      if (!openid) {
        logger.error('微信登录失败:', wxResponse.data);
        return error(res, '微信登录失败', 401);
      }

      const { User } = require('../models');

      // 查找或创建用户
      let user = await User.findOne({ where: { openid } });

      if (!user) {
        // 创建新用户
        user = await User.create({
          openid,
          unionid: unionid || null,
          nickname: userInfo?.nickName || `微信用户${openid.slice(-6)}`,
          avatar: userInfo?.avatarUrl || '',
          gender: userInfo?.gender || 0,
          city: userInfo?.city || '',
          province: userInfo?.province || '',
          country: userInfo?.country || '',
          status: 1
        });
        logger.info('新用户注册:', { userId: user.id, openid });
      } else {
        // 更新用户信息
        if (userInfo) {
          await user.update({
            nickname: userInfo.nickName || user.nickname,
            avatar: userInfo.avatarUrl || user.avatar,
            gender: userInfo.gender || user.gender,
            city: userInfo.city || user.city,
            province: userInfo.province || user.province,
            country: userInfo.country || user.country
          });
        }
        logger.info('用户登录:', { userId: user.id, openid });
      }

      // 生成 JWT token
      const tokenPayload = {
        id: user.id,
        role: 'user',
        openid: user.openid
      };

      if (user.unionid) {
        tokenPayload.unionid = user.unionid;
      }

      const token = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return success(res, {
        token,
        refreshToken,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          isVip: user.is_vip,
          vipType: user.vip_type,
          vipExpiredAt: user.vip_expired_at
        }
      });
    } catch (err) {
      logger.error('微信登录失败:', err);
      return error(res, '微信登录失败', 500);
    }
  }

  /**
   * 更新用户资料
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { nickname, avatar, gender, city, province, country, bio } = req.body;
      const { User } = require('../models');

      const user = await User.findByPk(userId);
      if (!user) {
        return error(res, '用户不存在', 404);
      }

      const updateData = {};
      if (nickname !== undefined) updateData.nickname = nickname;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (gender !== undefined) updateData.gender = gender;
      if (city !== undefined) updateData.city = city;
      if (province !== undefined) updateData.province = province;
      if (country !== undefined) updateData.country = country;
      if (bio !== undefined) updateData.bio = bio;

      await user.update(updateData);

      return success(res, {
        message: '更新成功',
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          gender: user.gender,
          city: user.city,
          province: user.province,
          country: user.country,
          bio: user.bio
        }
      });
    } catch (err) {
      logger.error('更新用户资料失败:', err);
      return error(res, '更新用户资料失败', 500);
    }
  }
}

module.exports = new WechatController();
