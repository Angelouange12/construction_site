const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { authenticate, isAdminOrChef, isAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { materialValidator, materialUsageValidator, idParamValidator } = require('../utils/validators');
const { upload } = require('../config/upload');

// All routes require authentication
router.use(authenticate);

// Special routes
router.get('/alerts/low-stock', materialController.getLowStockAlerts);
router.get('/usage/site/:siteId', materialController.getUsageBySite);
router.post('/usage', isAdminOrChef, materialUsageValidator, validate, materialController.recordUsage);

// Standard CRUD
router.get('/', materialController.getAllMaterials);
router.post('/', isAdmin, materialValidator, validate, materialController.createMaterial);
router.get('/:id', idParamValidator, validate, materialController.getMaterialById);
router.put('/:id', isAdmin, idParamValidator, validate, materialController.updateMaterial);
router.delete('/:id', isAdmin, idParamValidator, validate, materialController.deleteMaterial);
router.post('/:id/add-stock', isAdmin, idParamValidator, validate, materialController.addStock);
router.post('/:id/photo', isAdmin, upload.single('photo'), materialController.uploadPhoto);

module.exports = router;

