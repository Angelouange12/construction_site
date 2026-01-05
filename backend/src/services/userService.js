const { User, Worker } = require('../models');
const { Op } = require('sequelize');

class UserService {
  /**
   * Get all users with pagination
   */
  async getAllUsers(options = {}) {
    const { page = 1, limit = 10, role, search } = options;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Worker, as: 'workerProfile' }]
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return user;
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(userData) {
    const { email, password, name, role } = userData;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const user = await User.create({
      email,
      password,
      name,
      role: role || 'ouvrier'
    });

    return user.toJSON();
  }

  /**
   * Update user
   */
  async updateUser(id, updates) {
    const user = await User.findByPk(id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const allowedUpdates = ['name', 'email', 'role', 'isActive'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    await user.update(filteredUpdates);
    return user.toJSON();
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id) {
    const user = await User.findByPk(id);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role) {
    return User.findAll({
      where: { role, isActive: true },
      attributes: { exclude: ['password'] }
    });
  }
}

module.exports = new UserService();

