/**
 * Trip Routes
 * Handles trip management routes with role-based access control
 */

const express = require('express');
const router = express.Router();
const { 
  getTrips, 
  getTripById, 
  createTrip, 
  updateTrip, 
  deleteTrip,
  getTripStats 
} = require('../controllers/trip.controller');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

// All trip routes are protected
router.use(auth);

// Stats route must come before /:id routes to avoid being treated as an ID parameter
router.route('/stats')
  .get(checkRole([ROLES.ADMIN, ROLES.DISPATCHER]), getTripStats);

// Routes accessible by all authenticated users (with role-based filtering in controller)
router.route('/')
  .get(getTrips)
  .post(checkRole([ROLES.ADMIN, ROLES.DISPATCHER]), createTrip);

// Routes with ID parameter
router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(checkRole([ROLES.ADMIN]), deleteTrip);

module.exports = router;
