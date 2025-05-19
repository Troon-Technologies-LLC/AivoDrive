/**
 * Authentication Controller
 * Handles user authentication and profile management
 */

const { User, ROLES } = require('../models/user.model');
const { generateToken } = require('../utils/jwt.utils');
const { successResponse, errorResponse } = require('../utils/response.utils');

/**
 * Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json(
        errorResponse('Please provide email and password', 400)
      );
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json(
        errorResponse('Invalid credentials', 401)
      );
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(
        errorResponse('Invalid credentials', 401)
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json(
        errorResponse('Your account is inactive. Please contact an administrator.', 401)
      );
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Create token
    const token = generateToken(user);

    // Return user data (excluding password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      lastLogin: user.lastLogin
    };

    res.status(200).json(
      successResponse('Login successful', { user: userData, token }, 200)
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getProfile = async (req, res) => {
  try {
    console.log('User in request:', req.user);
    const userId = req.user.id;
    console.log('Looking up user with ID:', userId);
    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(
        errorResponse('User not found', 404)
      );
    }

    res.status(200).json(
      successResponse('User profile retrieved successfully', { user }, 200)
    );
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

/**
 * Update current user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const userId = req.user.id;
    console.log('Updating user with ID:', userId);
    
    // Find user and update
    const user = await User.findByIdAndUpdate(
      userId, 
      { name, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json(
        errorResponse('User not found', 404)
      );
    }

    res.status(200).json(
      successResponse('Profile updated successfully', { user }, 200)
    );
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(
      errorResponse('Server error', 500, error.message)
    );
  }
};

module.exports = {
  login,
  getProfile,
  updateProfile
};
