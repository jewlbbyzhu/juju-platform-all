const { Post, Comment, Follow, Like, User, Party } = require('../models');

const socialController = {
  async getPosts(req, res) {
    try {
      const { page = 1, pageSize = 20, userId } = req.query;
      const offset = (page - 1) * pageSize;

      const where = { status: 1 };

      if (userId) {
        where.user_id = userId;
      }

      const { count, rows } = await Post.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar', 'is_vip']
          },
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'images', 'start_time']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(pageSize),
        offset
      });

      res.json({
        success: true,
        data: {
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          data: rows
        }
      });
    } catch (error) {
      console.error('获取动态列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '获取动态列表失败'
      });
    }
  },

  async createPost(req, res) {
    try {
      const { content, images, party_id, location, visibility } = req.body;
      const userId = req.user.id;

      const post = await Post.create({
        user_id: userId,
        content,
        images: images || [],
        party_id,
        location,
        visibility: visibility || 'public'
      });

      const postWithUser = await Post.findByPk(post.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar', 'is_vip']
          },
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'images', 'start_time']
          }
        ]
      });

      res.json({
        code: 0,
        data: postWithUser,
        message: '发布成功'
      });
    } catch (error) {
      console.error('发布动态失败:', error);
      res.status(500).json({
        code: -1,
        message: '发布动态失败'
      });
    }
  },

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { content, images, party_id, location, visibility } = req.body;
      const userId = req.user.id;

      const post = await Post.findOne({
        where: { id, user_id: userId, status: 1 }
      });

      if (!post) {
        return res.status(404).json({
          code: -1,
          message: '动态不存在或无权修改'
        });
      }

      await post.update({
        content,
        images,
        party_id,
        location,
        visibility
      });

      const updatedPost = await Post.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar', 'is_vip']
          },
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'images', 'start_time']
          }
        ]
      });

      res.json({
        code: 0,
        data: updatedPost,
        message: '更新成功'
      });
    } catch (error) {
      console.error('更新动态失败:', error);
      res.status(500).json({
        code: -1,
        message: '更新动态失败'
      });
    }
  },

  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const post = await Post.findOne({
        where: { id, user_id: userId, status: 1 }
      });

      if (!post) {
        return res.status(404).json({
          code: -1,
          message: '动态不存在或无权删除'
        });
      }

      await post.update({ status: 0 });

      res.json({
        code: 0,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除动态失败:', error);
      res.status(500).json({
        code: -1,
        message: '删除动态失败'
      });
    }
  },

  async likePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existingLike = await Like.findOne({
        where: { user_id: userId, post_id: id }
      });

      if (existingLike) {
        return res.json({
          code: 0,
          message: '已点赞'
        });
      }

      await Like.create({ user_id: userId, post_id: id });

      await Post.increment('like_count', { where: { id } });

      res.json({
        code: 0,
        message: '点赞成功'
      });
    } catch (error) {
      console.error('点赞失败:', error);
      res.status(500).json({
        code: -1,
        message: '点赞失败'
      });
    }
  },

  async unlikePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const like = await Like.findOne({
        where: { user_id: userId, post_id: id }
      });

      if (!like) {
        return res.json({
          code: 0,
          message: '未点赞'
        });
      }

      await like.destroy();

      await Post.decrement('like_count', { where: { id } });

      res.json({
        code: 0,
        message: '取消点赞成功'
      });
    } catch (error) {
      console.error('取消点赞失败:', error);
      res.status(500).json({
        code: -1,
        message: '取消点赞失败'
      });
    }
  },

  async getPostComments(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Comment.findAndCountAll({
        where: { post_id: id, status: 1 },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar', 'is_vip']
          }
        ],
        order: [['created_at', 'ASC']],
        limit: parseInt(pageSize),
        offset
      });

      res.json({
        code: 0,
        data: {
          list: rows,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取评论列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '获取评论列表失败'
      });
    }
  },

  async addPostComment(req, res) {
    try {
      const { id } = req.params;
      const { content, reply_to } = req.body;
      const userId = req.user.id;

      const comment = await Comment.create({
        user_id: userId,
        post_id: id,
        content,
        reply_to
      });

      await Post.increment('comment_count', { where: { id } });

      const commentWithUser = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar', 'is_vip']
          }
        ]
      });

      res.json({
        code: 0,
        data: commentWithUser,
        message: '评论成功'
      });
    } catch (error) {
      console.error('评论失败:', error);
      res.status(500).json({
        code: -1,
        message: '评论失败'
      });
    }
  },

  async sharePost(req, res) {
    try {
      const { id } = req.params;
      // const userId = req.user.id; // TODO: 记录分享用户

      await Post.increment('share_count', { where: { id } });

      res.json({
        code: 0,
        message: '分享成功'
      });
    } catch (error) {
      console.error('分享失败:', error);
      res.status(500).json({
        code: -1,
        message: '分享失败'
      });
    }
  },

  async follow(req, res) {
    try {
      // 支持两种参数名：userId 或 following_id
      const targetUserId = req.body.userId || req.body.following_id;
      const currentUserId = req.user.id;
      const { Follow, User } = require('../models');

      if (!targetUserId) {
        return res.status(400).json({
          code: -1,
          message: '请提供要关注的用户ID'
        });
      }

      if (currentUserId === parseInt(targetUserId)) {
        return res.status(400).json({
          code: -1,
          message: '不能关注自己'
        });
      }

      const existingFollow = await Follow.findOne({
        where: { follower_id: currentUserId, following_id: targetUserId, status: 1 }
      });

      if (existingFollow) {
        return res.json({
          code: 0,
          message: '已关注'
        });
      }

      await Follow.create({
        follower_id: currentUserId,
        following_id: targetUserId,
        status: 1
      });

      await User.increment('following_count', { where: { id: currentUserId } });
      await User.increment('followers_count', { where: { id: targetUserId } });

      res.json({
        code: 0,
        message: '关注成功'
      });
    } catch (error) {
      console.error('关注失败:', error);
      res.status(500).json({
        code: -1,
        message: '关注失败'
      });
    }
  },

  async followUser(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { Follow, User } = require('../models');

      if (userId === parseInt(id)) {
        return res.status(400).json({
          code: -1,
          message: '不能关注自己'
        });
      }

      const existingFollow = await Follow.findOne({
        where: { follower_id: userId, following_id: id, status: 1 }
      });

      if (existingFollow) {
        return res.json({
          code: 0,
          message: '已关注'
        });
      }

      await Follow.create({
        follower_id: userId,
        following_id: id,
        status: 1
      });

      await User.increment('following_count', { where: { id: userId } });
      await User.increment('followers_count', { where: { id } });

      res.json({
        code: 0,
        message: '关注成功'
      });
    } catch (error) {
      console.error('关注失败:', error);
      res.status(500).json({
        code: -1,
        message: '关注失败'
      });
    }
  },

  async unfollowUser(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const follow = await Follow.findOne({
        where: { follower_id: userId, following_id: id, status: 1 }
      });

      if (!follow) {
        return res.json({
          code: 0,
          message: '未关注'
        });
      }

      await follow.update({ status: 0 });

      await User.decrement('following_count', { where: { id: userId } });
      await User.decrement('followers_count', { where: { id } });

      res.json({
        code: 0,
        message: '取消关注成功'
      });
    } catch (error) {
      console.error('取消关注失败:', error);
      res.status(500).json({
        code: -1,
        message: '取消关注失败'
      });
    }
  },
  
  async getFriends(req, res) {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;
      const { count, rows } = await Follow.findAndCountAll({
        where: { follower_id: req.user.id, status: 1 },
        include: [
          {
            model: User,
            as: 'friend',
            attributes: ['id', 'nickname', 'avatar', 'is_vip', 'bio']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(pageSize),
        offset
      });
      res.json({
        code: 0,
        data: {
          list: rows,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取好友列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '获取好友列表失败'
      });
    }
  },

  async getFollowers(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Follow.findAndCountAll({
        where: { following_id: id, status: 1 },
        include: [
          {
            model: User,
            as: 'follower',
            attributes: ['id', 'nickname', 'avatar', 'is_vip', 'bio']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(pageSize),
        offset
      });

      res.json({
        code: 0,
        data: {
          list: rows,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取粉丝列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '获取粉丝列表失败'
      });
    }
  },

  async getFollowing(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Follow.findAndCountAll({
        where: { follower_id: id, status: 1 },
        include: [
          {
            model: User,
            as: 'following',
            attributes: ['id', 'nickname', 'avatar', 'is_vip', 'bio']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(pageSize),
        offset
      });

      res.json({
        code: 0,
        data: {
          list: rows,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取关注列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '获取关注列表失败'
      });
    }
  },

  async likeParty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existingLike = await Like.findOne({
        where: { user_id: userId, party_id: id }
      });

      if (existingLike) {
        return res.json({
          code: 0,
          message: '已点赞'
        });
      }

      await Like.create({ user_id: userId, party_id: id });

      await Party.increment('like_count', { where: { id } });

      res.json({
        code: 0,
        message: '点赞成功'
      });
    } catch (error) {
      console.error('点赞聚会失败:', error);
      res.status(500).json({
        code: -1,
        message: '点赞失败'
      });
    }
  },

  async unlikeParty(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const like = await Like.findOne({
        where: { user_id: userId, party_id: id }
      });

      if (!like) {
        return res.json({
          code: 0,
          message: '未点赞'
        });
      }

      await like.destroy();

      await Party.decrement('like_count', { where: { id } });

      res.json({
        code: 0,
        message: '取消点赞成功'
      });
    } catch (error) {
      console.error('取消点赞聚会失败:', error);
      res.status(500).json({
        code: -1,
        message: '取消点赞失败'
      });
    }
  },

  async shareParty(req, res) {
    try {
      const { id } = req.params;
      // const userId = req.user.id; // TODO: 记录分享用户

      await Party.increment('share_count', { where: { id } });

      res.json({
        code: 0,
        message: '分享成功'
      });
    } catch (error) {
      console.error('分享聚会失败:', error);
      res.status(500).json({
        code: -1,
        message: '分享失败'
      });
    }
  },

  async blockUser(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const existingBlock = await Follow.findOne({
        where: { follower_id: userId, following_id: id, status: 0 }
      });

      if (existingBlock) {
        return res.json({
          code: 0,
          message: '已拉黑'
        });
      }

      await Follow.create({
        follower_id: userId,
        following_id: id,
        status: 0
      });

      res.json({
        code: 0,
        message: '拉黑成功'
      });
    } catch (error) {
      console.error('拉黑失败:', error);
      res.status(500).json({
        code: -1,
        message: '拉黑失败'
      });
    }
  },

  async unblockUser(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const block = await Follow.findOne({
        where: { follower_id: userId, following_id: id, status: 0 }
      });

      if (!block) {
        return res.json({
          code: 0,
          message: '未拉黑'
        });
      }

      await block.destroy();

      res.json({
        code: 0,
        message: '取消拉黑成功'
      });
    } catch (error) {
      console.error('取消拉黑失败:', error);
      res.status(500).json({
        code: -1,
        message: '取消拉黑失败'
      });
    }
  },

  async getBlockedUsers(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;

      const { Follow, User } = require('../models');
      const { count, rows } = await Follow.findAndCountAll({
        where: { 
          follower_id: userId, 
          status: 0  // status 0 表示拉黑
        },
        include: [
          {
            model: User,
            as: 'following',
            attributes: ['id', 'nickname', 'avatar']
          }
        ],
        offset,
        limit: parseInt(pageSize),
        order: [['created_at', 'DESC']]
      });

      const list = rows.map(item => ({
        id: item.following.id,
        nickname: item.following.nickname,
        avatar: item.following.avatar,
        blockedAt: item.created_at
      }));

      res.json({
        code: 0,
        data: {
          list,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取拉黑列表失败:', error);
      res.status(500).json({
        code: -1,
        message: '获取拉黑列表失败'
      });
    }
  },

  async reportPost(req, res) {
    try {
      // const { reason, description } = req.body; // TODO: 实现举报功能
      // const { id } = req.params;
      // const userId = req.user.id;

      res.json({
        code: 0,
        message: '举报成功'
      });
    } catch (error) {
      console.error('举报失败:', error);
      res.status(500).json({
        code: -1,
        message: '举报失败'
      });
    }
  },

  // ===== 活动评论相关 API =====
  async getPartyComments(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;

      const { Comment, User } = require('../models');
      const { count, rows } = await Comment.findAndCountAll({
        where: { 
          party_id: id, 
          status: 1,
          parent_id: null  // 只获取顶级评论
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar', 'is_vip']
          },
          {
            model: Comment,
            as: 'replies',
            where: { status: 1 },
            required: false,
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'nickname', 'avatar']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(pageSize),
        offset
      });

      res.json({
        code: 0,
        data: {
          list: rows,
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('获取活动评论失败:', error);
      res.status(500).json({
        code: -1,
        message: '获取评论失败'
      });
    }
  },

  async addPartyComment(req, res) {
    try {
      const { id } = req.params;
      const { content, parent_id } = req.body;
      const userId = req.user.id;
      const { Comment, Party } = require('../models');

      // 检查活动是否存在
      const party = await Party.findByPk(id);
      if (!party) {
        return res.status(404).json({
          code: -1,
          message: '活动不存在'
        });
      }

      const comment = await Comment.create({
        user_id: userId,
        party_id: id,
        content,
        parent_id: parent_id || null
      });

      // 增加活动评论数
      await Party.increment('comment_count', { where: { id } });

      const commentWithUser = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar', 'is_vip']
          }
        ]
      });

      res.json({
        code: 0,
        data: commentWithUser,
        message: '评论成功'
      });
    } catch (error) {
      console.error('添加活动评论失败:', error);
      res.status(500).json({
        code: -1,
        message: '评论失败'
      });
    }
  },

  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { Comment, Party } = require('../models');

      const comment = await Comment.findOne({
        where: { id, user_id: userId }
      });

      if (!comment) {
        return res.status(404).json({
          code: -1,
          message: '评论不存在或无权限删除'
        });
      }

      // 软删除评论
      await comment.update({ status: 0 });

      // 减少活动评论数
      if (comment.party_id) {
        await Party.decrement('comment_count', { where: { id: comment.party_id } });
      }

      res.json({
        code: 0,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除评论失败:', error);
      res.status(500).json({
        code: -1,
        message: '删除失败'
      });
    }
  },

  async likeComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { Comment, Like } = require('../models');

      const comment = await Comment.findByPk(id);
      if (!comment) {
        return res.status(404).json({
          code: -1,
          message: '评论不存在'
        });
      }

      const existingLike = await Like.findOne({
        where: { user_id: userId, comment_id: id }
      });

      if (existingLike) {
        return res.json({
          code: 0,
          message: '已点赞'
        });
      }

      await Like.create({ user_id: userId, comment_id: id });
      await Comment.increment('like_count', { where: { id } });

      res.json({
        code: 0,
        message: '点赞成功'
      });
    } catch (error) {
      console.error('点赞评论失败:', error);
      res.status(500).json({
        code: -1,
        message: '点赞失败'
      });
    }
  },

  async unlikeComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { Comment, Like } = require('../models');

      const like = await Like.findOne({
        where: { user_id: userId, comment_id: id }
      });

      if (!like) {
        return res.json({
          code: 0,
          message: '未点赞'
        });
      }

      await like.destroy();
      await Comment.decrement('like_count', { where: { id } });

      res.json({
        code: 0,
        message: '取消点赞成功'
      });
    } catch (error) {
      console.error('取消点赞评论失败:', error);
      res.status(500).json({
        code: -1,
        message: '取消点赞失败'
      });
    }
  },

  async getShareCount(req, res) {
    try {
      const { id } = req.params;
      const { Party } = require('../models');

      const party = await Party.findByPk(id, {
        attributes: ['id', 'share_count']
      });

      if (!party) {
        return res.status(404).json({
          code: -1,
          message: '活动不存在'
        });
      }

      res.json({
        code: 0,
        data: {
          partyId: party.id,
          shareCount: party.share_count || 0
        }
      });
    } catch (error) {
      console.error('获取分享数失败:', error);
      res.status(500).json({
        code: -1,
        message: '获取分享数失败'
      });
    }
  },

  async reportUser(req, res) {
    try {
      const { userId, reason, description } = req.body;
      const reporterId = req.user.id;

      // 这里应该保存举报记录到数据库
      console.log('举报用户:', {
        reporterId,
        reportedUserId: userId,
        reason,
        description,
        createdAt: new Date()
      });

      res.json({
        code: 0,
        message: '举报成功，我们会尽快处理'
      });
    } catch (error) {
      console.error('举报用户失败:', error);
      res.status(500).json({
        code: -1,
        message: '举报失败'
      });
    }
  },

  async reportComment(req, res) {
    try {
      const { commentId, reason, description } = req.body;
      const reporterId = req.user.id;

      // 这里应该保存举报记录到数据库
      console.log('举报评论:', {
        reporterId,
        commentId,
        reason,
        description,
        createdAt: new Date()
      });

      res.json({
        code: 0,
        message: '举报成功，我们会尽快处理'
      });
    } catch (error) {
      console.error('举报评论失败:', error);
      res.status(500).json({
        code: -1,
        message: '举报失败'
      });
    }
  }
};

module.exports = socialController;
