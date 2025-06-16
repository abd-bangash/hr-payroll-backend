const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authenticate JWT token
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    let token = req.cookies.jwt;

    // Check for token in cookies or Authorization header
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // If token still not found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not active.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

// Authorize specific roles
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

// Authorize specific permissions
const authorizePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const hasPermission = permissions.some((permission) =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Required permissions not found.",
      });
    }

    next();
  };
};

// Check if user is SuperAdmin
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "SuperAdmin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. SuperAdmin privileges required.",
    });
  }
  next();
};

module.exports = {
  authenticateJWT,
  authorizeRole,
  authorizePermission,
  requireSuperAdmin,
};
