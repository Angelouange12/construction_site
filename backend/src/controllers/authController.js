const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  successResponse(res, result, 'Registration successful', 201);
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  successResponse(res, result, 'Login successful');
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  successResponse(res, profile, 'Profile retrieved successfully');
});

/**
 * Update current user profile
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await authService.updateProfile(req.user.id, req.body);
  successResponse(res, profile, 'Profile updated successfully');
});

/**
 * Change password
 * PUT /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
  successResponse(res, result, 'Password changed successfully');
});

/**
 * Upload profile photo
 * POST /api/auth/profile/photo
 */
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file uploaded', 400);
  }
  
  const photoUrl = `/uploads/profiles/${req.file.filename}`;
  const profile = await authService.updateProfile(req.user.id, { profilePhoto: photoUrl });
  successResponse(res, profile, 'Profile photo updated successfully');
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePhoto
};

