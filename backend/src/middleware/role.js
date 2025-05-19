/**
 * Role Middleware
 * Checks if user has the required role(s) for accessing a resource
 */

/**
 * Middleware to check user role
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
exports.checkRole = (roles) => {
  return (req, res, next) => {
    // Make sure user exists in request (set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    // User has required role, proceed
    next();
  };
};
