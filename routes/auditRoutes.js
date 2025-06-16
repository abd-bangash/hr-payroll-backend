const express = require('express');
const { authenticateJWT, authorizePermission } = require('../middlewares/auth');
const { getAuditLogs, getAuditStats } = require('../services/auditService');

const router = express.Router();

// All routes require authentication and audit read permission
router.use(authenticateJWT);
router.use(authorizePermission('read_audit'));

// Get audit logs
router.get('/', async (req, res) => {
  try {
    const { page, limit, user, action, resource, startDate, endDate } = req.query;
    
    const filters = { user, action, resource, startDate, endDate };
    const pagination = { page: parseInt(page), limit: parseInt(limit) };
    
    const result = await getAuditLogs(filters, pagination);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit logs'
    });
  }
});

// Get audit statistics
router.get('/stats', async (req, res) => {
  try {
    const { timeframe } = req.query;
    
    const stats = await getAuditStats(timeframe);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit statistics'
    });
  }
});

module.exports = router;