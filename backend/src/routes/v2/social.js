const express = require('express');
const router = express.Router();
const socialController = require('../../controllers/socialController');
const { auth } = require('../../middleware/auth');

// Posts
router.get('/posts', auth, socialController.getPosts);
router.post('/posts', auth, socialController.createPost);
router.put('/posts/:id', auth, socialController.updatePost);
router.delete('/posts/:id', auth, socialController.deletePost);
router.post('/posts/:id/like', auth, socialController.likePost);
router.post('/posts/:id/unlike', auth, socialController.unlikePost);
router.get('/posts/:id/comments', auth, socialController.getPostComments);
router.post('/posts/:id/comments', auth, socialController.addPostComment);
router.post('/posts/:id/share', auth, socialController.sharePost);
router.post('/report/post', auth, socialController.reportPost);

// Friends & Following
router.get('/friends', auth, socialController.getFriends);
router.get('/following', auth, socialController.getFollowing);
router.get('/followers', auth, socialController.getFollowers);
router.post('/follow/:id', auth, socialController.followUser);
router.post('/unfollow/:id', auth, socialController.unfollowUser);

// Parties
router.post('/parties/:id/like', auth, socialController.likeParty);
router.post('/parties/:id/unlike', auth, socialController.unlikeParty);
router.post('/parties/:id/share', auth, socialController.shareParty);

// Party Comments
router.get('/parties/:id/comments', auth, socialController.getPartyComments);
router.post('/parties/:id/comments', auth, socialController.addPartyComment);
router.delete('/comments/:id', auth, socialController.deleteComment);
router.post('/comments/:id/like', auth, socialController.likeComment);
router.post('/comments/:id/unlike', auth, socialController.unlikeComment);
router.get('/parties/:id/share-count', auth, socialController.getShareCount);

// Report
router.post('/report/user', auth, socialController.reportUser);
router.post('/report/comment', auth, socialController.reportComment);

// Block
router.get('/blocked', auth, socialController.getBlockedUsers);
router.post('/block/:id', auth, socialController.blockUser);
router.post('/unblock/:id', auth, socialController.unblockUser);

module.exports = router;
