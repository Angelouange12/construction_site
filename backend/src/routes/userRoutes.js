const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerValidator, idParamValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/', isAdmin, userController.getAllUsers);
router.get('/role/:role', isAdmin, userController.getUsersByRole);
router.post('/', isAdmin, registerValidator, validate, userController.createUser);
router.get('/:id', isAdmin, idParamValidator, validate, userController.getUserById);
router.put('/:id', isAdmin, idParamValidator, validate, userController.updateUser);
router.delete('/:id', isAdmin, idParamValidator, validate, userController.deleteUser);

module.exports = router;

