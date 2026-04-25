const { Admin, Role, Permission } = require('../models');
const logger = require('./logger');

const checkPermission = (permissionCode) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: '未授权，请重新登录',
          code: 'UNAUTHORIZED'
        });
      }

      const admin = await Admin.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: 'role',
            include: [
              {
                model: Permission,
                as: 'permissions'
              }
            ]
          }
        ]
      });

      if (!admin) {
        return res.status(403).json({
          success: false,
          message: '管理员不存在',
          code: 'FORBIDDEN'
        });
      }

      if (admin.status !== 1) {
        return res.status(403).json({
          success: false,
          message: '管理员账号已被禁用',
          code: 'FORBIDDEN'
        });
      }

      const role = admin.role;
      if (!role) {
        return res.status(403).json({
          success: false,
          message: '角色不存在',
          code: 'FORBIDDEN'
        });
      }

      if (role.status !== 1) {
        return res.status(403).json({
          success: false,
          message: '角色已被禁用',
          code: 'FORBIDDEN'
        });
      }

      const permissions = role.permissions || [];
      if (!Array.isArray(permissions)) {
        return res.status(403).json({
          success: false,
          message: '权限配置错误',
          code: 'FORBIDDEN'
        });
      }

      const hasPermission = permissions.some(permission => 
        permission && permission.code === permissionCode && permission.status === 1
      );

      if (!hasPermission) {
        logger.warn('权限检查失败:', {
          adminId: req.user.id,
          requiredPermission: permissionCode,
          availablePermissions: permissions.map(p => p.code)
        });

        return res.status(403).json({
          success: false,
          message: '权限不足',
          code: 'FORBIDDEN',
          requiredPermission: permissionCode
        });
      }

      logger.debug('权限检查通过:', {
        adminId: req.user.id,
        permission: permissionCode
      });

      next();
    } catch (error) {
      logger.error('权限检查失败:', error);
      return res.status(500).json({
        success: false,
        message: '权限检查失败',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  };
};

const checkAnyPermission = (permissionCodes) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: '未授权，请重新登录',
          code: 'UNAUTHORIZED'
        });
      }

      const admin = await Admin.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: 'role',
            include: [
              {
                model: Permission,
                as: 'permissions'
              }
            ]
          }
        ]
      });

      if (!admin) {
        return res.status(403).json({
          success: false,
          message: '管理员不存在',
          code: 'FORBIDDEN'
        });
      }

      if (admin.status !== 1) {
        return res.status(403).json({
          success: false,
          message: '管理员账号已被禁用',
          code: 'FORBIDDEN'
        });
      }

      const role = admin.role;
      if (!role) {
        return res.status(403).json({
          success: false,
          message: '角色不存在',
          code: 'FORBIDDEN'
        });
      }

      if (role.status !== 1) {
        return res.status(403).json({
          success: false,
          message: '角色已被禁用',
          code: 'FORBIDDEN'
        });
      }

      const permissions = role.permissions || [];
      if (!Array.isArray(permissions)) {
        return res.status(403).json({
          success: false,
          message: '权限配置错误',
          code: 'FORBIDDEN'
        });
      }

      const hasAnyPermission = permissions.some(permission => 
        permission && permission.status === 1 && 
        permissionCodes.includes(permission.code)
      );

      if (!hasAnyPermission) {
        logger.warn('权限检查失败:', {
          adminId: req.user.id,
          requiredPermissions: permissionCodes,
          availablePermissions: permissions.map(p => p.code)
        });

        return res.status(403).json({
          success: false,
          message: '权限不足',
          code: 'FORBIDDEN',
          requiredPermissions: permissionCodes
        });
      }

      logger.debug('权限检查通过:', {
        adminId: req.user.id,
        permissions: permissionCodes
      });

      next();
    } catch (error) {
      logger.error('权限检查失败:', error);
      return res.status(500).json({
        success: false,
        message: '权限检查失败',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  };
};

const checkRole = (roleIds) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: '未授权，请重新登录',
          code: 'UNAUTHORIZED'
        });
      }

      const admin = await Admin.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: 'role'
          }
        ]
      });

      if (!admin) {
        return res.status(403).json({
          success: false,
          message: '管理员不存在',
          code: 'FORBIDDEN'
        });
      }

      if (admin.status !== 1) {
        return res.status(403).json({
          success: false,
          message: '管理员账号已被禁用',
          code: 'FORBIDDEN'
        });
      }

      const role = admin.role;
      if (!role) {
        return res.status(403).json({
          success: false,
          message: '角色不存在',
          code: 'FORBIDDEN'
        });
      }

      const hasRequiredRole = Array.isArray(roleIds) && roleIds.includes(admin.role_id);

      if (!hasRequiredRole) {
        logger.warn('角色检查失败:', {
          adminId: req.user.id,
          currentRoleId: admin.role_id,
          requiredRoleIds: roleIds
        });

        return res.status(403).json({
          success: false,
          message: '权限不足',
          code: 'FORBIDDEN',
          requiredRoleIds: roleIds
        });
      }

      logger.debug('角色检查通过:', {
        adminId: req.user.id,
        roleId: admin.role_id
      });

      next();
    } catch (error) {
      logger.error('角色检查失败:', error);
      return res.status(500).json({
        success: false,
        message: '角色检查失败',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkRole
};
