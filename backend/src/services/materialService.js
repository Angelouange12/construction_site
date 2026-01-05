const { Material, MaterialUsage, Site } = require('../models');
const { Op } = require('sequelize');

class MaterialService {
  /**
   * Get all materials with pagination
   */
  async getAllMaterials(options = {}) {
    const { page = 1, limit = 10, search, lowStock } = options;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { supplier: { [Op.like]: `%${search}%` } }
      ];
    }

    let materials = await Material.findAll({
      where,
      order: [['name', 'ASC']]
    });

    // Filter low stock if requested
    if (lowStock === 'true' || lowStock === true) {
      materials = materials.filter(m => m.stockQuantity <= m.alertThreshold);
    }

    // Manual pagination
    const total = materials.length;
    const paginatedMaterials = materials.slice(offset, offset + parseInt(limit));

    return {
      materials: paginatedMaterials,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get material by ID
   */
  async getMaterialById(id) {
    const material = await Material.findByPk(id, {
      include: [
        { 
          model: MaterialUsage, 
          as: 'usage',
          include: [{ model: Site, as: 'site', attributes: ['id', 'name'] }],
          limit: 10,
          order: [['usageDate', 'DESC']]
        }
      ]
    });

    if (!material) {
      const error = new Error('Material not found');
      error.statusCode = 404;
      error.code = 'MATERIAL_NOT_FOUND';
      throw error;
    }

    return material;
  }

  /**
   * Create a new material
   */
  async createMaterial(materialData) {
    const material = await Material.create(materialData);
    return this.getMaterialById(material.id);
  }

  /**
   * Update material
   */
  async updateMaterial(id, updates) {
    const material = await Material.findByPk(id);

    if (!material) {
      const error = new Error('Material not found');
      error.statusCode = 404;
      error.code = 'MATERIAL_NOT_FOUND';
      throw error;
    }

    const allowedUpdates = ['name', 'description', 'unit', 'unitPrice', 'stockQuantity', 'alertThreshold', 'supplier', 'isActive'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    await material.update(filteredUpdates);
    return this.getMaterialById(id);
  }

  /**
   * Delete material (soft delete)
   */
  async deleteMaterial(id) {
    const material = await Material.findByPk(id);

    if (!material) {
      const error = new Error('Material not found');
      error.statusCode = 404;
      error.code = 'MATERIAL_NOT_FOUND';
      throw error;
    }

    await material.destroy();
    return { message: 'Material deleted successfully' };
  }

  /**
   * Add stock to material
   */
  async addStock(id, quantity) {
    const material = await Material.findByPk(id);

    if (!material) {
      const error = new Error('Material not found');
      error.statusCode = 404;
      error.code = 'MATERIAL_NOT_FOUND';
      throw error;
    }

    const newQuantity = material.stockQuantity + parseInt(quantity);
    await material.update({ stockQuantity: newQuantity });

    return this.getMaterialById(id);
  }

  /**
   * Record material usage
   */
  async recordUsage(usageData) {
    const { materialId, siteId, quantity, notes } = usageData;

    // Verify material exists
    const material = await Material.findByPk(materialId);
    if (!material) {
      const error = new Error('Material not found');
      error.statusCode = 404;
      error.code = 'MATERIAL_NOT_FOUND';
      throw error;
    }

    // Verify site exists
    const site = await Site.findByPk(siteId);
    if (!site) {
      const error = new Error('Site not found');
      error.statusCode = 404;
      error.code = 'SITE_NOT_FOUND';
      throw error;
    }

    // Check stock
    if (material.stockQuantity < quantity) {
      const error = new Error('Insufficient stock');
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_STOCK';
      throw error;
    }

    // Calculate total cost
    const totalCost = parseFloat(material.unitPrice) * parseFloat(quantity);

    // Create usage record
    const usage = await MaterialUsage.create({
      materialId,
      siteId,
      quantity,
      totalCost,
      usageDate: usageData.usageDate || new Date().toISOString().split('T')[0],
      notes
    });

    // Update stock
    await material.update({
      stockQuantity: material.stockQuantity - parseInt(quantity)
    });

    return usage;
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts() {
    const materials = await Material.findAll({
      where: { isActive: true }
    });

    return materials.filter(m => m.stockQuantity <= m.alertThreshold);
  }

  /**
   * Get material usage by site
   */
  async getUsageBySite(siteId) {
    const usage = await MaterialUsage.findAll({
      where: { siteId },
      include: [{ model: Material, as: 'material', attributes: ['id', 'name', 'unit'] }],
      order: [['usageDate', 'DESC']]
    });

    const totalCost = usage.reduce((sum, u) => sum + parseFloat(u.totalCost || 0), 0);

    return { usage, totalCost };
  }
}

module.exports = new MaterialService();

