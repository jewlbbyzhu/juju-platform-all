const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const logger = require('../../utils/logger');

// 检查用户是否需要完善资料（新用户引导）
router.get('/onboarding/status', async (req, res) => {
  try {
    // 实际应用中需要从JWT token获取用户ID
    // 这里简化处理，需要配合认证中间件使用
    const userId = req.user?.id || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权，请先登录',
        code: 'UNAUTHORIZED'
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'nickname', 'avatar', 'gender', 'birthday', 'is_profile_complete']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    // 检查是否需要完善资料
    const needsOnboarding = !user.is_profile_complete || 
                           !user.nickname || 
                           !user.gender || 
                           !user.birthday;

    res.json({
      success: true,
      data: {
        needs_onboarding: needsOnboarding,
        profile: {
          nickname: user.nickname,
          avatar: user.avatar,
          gender: user.gender,
          birthday: user.birthday,
          age: user.birthday ? calculateAge(user.birthday) : null
        }
      }
    });
  } catch (error) {
    logger.error('Get onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: '获取引导状态失败'
    });
  }
});

// 完善用户资料（新用户引导提交）
router.post('/onboarding/complete', async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { nickname, avatar, gender, birthday } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权，请先登录',
        code: 'UNAUTHORIZED'
      });
    }

    // 验证必填字段
    const errors = [];
    if (!nickname || nickname.trim().length < 2) {
      errors.push('昵称至少需要2个字符');
    }
    if (!gender || ![0, 1, 2].includes(parseInt(gender))) {
      errors.push('请选择有效的性别（0保密/1男/2女）');
    }
    if (!birthday) {
      errors.push('请选择生日');
    } else {
      const age = calculateAge(birthday);
      if (age < 18) {
        errors.push('年龄需满18周岁');
      }
      if (age > 100) {
        errors.push('请输入有效的生日');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: '资料验证失败',
        errors,
        code: 'VALIDATION_ERROR'
      });
    }

    // 更新用户资料
    await User.update({
      nickname: nickname.trim(),
      avatar: avatar || null,
      gender: parseInt(gender),
      birthday: birthday,
      is_profile_complete: true,
      updated_at: new Date()
    }, {
      where: { id: userId }
    });

    // 获取更新后的用户信息
    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'nickname', 'avatar', 'gender', 'birthday', 'is_profile_complete']
    });

    res.json({
      success: true,
      message: '资料完善成功',
      data: {
        user: {
          id: updatedUser.id,
          nickname: updatedUser.nickname,
          avatar: updatedUser.avatar,
          gender: updatedUser.gender,
          birthday: updatedUser.birthday,
          age: calculateAge(updatedUser.birthday),
          is_profile_complete: updatedUser.is_profile_complete
        }
      }
    });
  } catch (error) {
    logger.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: '完善资料失败'
    });
  }
});

// 计算年龄
function calculateAge(birthday) {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

module.exports = router;
