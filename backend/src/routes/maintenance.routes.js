/**
 * Maintenance Routes
 * Handles vehicle maintenance scheduling and tracking routes
 */

const express = require('express');
const router = express.Router();
const { 
  getMaintenanceRecords, 
  getMaintenanceById, 
  createMaintenance, 
  updateMaintenance, 
  deleteMaintenance,
  getMaintenanceStats 
} = require('../controllers/maintenance.controller');
const { protect, authorize, ROLES } = require('../middleware/auth.middleware');

// All maintenance routes are protected and restricted to admin only
router.use(protect);
router.use(authorize(ROLES.ADMIN));

// Maintenance routes
router.route('/')
  .get(getMaintenanceRecords)
  .post(createMaintenance);

router.route('/stats')
  .get(getMaintenanceStats);

router.route('/:id')
  .get(getMaintenanceById)
  .put(updateMaintenance)
  .delete(deleteMaintenance);

module.exports = router;
