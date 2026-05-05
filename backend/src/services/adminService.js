const { Admin, Role, Permission } = require('../models');
const { Op } = require('sequelize');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const { AuthenticationError } = require('../utils/errors');

class AdminService {
  async login(username, password) {
    try {
      const admin = await Admin.findOne({
        where: { username },
        include: [
          {
            model: Role,
            as: 'role'
          }
        ]
      });

      if (!admin) {
        throw new AuthenticationError('Admin not found');
      }

      if (admin.status !== 1) {
        throw new AuthenticationError('Admin account is disabled');
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid password');
      }

      admin.last_login_at = new Date();
      admin.last_login_ip = this.getClientIP();
      await admin.save();

      const token = generateToken({
        id: admin.id,
        username: admin.username,
        role: 'admin',
        role_id: admin.role_id
      });
      const refreshToken = generateRefreshToken({
        id: admin.id,
        username: admin.username,
        role: 'admin',
        role_id: admin.role_id
      });

      return {
        admin: this.sanitizeAdmin(admin),
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('Admin login failed:', error);
      throw error;
    }
  }

  async getAdminById(adminId) {
    try {
      const admin = await Admin.findByPk(adminId, {
        include: [
          {
            model: Role,
            as: 'role'
          }
        ]
      });

      if (!admin) {
        throw new Error('Admin not found');
      }

      return this.sanitizeAdmin(admin);
    } catch (error) {
      logger.error('Get admin by ID failed:', error);
      throw error;
    }
  }

  async getAdminList(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.role_id) {
        where.role_id = filters.role_id;
      }

      if (filters.keyword) {
        where[Op.or] = [
          { username: { [Op.like]: `%${filters.keyword}%` } },
          { real_name: { [Op.like]: `%${filters.keyword}%` } },
          { phone: { [Op.like]: `%${filters.keyword}%` } },
          { email: { [Op.like]: `%${filters.keyword}%` } }
        ];
      }

      const { count, rows } = await Admin.findAndCountAll({
        where,
        offset,
        limit,
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'name', 'description']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        limit,
        data: rows.map(admin => this.sanitizeAdmin(admin))
      };
    } catch (error) {
      logger.error('Get admin list failed:', error);
      throw error;
    }
  }

  async createAdmin(adminData) {
    try {
      const existingAdmin = await Admin.findOne({
        where: {
          [Op.or]: [
            { username: adminData.username },
            { phone: adminData.phone },
            { email: adminData.email }
          ]
        }
      });

      if (existingAdmin) {
        throw new Error('Admin already exists');
      }

      const hashedPassword = await bcrypt.hash(adminData.password, 12);

      const admin = await Admin.create({
        username: adminData.username,
        password: hashedPassword,
        real_name: adminData.real_name,
        phone: adminData.phone,
        email: adminData.email,
        avatar: adminData.avatar,
        role_id: adminData.role_id,
        status: 1
      });

      return await this.getAdminById(admin.id);
    } catch (error) {
      logger.error('Create admin failed:', error);
      throw error;
    }
  }

  async updateAdmin(adminId, updateData) {
    try {
      const admin = await Admin.findByPk(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      const allowedFields = [
        'real_name',
        'phone',
        'email',
        'avatar',
        'role_id',
        'status'
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      if (updateData.password) {
        updates.password = await bcrypt.hash(updateData.password, 12);
      }

      await admin.update(updates);

      return await this.getAdminById(admin.id);
    } catch (error) {
      logger.error('Update admin failed:', error);
      throw error;
    }
  }

  async deleteAdmin(adminId) {
    try {
      const admin = await Admin.findByPk(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      if (admin.username === 'admin') {
        throw new Error('Cannot delete super admin');
      }

      await admin.destroy();
      return { message: 'Admin deleted successfully' };
    } catch (error) {
      logger.error('Delete admin failed:', error);
      throw error;
    }
  }

  async updateAdminStatus(adminId, status) {
    try {
      const admin = await Admin.findByPk(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      admin.status = status;
      await admin.save();

      return await this.getAdminById(admin.id);
    } catch (error) {
      logger.error('Update admin status failed:', error);
      throw error;
    }
  }

  async getRoleList() {
    try {
      const roles = await Role.findAll({
        order: [['created_at', 'DESC']]
      });

      return roles;
    } catch (error) {
      logger.error('Get role list failed:', error);
      throw error;
    }
  }

  async getRoleById(roleId) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        throw new Error('Role not found');
      }

      return role;
    } catch (error) {
      logger.error('Get role by ID failed:', error);
      throw error;
    }
  }

  async createRole(roleData) {
    try {
      const role = await Role.create({
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions || [],
        status: 1
      });

      return await this.getRoleById(role.id);
    } catch (error) {
      logger.error('Create role failed:', error);
      throw error;
    }
  }

  async updateRole(roleId, updateData) {
    try {
      const role = await Role.findByPk(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      const allowedFields = ['name', 'description', 'permissions', 'status'];

      const updates = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      await role.update(updates);

      return await this.getRoleById(role.id);
    } catch (error) {
      logger.error('Update role failed:', error);
      throw error;
    }
  }

  async deleteRole(roleId) {
    try {
      const role = await Role.findByPk(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      const adminCount = await Admin.count({
        where: { role_id: roleId }
      });

      if (adminCount > 0) {
        throw new Error('Cannot delete role with existing admins');
      }

      await role.destroy();
      return { message: 'Role deleted successfully' };
    } catch (error) {
      logger.error('Delete role failed:', error);
      throw error;
    }
  }

  async getPermissionList() {
    try {
      const permissions = await Permission.findAll({
        order: [['module', 'ASC'], ['created_at', 'ASC']]
      });

      return permissions;
    } catch (error) {
      logger.error('Get permission list failed:', error);
      throw error;
    }
  }

  async getPermissionById(permissionId) {
    try {
      const permission = await Permission.findByPk(permissionId);
      if (!permission) {
        throw new Error('Permission not found');
      }

      return permission;
    } catch (error) {
      logger.error('Get permission by ID failed:', error);
      throw error;
    }
  }

  async createPermission(permissionData) {
    try {
      const permission = await Permission.create({
        name: permissionData.name,
        code: permissionData.code,
        description: permissionData.description,
        module: permissionData.module,
        status: 1
      });

      return await this.getPermissionById(permission.id);
    } catch (error) {
      logger.error('Create permission failed:', error);
      throw error;
    }
  }

  async updatePermission(permissionId, updateData) {
    try {
      const permission = await Permission.findByPk(permissionId);
      if (!permission) {
        throw new Error('Permission not found');
      }

      const allowedFields = ['name', 'code', 'description', 'module', 'status'];

      const updates = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      await permission.update(updates);

      return await this.getPermissionById(permission.id);
    } catch (error) {
      logger.error('Update permission failed:', error);
      throw error;
    }
  }

  async deletePermission(permissionId) {
    try {
      const permission = await Permission.findByPk(permissionId);
      if (!permission) {
        throw new Error('Permission not found');
      }

      await permission.destroy();
      return { message: 'Permission deleted successfully' };
    } catch (error) {
      logger.error('Delete permission failed:', error);
      throw error;
    }
  }

  async changeAdminPassword(adminId, newPassword) {
    try {
      const admin = await Admin.findByPk(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      admin.password = hashedPassword;
      await admin.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change admin password failed:', error);
      throw error;
    }
  }

  sanitizeAdmin(admin) {
    const { dataValues } = admin;
    delete dataValues.password;
    return dataValues;
  }

  getClientIP() {
    return '127.0.0.1';
  }
}

module.exports = new AdminService();
