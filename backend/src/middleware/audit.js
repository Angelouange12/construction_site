const auditService = require('../services/auditService');

/**
 * Middleware to automatically audit CRUD operations
 * Use this middleware on specific routes that need auditing
 */
const auditMiddleware = (entityType, getEntityName = null) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to capture response
    res.json = async (body) => {
      try {
        // Only audit successful operations
        if (body && body.success) {
          const method = req.method;
          const entityId = req.params.id || body.data?.id;
          const entityName = getEntityName 
            ? getEntityName(body.data) 
            : body.data?.name || body.data?.title || `${entityType} #${entityId}`;

          if (method === 'POST' && !req.path.includes('login')) {
            await auditService.logCreate(entityType, entityId, entityName, body.data, req);
          } else if (method === 'PUT' || method === 'PATCH') {
            // For updates, we'd need to store old values before the operation
            // This is a simplified version
            await auditService.log({
              userId: req.user?.id,
              userEmail: req.user?.email,
              action: 'update',
              entityType,
              entityId,
              entityName,
              newValues: req.body,
              ipAddress: req.ip,
              userAgent: req.get('user-agent'),
              description: `Updated ${entityType}: ${entityName}`
            });
          } else if (method === 'DELETE') {
            await auditService.log({
              userId: req.user?.id,
              userEmail: req.user?.email,
              action: 'delete',
              entityType,
              entityId,
              entityName,
              ipAddress: req.ip,
              userAgent: req.get('user-agent'),
              description: `Deleted ${entityType}: ${entityName}`
            });
          }
        }
      } catch (error) {
        console.error('Audit logging error:', error);
        // Don't fail the request if audit fails
      }

      // Call original json method
      return originalJson(body);
    };

    next();
  };
};

/**
 * Simple audit wrapper for manual logging
 */
const logAction = async (action, entityType, entityId, entityName, req, metadata = {}) => {
  try {
    await auditService.log({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action,
      entityType,
      entityId,
      entityName,
      newValues: metadata,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      description: `${action} ${entityType}: ${entityName}`
    });
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};

module.exports = { auditMiddleware, logAction };

