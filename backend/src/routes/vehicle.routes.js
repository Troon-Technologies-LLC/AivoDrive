/**
 * Vehicle Routes
 * Handles vehicle management routes
 */

const express = require('express');
const router = express.Router();
const { 
  getVehicles, 
  getVehicleById, 
  createVehicle, 
  updateVehicle, 
  deleteVehicle,
  getVehicleStats 
} = require('../controllers/vehicle.controller');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

// All vehicle routes are protected
router.use(auth);

// Only admin can create, update, and delete vehicles
const adminRoutes = ['/stats', '/:id/update', '/:id/delete'];
router.use(adminRoutes, checkRole([ROLES.ADMIN]));

// Vehicle routes - GET is accessible to all authenticated users
router.route('/')
  .get(getVehicles)
  .post(checkRole([ROLES.ADMIN]), createVehicle);

router.route('/stats')
  .get(checkRole([ROLES.ADMIN]), getVehicleStats);

// Vehicle details - GET is accessible to all authenticated users
router.route('/:id')
  .get(getVehicleById)
  .put(checkRole([ROLES.ADMIN]), updateVehicle)
  .delete(checkRole([ROLES.ADMIN]), deleteVehicle);

module.exports = router;
