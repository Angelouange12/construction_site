const taskService = require('../services/taskService');
const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all tasks
 * GET /api/tasks
 */
const getAllTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getAllTasks(req.query);
  paginatedResponse(res, result.tasks, result.pagination, 'Tasks retrieved successfully');
});

/**
 * Get task by ID
 * GET /api/tasks/:id
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  successResponse(res, task, 'Task retrieved successfully');
});

/**
 * Create a new task
 * POST /api/tasks
 */
const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body);
  successResponse(res, task, 'Task created successfully', 201);
});

/**
 * Update task
 * PUT /api/tasks/:id
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  successResponse(res, task, 'Task updated successfully');
});

/**
 * Delete task
 * DELETE /api/tasks/:id
 */
const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.params.id);
  successResponse(res, result, 'Task deleted successfully');
});

/**
 * Get tasks by site
 * GET /api/tasks/site/:siteId
 */
const getTasksBySite = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasksBySite(req.params.siteId);
  successResponse(res, tasks, 'Tasks retrieved successfully');
});

/**
 * Get tasks assigned to a worker
 * GET /api/tasks/worker/:workerId
 */
const getTasksByWorker = asyncHandler(async (req, res) => {
  const tasks = await taskService.getTasksByWorker(req.params.workerId);
  successResponse(res, tasks, 'Tasks retrieved successfully');
});

/**
 * Assign task to worker
 * POST /api/tasks/:id/assign
 */
const assignTask = asyncHandler(async (req, res) => {
  const { workerId } = req.body;
  const task = await taskService.assignTask(req.params.id, workerId);
  successResponse(res, task, 'Task assigned successfully');
});

/**
 * Get overdue tasks
 * GET /api/tasks/overdue
 */
const getOverdueTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getOverdueTasks();
  successResponse(res, tasks, 'Overdue tasks retrieved successfully');
});

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksBySite,
  getTasksByWorker,
  assignTask,
  getOverdueTasks
};

