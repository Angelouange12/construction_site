const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { incidentValidator, idParamValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Special routes
router.get('/stats', incidentController.getIncidentStats);
router.get('/site/:siteId', incidentController.getIncidentsBySite);

// Standard CRUD
router.get('/', incidentController.getAllIncidents);
router.post('/', incidentValidator, validate, incidentController.createIncident);
router.get('/:id', idParamValidator, validate, incidentController.getIncidentById);
router.put('/:id', isAdminOrChef, idParamValidator, validate, incidentController.updateIncident);
router.put('/:id/status', isAdminOrChef, idParamValidator, validate, incidentController.updateStatus);
router.delete('/:id', isAdminOrChef, idParamValidator, validate, incidentController.deleteIncident);

module.exports = router;

