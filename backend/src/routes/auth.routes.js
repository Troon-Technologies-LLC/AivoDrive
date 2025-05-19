/**
 * Authentication Routes
 * Handles user authentication and profile management routes
 */

const express = require('express');
const router = express.Router();
const { login, getProfile, updateProfile } = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
