const express = require('express');
const router = express.Router();
const { auth: authenticate } = require('../../middleware/auth');

// 前端兼容性路由 - 社交相关
// 这些路由对应前端 social.ts 和 profile.ts 的调用

router.get('/feed', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    next(error);
  }
});

router.get('/posts', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        posts: [],
        total: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/posts', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Post created',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
});

router.post('/posts/:id/like', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Post liked'
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/posts/:id/like', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Post unliked'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/posts/:id/comments', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Comment added',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
});

router.get('/posts/:id/comments', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        comments: [],
        total: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/posts/:id/share', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Post shared'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users/:id/posts', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        posts: [],
        total: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/followers', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        followers: [],
        total: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
