/**
 * Alert Controller
 * Handles CRUD operations for system alerts and notifications
 */

const { Alert, ALERT_TYPE, ALERT_PRIORITY } = require('../models/alert.model');
const { ROLES } = require('../constants/roles');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

/**
 * Get all alerts with pagination
 * @route GET /api/alerts
 * @access Private (Admin only)
 */
const getAlerts = async (req, res) => {
  try {
    // Only Admin can access alerts
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to access alerts', 403)
      );
    }
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type || '';
    const priority = req.query.priority || '';
    const isRead = req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined;
    
    // Build query
    const query = {};
    
    // Add type filter if provided
    if (type && Object.values(ALERT_TYPE).includes(type)) {
      query.type = type;
    }
    
    // Add priority filter if provided
    if (priority && Object.values(ALERT_PRIORITY).includes(priority)) {
      query.priority = priority;
    }
    
    // Add isRead filter if provided
    if (isRead !== undefined) {
      query.isRead = isRead;
    }
    
    // Execute query with pagination
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Alert.countDocuments(query);
    
    res.status(200).json(
      paginatedResponse(alerts, page, limit, total, 'Alerts retrieved successfully')
    );
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get alert by ID
 * @route GET /api/alerts/:id
 * @access Private (Admin only)
 */
const getAlertById = async (req, res) => {
  try {
    // Only Admin can access alerts
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to access alerts', 403)
      );
    }
    
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json(
        errorResponse('Alert not found', 404)
      );
    }
    
    res.status(200).json(
      successResponse('Alert retrieved successfully', { alert }, 200)
    );
  } catch (error) {
    console.error('Get alert by ID error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Create new alert
 * @route POST /api/alerts
 * @access Private (Admin only)
 */
const createAlert = async (req, res) => {
  try {
    // Only Admin can create alerts
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to create alerts', 403)
      );
    }
    
    const { 
      type, 
      title, 
      message, 
      priority, 
      relatedTo,
      expiresAt
    } = req.body;
    
    // Validate required fields
    if (!type || !title || !message || !relatedTo) {
      return res.status(400).json(
        errorResponse('Please provide all required fields', 400)
      );
    }
    
    // Create alert
    const alert = await Alert.create({
      type,
      title,
      message,
      priority: priority || ALERT_PRIORITY.MEDIUM,
      relatedTo,
      expiresAt: expiresAt || null
    });
    
    res.status(201).json(
      successResponse('Alert created successfully', { alert }, 201)
    );
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Update alert by ID
 * @route PUT /api/alerts/:id
 * @access Private (Admin only)
 */
const updateAlert = async (req, res) => {
  try {
    // Only Admin can update alerts
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to update alerts', 403)
      );
    }
    
    const { 
      type, 
      title, 
      message, 
      priority, 
      isRead,
      relatedTo,
      expiresAt
    } = req.body;
    
    // Check if alert exists
    let alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json(
        errorResponse('Alert not found', 404)
      );
    }
    
    // Update alert
    alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        type,
        title,
        message,
        priority,
        isRead,
        relatedTo,
        expiresAt
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json(
      successResponse('Alert updated successfully', { alert }, 200)
    );
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Mark alert as read
 * @route PUT /api/alerts/:id/read
 * @access Private (Admin only)
 */
const markAlertAsRead = async (req, res) => {
  try {
    // Only Admin can update alerts
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to update alerts', 403)
      );
    }
    
    // Check if alert exists
    let alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json(
        errorResponse('Alert not found', 404)
      );
    }
    
    // Mark alert as read
    alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    res.status(200).json(
      successResponse('Alert marked as read', { alert }, 200)
    );
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Delete alert by ID
 * @route DELETE /api/alerts/:id
 * @access Private (Admin only)
 */
const deleteAlert = async (req, res) => {
  try {
    // Only Admin can delete alerts
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to delete alerts', 403)
      );
    }
    
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json(
        errorResponse('Alert not found', 404)
      );
    }
    
    await Alert.findByIdAndDelete(req.params.id);
    
    res.status(200).json(
      successResponse('Alert deleted successfully', null, 200)
    );
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get unread alerts count
 * @route GET /api/alerts/unread/count
 * @access Private (Admin only)
 */
const getUnreadAlertsCount = async (req, res) => {
  try {
    // Only Admin can access alerts
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json(
        errorResponse('Not authorized to access alerts', 403)
      );
    }
    
    // Count unread alerts
    const unreadCount = await Alert.countDocuments({ isRead: false });
    
    // Count by priority
    const criticalCount = await Alert.countDocuments({ 
      isRead: false,
      priority: ALERT_PRIORITY.CRITICAL
    });
    
    const highCount = await Alert.countDocuments({ 
      isRead: false,
      priority: ALERT_PRIORITY.HIGH
    });
    
    res.status(200).json(
      successResponse('Unread alerts count retrieved successfully', { 
        total: unreadCount,
        critical: criticalCount,
        high: highCount
      }, 200)
    );
  } catch (error) {
    console.error('Get unread alerts count error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  markAlertAsRead,
  deleteAlert,
  getUnreadAlertsCount
};
