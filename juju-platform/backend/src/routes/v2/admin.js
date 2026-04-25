const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const { auth, adminAuth } = require('../../middleware/auth');
const { validateLogin, validateCreateAdmin, validateUpdateAdmin, validateUpdateAdminStatus, validateCreateRole, validateUpdateRole, validateCreatePermission, validateUpdatePermission } = require('../../validators/adminValidator');

router.post('/login', validateLogin, adminController.login);
router.get('/', auth, adminAuth, adminController.getAdminList);
router.get('/roles', auth, adminAuth, adminController.getRoleList);
router.get('/permissions', auth, adminAuth, adminController.getPermissionList);
router.get('/:id', auth, adminAuth, adminController.getAdmin);
router.post('/', auth, adminAuth, validateCreateAdmin, adminController.createAdmin);
router.put('/:id', auth, adminAuth, validateUpdateAdmin, adminController.updateAdmin);
router.put('/:id/status', auth, adminAuth, validateUpdateAdminStatus, adminController.updateAdminStatus);
router.put('/:id/password', auth, adminAuth, adminController.changeAdminPassword);
router.delete('/:id', auth, adminAuth, adminController.deleteAdmin);
router.post('/roles', auth, adminAuth, validateCreateRole, adminController.createRole);
router.get('/roles/:id', auth, adminAuth, adminController.getRole);
router.put('/roles/:id', auth, adminAuth, validateUpdateRole, adminController.updateRole);
router.delete('/roles/:id', auth, adminAuth, adminController.deleteRole);
router.post('/permissions', auth, adminAuth, validateCreatePermission, adminController.createPermission);
router.get('/permissions/:id', auth, adminAuth, adminController.getPermission);
router.put('/permissions/:id', auth, adminAuth, validateUpdatePermission, adminController.updatePermission);
router.delete('/permissions/:id', auth, adminAuth, adminController.deletePermission);

module.exports = router;
