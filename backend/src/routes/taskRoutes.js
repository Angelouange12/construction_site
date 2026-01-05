const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { taskValidator, idParamValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Special routes first
router.get('/overdue', taskController.getOverdueTasks);
router.get('/site/:siteId', taskController.getTasksBySite);
router.get('/worker/:workerId', taskController.getTasksByWorker);

// Standard CRUD
router.get('/', taskController.getAllTasks);
router.post('/', isAdminOrChef, taskValidator, validate, taskController.createTask);
router.get('/:id', idParamValidator, validate, taskController.getTaskById);
router.put('/:id', idParamValidator, validate, taskController.updateTask);
router.delete('/:id', isAdminOrChef, idParamValidator, validate, taskController.deleteTask);
router.post('/:id/assign', isAdminOrChef, idParamValidator, validate, taskController.assignTask);

module.exports = router;

