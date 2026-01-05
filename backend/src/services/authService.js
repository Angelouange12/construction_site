const { User } = require('../models');
const { generateToken } = require('../middleware/auth');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const { email, password, name, role } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'ouvrier'
    });

    // Generate token
    const token = generateToken(user);

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Check if active
    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.statusCode = 401;
      error.code = 'ACCOUNT_DEACTIVATED';
      throw error;
    }

    // Generate token
    const token = generateToken(user);

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return user.toJSON();
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['name', 'email'];
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
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      error.code = 'INVALID_PASSWORD';
      throw error;
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AuthService();

