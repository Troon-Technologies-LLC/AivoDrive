/**
 * Alert Routes
 * Handles system alerts and notifications routes
 */

const express = require('express');
const router = express.Router();
const { 
  getAlerts, 
  getAlertById, 
  createAlert, 
  updateAlert, 
  markAlertAsRead,
  deleteAlert,
  getUnreadAlertsCount 
} = require('../controllers/alert.controller');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/role');
const { ROLES } = require('../constants/roles');

// All alert routes are protected and restricted to admin only
router.use(auth);
router.use(checkRole([ROLES.ADMIN]));

// Alert routes
router.route('/')
  .get(getAlerts)
  .post(createAlert);

router.get('/unread/count', getUnreadAlertsCount);

router.route('/:id')
  .get(getAlertById)
  .put(updateAlert)
  .delete(deleteAlert);

router.put('/:id/read', markAlertAsRead);

module.exports = router;
