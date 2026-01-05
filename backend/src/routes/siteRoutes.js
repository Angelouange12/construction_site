const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { siteValidator, idParamValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Get my sites (for chef_chantier)
router.get('/my-sites', siteController.getMySites);

// Standard CRUD
router.get('/', siteController.getAllSites);
router.post('/', isAdminOrChef, siteValidator, validate, siteController.createSite);
router.get('/:id', idParamValidator, validate, siteController.getSiteById);
router.get('/:id/stats', idParamValidator, validate, siteController.getSiteStats);
router.put('/:id', isAdminOrChef, idParamValidator, validate, siteController.updateSite);
router.delete('/:id', isAdminOrChef, idParamValidator, validate, siteController.deleteSite);

module.exports = router;

