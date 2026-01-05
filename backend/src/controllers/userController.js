const userService = require('../services/userService');
const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all users
 * GET /api/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  paginatedResponse(res, result.users, result.pagination, 'Users retrieved successfully');
});

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  successResponse(res, user, 'User retrieved successfully');
});

/**
 * Create a new user
 * POST /api/users
 */
const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  successResponse(res, user, 'User created successfully', 201);
});

/**
 * Update user
 * PUT /api/users/:id
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  successResponse(res, user, 'User updated successfully');
});

/**
 * Delete user
 * DELETE /api/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  successResponse(res, result, 'User deleted successfully');
});

/**
 * Get users by role
 * GET /api/users/role/:role
 */
const getUsersByRole = asyncHandler(async (req, res) => {
  const users = await userService.getUsersByRole(req.params.role);
  successResponse(res, users, 'Users retrieved successfully');
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole
};

