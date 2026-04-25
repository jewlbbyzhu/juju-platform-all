const adminService = require('../services/adminService');
const logger = require('../utils/logger');
// const { Permission } = require('../models'); // 保留以备将来使用

class AdminController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await adminService.login(username, password);
      
      const user = {
        id: result.admin.id,
        username: result.admin.username,
        nickname: result.admin.real_name || result.admin.username,
        avatar: result.admin.avatar,
        email: result.admin.email,
        role: result.admin.role_id === 1 ? 'super_admin' : 'operation_admin',
        status: result.admin.status === 1 ? 'active' : 'disabled',
        lastLoginAt: result.admin.last_login_at,
        createdAt: result.admin.created_at,
        updatedAt: result.admin.updated_at
      };
      
      let permissions = result.admin.role?.permissions || [];
      // If super admin with '*' permission, return ['*'] to indicate all permissions
      // Frontend will handle '*' as having all permissions
      if (Array.isArray(permissions) && permissions.includes('*')) {
        permissions = ['*'];
      }

      const data = {
        token: result.token,
        user: user,
        permissions,
        expiresIn: 7 * 24 * 60 * 60
      };

      if (result.refreshToken) {
        data.refreshToken = result.refreshToken;
      }

      res.json({
        success: true,
        message: 'Login successful',
        data
      });
    } catch (error) {
      logger.error('Admin login error:', error);
      next(error);
    }
  }

  async getAdmin(req, res, next) {
    try {
      const admin = await adminService.getAdminById(req.params.id);
      res.json({
        success: true,
        data: admin
      });
    } catch (error) {
      logger.error('Get admin error:', error);
      next(error);
    }
  }

  async getAdminList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
      const filters = {
        status: req.query.status ? parseInt(req.query.status) : undefined,
        role_id: req.query.role_id ? parseInt(req.query.role_id) : undefined,
        keyword: req.query.keyword
      };

      const result = await adminService.getAdminList(page, limit, filters);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get admin list error:', error);
      next(error);
    }
  }

  async createAdmin(req, res, next) {
    try {
      const admin = await adminService.createAdmin(req.body);
      res.json({
        success: true,
        message: 'Admin created successfully',
        data: admin
      });
    } catch (error) {
      logger.error('Create admin error:', error);
      next(error);
    }
  }

  async updateAdmin(req, res, next) {
    try {
      const admin = await adminService.updateAdmin(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Admin updated successfully',
        data: admin
      });
    } catch (error) {
      logger.error('Update admin error:', error);
      next(error);
    }
  }

  async deleteAdmin(req, res, next) {
    try {
      const result = await adminService.deleteAdmin(req.params.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Delete admin error:', error);
      next(error);
    }
  }

  async updateAdminStatus(req, res, next) {
    try {
      const { status } = req.body;
      const admin = await adminService.updateAdminStatus(req.params.id, status);
      res.json({
        success: true,
        message: 'Admin status updated successfully',
        data: admin
      });
    } catch (error) {
      logger.error('Update admin status error:', error);
      next(error);
    }
  }

  async getRoleList(req, res, next) {
    try {
      const roles = await adminService.getRoleList();
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      logger.error('Get role list error:', error);
      next(error);
    }
  }

  async getRole(req, res, next) {
    try {
      const role = await adminService.getRoleById(req.params.id);
      res.json({
        success: true,
        data: role
      });
    } catch (error) {
      logger.error('Get role error:', error);
      next(error);
    }
  }

  async createRole(req, res, next) {
    try {
      const role = await adminService.createRole(req.body);
      res.json({
        success: true,
        message: 'Role created successfully',
        data: role
      });
    } catch (error) {
      logger.error('Create role error:', error);
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const role = await adminService.updateRole(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Role updated successfully',
        data: role
      });
    } catch (error) {
      logger.error('Update role error:', error);
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    try {
      const result = await adminService.deleteRole(req.params.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Delete role error:', error);
      next(error);
    }
  }

  async getPermissionList(req, res, next) {
    try {
      const permissions = await adminService.getPermissionList();
      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      logger.error('Get permission list error:', error);
      next(error);
    }
  }

  async getPermission(req, res, next) {
    try {
      const permission = await adminService.getPermissionById(req.params.id);
      res.json({
        success: true,
        data: permission
      });
    } catch (error) {
      logger.error('Get permission error:', error);
      next(error);
    }
  }

  async createPermission(req, res, next) {
    try {
      const permission = await adminService.createPermission(req.body);
      res.json({
        success: true,
        message: 'Permission created successfully',
        data: permission
      });
    } catch (error) {
      logger.error('Create permission error:', error);
      next(error);
    }
  }

  async updatePermission(req, res, next) {
    try {
      const permission = await adminService.updatePermission(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Permission updated successfully',
        data: permission
      });
    } catch (error) {
      logger.error('Update permission error:', error);
      next(error);
    }
  }

  async deletePermission(req, res, next) {
    try {
      const result = await adminService.deletePermission(req.params.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Delete permission error:', error);
      next(error);
    }
  }

  async changeAdminPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      const result = await adminService.changeAdminPassword(id, password);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Change admin password error:', error);
      next(error);
    }
  }
}

module.exports = new AdminController();
