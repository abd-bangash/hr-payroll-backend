const express = require('express');
const { validate, userValidation } = require('../middlewares/validation');
const { authenticateJWT, requireSuperAdmin, authorizePermission } = require('../middlewares/auth');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// SuperAdmin only routes
router.post('/', requireSuperAdmin, validate(userValidation.register), createUser);
router.put('/:id/reset-password', requireSuperAdmin, validate(userValidation.resetPassword), resetUserPassword);
router.delete('/:id', requireSuperAdmin, deleteUser);

// Routes with permission checks
router.get('/', authorizePermission('read_user'), getUsers);
router.get('/:id', authorizePermission('read_user'), getUserById);
router.put('/:id', authorizePermission('update_user'), updateUser);

module.exports = router;