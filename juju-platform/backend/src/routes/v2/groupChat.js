const express = require('express');
const router = express.Router();
const groupChatController = require('../../controllers/groupChatController');
const { auth } = require('../../middleware/auth');

router.use(auth);

router.post('/groups', groupChatController.createGroup.bind(groupChatController));
router.post('/parties/:partyId/group', groupChatController.createPartyGroup.bind(groupChatController));
router.get('/groups', groupChatController.getGroups.bind(groupChatController));
router.get('/groups/:groupId', groupChatController.getGroup.bind(groupChatController));
router.get('/groups/:groupId/members', groupChatController.getGroupMembers.bind(groupChatController));
router.post('/groups/:groupId/join', groupChatController.joinGroup.bind(groupChatController));
router.post('/groups/:groupId/leave', groupChatController.leaveGroup.bind(groupChatController));
router.delete('/groups/:groupId/members/:userId', groupChatController.removeMember.bind(groupChatController));
router.get('/groups/:groupId/messages', groupChatController.getMessages.bind(groupChatController));
router.post('/groups/:groupId/messages', groupChatController.sendMessage.bind(groupChatController));
router.get('/groups/:groupId/unread-count', groupChatController.getUnreadCount.bind(groupChatController));
router.put('/groups/:groupId/read', groupChatController.markAsRead.bind(groupChatController));
router.put('/groups/:groupId', groupChatController.updateGroupInfo.bind(groupChatController));
router.delete('/groups/:groupId', groupChatController.disbandGroup.bind(groupChatController));

module.exports = router;
