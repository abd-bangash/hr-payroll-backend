const AuditLog = require('../models/AuditLog');

// Log audit entry
const logAudit = async (userId, action, resource, resourceId, details, ipAddress, userAgent) => {
  try {
    const auditLog = new AuditLog({
      user: userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw error to prevent disrupting main operations
  }
};

// Get audit logs with filtering
const getAuditLogs = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 50 } = pagination;
    const { user, action, resource, startDate, endDate } = filters;

    const query = {};
    
    if (user) query.user = user;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const auditLogs = await AuditLog.find(query)
      .populate('user', 'username email role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ timestamp: -1 });

    const total = await AuditLog.countDocuments(query);

    return {
      auditLogs,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    };
  } catch (error) {
    console.error('Get audit logs error:', error);
    throw error;
  }
};

// Get audit statistics
const getAuditStats = async (timeframe = 'month') => {
  try {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const stats = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalActions = await AuditLog.countDocuments({
      timestamp: { $gte: startDate }
    });

    const uniqueUsers = await AuditLog.distinct('user', {
      timestamp: { $gte: startDate }
    });

    return {
      totalActions,
      uniqueUsers: uniqueUsers.length,
      actionBreakdown: stats,
      timeframe,
      startDate,
      endDate: now
    };
  } catch (error) {
    console.error('Get audit stats error:', error);
    throw error;
  }
};

// Clean old audit logs (for maintenance)
const cleanOldAuditLogs = async (daysToKeep = 365) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return {
      deletedCount: result.deletedCount,
      cutoffDate
    };
  } catch (error) {
    console.error('Clean audit logs error:', error);
    throw error;
  }
};

module.exports = {
  logAudit,
  getAuditLogs,
  getAuditStats,
  cleanOldAuditLogs
};