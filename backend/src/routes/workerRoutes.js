const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { workerValidator, idParamValidator } = require('../utils/validators');
const { uploadProfilePhoto } = require('../config/upload');

// All routes require authentication
router.use(authenticate);

// Special routes
router.get('/site/:siteId', workerController.getWorkersBySite);

// Standard CRUD
router.get('/', workerController.getAllWorkers);
router.post('/', isAdminOrChef, workerValidator, validate, workerController.createWorker);
router.get('/:id', idParamValidator, validate, workerController.getWorkerById);
router.get('/:id/stats', idParamValidator, validate, workerController.getWorkerStats);
router.put('/:id', isAdminOrChef, idParamValidator, validate, workerController.updateWorker);
router.delete('/:id', isAdminOrChef, idParamValidator, validate, workerController.deleteWorker);
router.post('/:id/assign', isAdminOrChef, idParamValidator, validate, workerController.assignToSite);
router.post('/:id/photo', isAdminOrChef, uploadProfilePhoto.single('photo'), workerController.uploadPhoto);

module.exports = router;

