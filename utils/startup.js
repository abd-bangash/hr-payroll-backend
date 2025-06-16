const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Create default SuperAdmin user if none exists
const createDefaultSuperAdmin = async () => {
  try {
    // Check if any SuperAdmin exists
    const existingSuperAdmin = await User.findOne({ role: 'SuperAdmin' });
    
    if (existingSuperAdmin) {
      console.log('SuperAdmin already exists');
      return;
    }

    // Create default SuperAdmin
    const defaultSuperAdmin = new User({
      username: process.env.DEFAULT_SUPERADMIN_USERNAME || 'superadmin',
      email: process.env.DEFAULT_SUPERADMIN_EMAIL || 'superadmin@company.com',
      password: process.env.DEFAULT_SUPERADMIN_PASSWORD || 'SuperAdmin123!',
      role: 'SuperAdmin',
      isActive: true
    });

    await defaultSuperAdmin.save();
    
    console.log('Default SuperAdmin created successfully');
    console.log(`Username: ${defaultSuperAdmin.username}`);
    console.log(`Email: ${defaultSuperAdmin.email}`);
    console.log('Please change the default password after first login!');
    
  } catch (error) {
    console.error('Error creating default SuperAdmin:', error);
  }
};

// Initialize database with sample data (for development)
const initializeSampleData = async () => {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount > 1) { // More than just the SuperAdmin
      console.log('Sample data already exists');
      return;
    }

    // Create sample users
    const sampleUsers = [
      {
        username: 'hr_manager',
        email: 'hr@company.com',
        password: 'HRManager123!',
        role: 'HR'
      },
      {
        username: 'finance_manager',
        email: 'finance@company.com',
        password: 'Finance123!',
        role: 'Finance'
      },
      {
        username: 'john_doe',
        email: 'john.doe@company.com',
        password: 'Employee123!',
        role: 'Employee'
      }
    ];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created sample user: ${user.username}`);
    }

    console.log('Sample data initialized successfully');
    
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

module.exports = {
  createDefaultSuperAdmin,
  initializeSampleData
};