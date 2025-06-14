const express = require('express');
const { validate, userValidation } = require('../middlewares/validation');
const { authenticateJWT } = require('../middlewares/auth');
const {
  login,
  changePassword,
  getProfile,
  logout
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/login', validate(userValidation.login), login);

// Protected routes
router.use(authenticateJWT);
router.post('/change-password', validate(userValidation.changePassword), changePassword);
router.get('/profile', getProfile);
router.post('/logout', logout);

module.exports = router;