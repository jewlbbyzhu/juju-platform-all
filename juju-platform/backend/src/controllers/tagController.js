const { Tag, UserTag, Party } = require('../models');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * 标签控制器
 */
class TagController {
  /**
   * 获取标签列表
   */
  async getTagList(req, res) {
    try {
      const { page = 1, pageSize = 20, keyword } = req.query;
      const where = { status: 1 };
      
      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      const { count, rows: tags } = await Tag.findAndCountAll({
        where,
        order: [['sort_order', 'ASC'], ['usage_count', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: tags,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: count > page * pageSize
      });
    } catch (err) {
      logger.error('获取标签列表失败:', err);
      return error(res, '获取标签列表失败', 500);
    }
  }

  /**
   * 获取热门标签
   */
  async getHotTags(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const tags = await Tag.findAll({
        where: {
          status: 1,
          is_hot: 1
        },
        order: [['usage_count', 'DESC']],
        limit: parseInt(limit)
      });

      return success(res, tags);
    } catch (err) {
      logger.error('获取热门标签失败:', err);
      return error(res, '获取热门标签失败', 500);
    }
  }

  /**
   * 获取标签详情
   */
  async getTagDetail(req, res) {
    try {
      const { id } = req.params;
      
      const tag = await Tag.findByPk(id);
      if (!tag) {
        return error(res, '标签不存在', 404);
      }

      return success(res, tag);
    } catch (err) {
      logger.error('获取标签详情失败:', err);
      return error(res, '获取标签详情失败', 500);
    }
  }

  /**
   * 创建标签
   */
  async createTag(req, res) {
    try {
      const { name, icon, description } = req.body;
      
      // 检查标签名是否已存在
      const existingTag = await Tag.findOne({ where: { name } });
      if (existingTag) {
        return error(res, '标签名称已存在', 400);
      }

      const tag = await Tag.create({
        name,
        icon,
        description,
        usage_count: 0,
        status: 1
      });

      return success(res, tag, 201);
    } catch (err) {
      logger.error('创建标签失败:', err);
      return error(res, '创建标签失败', 500);
    }
  }

  /**
   * 更新标签
   */
  async updateTag(req, res) {
    try {
      const { id } = req.params;
      const { name, icon, description, is_hot, is_recommended, sort_order, status } = req.body;
      
      const tag = await Tag.findByPk(id);
      if (!tag) {
        return error(res, '标签不存在', 404);
      }

      // 如果修改名称，检查是否与其他标签重复
      if (name && name !== tag.name) {
        const existingTag = await Tag.findOne({ where: { name } });
        if (existingTag) {
          return error(res, '标签名称已存在', 400);
        }
      }

      await tag.update({
        name: name || tag.name,
        icon: icon !== undefined ? icon : tag.icon,
        description: description !== undefined ? description : tag.description,
        is_hot: is_hot !== undefined ? is_hot : tag.is_hot,
        is_recommended: is_recommended !== undefined ? is_recommended : tag.is_recommended,
        sort_order: sort_order !== undefined ? sort_order : tag.sort_order,
        status: status !== undefined ? status : tag.status
      });

      return success(res, tag);
    } catch (err) {
      logger.error('更新标签失败:', err);
      return error(res, '更新标签失败', 500);
    }
  }

  /**
   * 删除标签
   */
  async deleteTag(req, res) {
    try {
      const { id } = req.params;
      
      const tag = await Tag.findByPk(id);
      if (!tag) {
        return error(res, '标签不存在', 404);
      }

      await tag.destroy();

      return success(res, { message: '删除成功' });
    } catch (err) {
      logger.error('删除标签失败:', err);
      return error(res, '删除标签失败', 500);
    }
  }

  /**
   * 关注标签
   */
  async followTag(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const tag = await Tag.findByPk(id);
      if (!tag) {
        return error(res, '标签不存在', 404);
      }

      // 检查是否已关注
      const existingFollow = await UserTag.findOne({
        where: { user_id: userId, tag_id: id }
      });

      if (existingFollow) {
        return error(res, '已关注该标签', 400);
      }

      await UserTag.create({
        user_id: userId,
        tag_id: id
      });

      // 增加标签使用计数
      await tag.increment('usage_count');

      return success(res, { message: '关注成功' });
    } catch (err) {
      logger.error('关注标签失败:', err);
      return error(res, '关注标签失败', 500);
    }
  }

  /**
   * 取消关注标签
   */
  async unfollowTag(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const tag = await Tag.findByPk(id);
      if (!tag) {
        return error(res, '标签不存在', 404);
      }

      const userTag = await UserTag.findOne({
        where: { user_id: userId, tag_id: id }
      });

      if (!userTag) {
        return error(res, '未关注该标签', 400);
      }

      await userTag.destroy();

      // 减少标签使用计数
      await tag.decrement('usage_count');

      return success(res, { message: '取消关注成功' });
    } catch (err) {
      logger.error('取消关注标签失败:', err);
      return error(res, '取消关注标签失败', 500);
    }
  }

  /**
   * 获取标签下的活动
   */
  async getTagParties(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      
      const tag = await Tag.findByPk(id);
      if (!tag) {
        return error(res, '标签不存在', 404);
      }

      const { count, rows: parties } = await Party.findAndCountAll({
        include: [{
          model: Tag,
          as: 'tagList',
          where: { id },
          through: { attributes: [] }
        }],
        where: { status: 'active' },
        order: [['created_at', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: parties,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: count > page * pageSize
      });
    } catch (err) {
      logger.error('获取标签活动失败:', err);
      return error(res, '获取标签活动失败', 500);
    }
  }

  /**
   * 搜索标签
   */
  async searchTags(req, res) {
    try {
      const { keyword, page = 1, pageSize = 20 } = req.query;
      
      if (!keyword) {
        return error(res, '请输入搜索关键词', 400);
      }

      const { count, rows: tags } = await Tag.findAndCountAll({
        where: {
          status: 1,
          [Op.or]: [
            { name: { [Op.like]: `%${keyword}%` } },
            { description: { [Op.like]: `%${keyword}%` } }
          ]
        },
        order: [['usage_count', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: tags,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: count > page * pageSize
      });
    } catch (err) {
      logger.error('搜索标签失败:', err);
      return error(res, '搜索标签失败', 500);
    }
  }

  /**
   * 获取推荐标签
   */
  async getRecommendedTags(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const tags = await Tag.findAll({
        where: {
          status: 1,
          is_recommended: 1
        },
        order: [['sort_order', 'ASC'], ['usage_count', 'DESC']],
        limit: parseInt(limit)
      });

      return success(res, tags);
    } catch (err) {
      logger.error('获取推荐标签失败:', err);
      return error(res, '获取推荐标签失败', 500);
    }
  }
}

module.exports = new TagController();
