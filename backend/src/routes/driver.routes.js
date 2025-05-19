/**
 * Driver Routes
 * Handles driver management routes
 */

const express = require('express');
const router = express.Router();
const { 
  getDrivers, 
  getDriverById, 
  createDriver, 
  updateDriver, 
  deleteDriver,
  getDriverStats 
} = require('../controllers/driver.controller');
const { protect, authorize, ROLES } = require('../middleware/auth.middleware');

// All driver routes are protected and restricted to admin only
router.use(protect);
router.use(authorize(ROLES.ADMIN));

// Driver routes
router.route('/')
  .get(getDrivers)
  .post(createDriver);

router.route('/stats')
  .get(getDriverStats);

router.route('/:id')
  .get(getDriverById)
  .put(updateDriver)
  .delete(deleteDriver);

module.exports = router;
