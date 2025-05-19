/**
 * Report Routes
 * Handles report generation routes
 */

const express = require('express');
const router = express.Router();
const { 
  getDailySummary, 
  getMaintenanceDue,
  getFleetPerformance 
} = require('../controllers/report.controller');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

// All report routes are protected and restricted to admin only
router.use(auth);
router.use(checkRole([ROLES.ADMIN]));

// Report routes
router.get('/daily-summary', getDailySummary);
router.get('/maintenance-due', getMaintenanceDue);
router.get('/fleet-performance', getFleetPerformance);

module.exports = router;
