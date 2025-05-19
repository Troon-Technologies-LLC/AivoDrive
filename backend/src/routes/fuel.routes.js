/**
 * Fuel Routes
 * API routes for fuel management
 */

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const fuelController = require('../controllers/fuel.controller');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

/**
 * @route   GET /api/fuel
 * @desc    Get all fuel records with pagination and filtering
 * @access  Private
 */
router.get('/', auth, fuelController.getFuelRecords);

/**
 * @route   GET /api/fuel/stats
 * @desc    Get fuel statistics
 * @access  Private (Admin, Dispatcher)
 */
router.get('/stats', [auth, checkRole([ROLES.ADMIN, ROLES.DISPATCHER])], fuelController.getFuelStats);

/**
 * @route   GET /api/fuel/efficiency-report
 * @desc    Get fuel efficiency report
 * @access  Private (Admin, Dispatcher)
 */
router.get('/efficiency-report', [auth, checkRole([ROLES.ADMIN, ROLES.DISPATCHER])], fuelController.getFuelEfficiencyReport);

/**
 * @route   GET /api/fuel/:id
 * @desc    Get fuel record by ID
 * @access  Private
 */
router.get('/:id', auth, fuelController.getFuelById);

/**
 * @route   POST /api/fuel
 * @desc    Create a new fuel record
 * @access  Private (Admin, Dispatcher)
 */
router.post('/', [
  auth,
  checkRole([ROLES.ADMIN, ROLES.DISPATCHER]),
  [
    check('vehicleId', 'Vehicle is required').not().isEmpty(),
    check('date', 'Date is required').isISO8601().toDate(),
    check('fuelAmount', 'Fuel amount is required and must be a positive number').isFloat({ min: 0.1 }),
    check('fuelPrice', 'Fuel price is required and must be a positive number').isFloat({ min: 0.1 }),
    check('totalCost', 'Total cost is required and must be a positive number').isFloat({ min: 0.1 }),
    check('odometer', 'Odometer reading must be a positive number').optional().isFloat({ min: 0 }),
    check('previousOdometer', 'Previous odometer reading must be a positive number').optional().isFloat({ min: 0 })
  ]
], fuelController.createFuel);

/**
 * @route   PUT /api/fuel/:id
 * @desc    Update a fuel record
 * @access  Private (Admin, Dispatcher)
 */
router.put('/:id', [
  auth,
  checkRole([ROLES.ADMIN, ROLES.DISPATCHER]),
  [
    check('date', 'Date must be valid').optional().isISO8601().toDate(),
    check('fuelAmount', 'Fuel amount must be a positive number').optional().isFloat({ min: 0.1 }),
    check('fuelPrice', 'Fuel price must be a positive number').optional().isFloat({ min: 0.1 }),
    check('totalCost', 'Total cost must be a positive number').optional().isFloat({ min: 0.1 }),
    check('odometer', 'Odometer reading must be a positive number').optional().isFloat({ min: 0 }),
    check('previousOdometer', 'Previous odometer reading must be a positive number').optional().isFloat({ min: 0 })
  ]
], fuelController.updateFuel);

/**
 * @route   DELETE /api/fuel/:id
 * @desc    Delete a fuel record
 * @access  Private (Admin)
 */
router.delete('/:id', [auth, checkRole([ROLES.ADMIN])], fuelController.deleteFuel);

module.exports = router;
