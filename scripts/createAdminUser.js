// Script to create a test admin user
// Run this with: node scripts/createAdminUser.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/Tudakshana/User.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sliit_af_db';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email: admin@test.com');
      console.log('   Email: admin@test.com');
      console.log('   Password: admin123');
      process.exit(0);
    }

    // Create new admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123', // Will be hashed by the User model
      role: 'admin',
      phone: '1234567890',
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('You can now login at: http://localhost:5173/admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Create test users for each role
const createAllTestUsers = async () => {
  try {
    await connectDB();

    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        phone: '1234567890',
      },
      {
        name: 'Seller User',
        email: 'seller@test.com',
        password: 'seller123',
        role: 'seller',
        phone: '1234567891',
      },
      {
        name: 'Customer User',
        email: 'customer@test.com',
        password: 'customer123',
        role: 'customer',
        phone: '1234567892',
      },
    ];

    console.log('Creating test users...\n');

    for (const userData of testUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⚠️  ${userData.role} user already exists: ${userData.email}`);
      } else {
        await User.create(userData);
        console.log(`✅ ${userData.role} user created: ${userData.email}`);
      }
    }

    console.log('\n📋 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@test.com');
    console.log('  Password: admin123');
    console.log('  Login: http://localhost:5173/admin/login');
    console.log('');
    console.log('Seller:');
    console.log('  Email: seller@test.com');
    console.log('  Password: seller123');
    console.log('  Login: http://localhost:5173/seller/login');
    console.log('');
    console.log('Customer:');
    console.log('  Email: customer@test.com');
    console.log('  Password: customer123');
    console.log('  Login: http://localhost:5173/login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--all')) {
  createAllTestUsers();
} else {
  createAdminUser();
}
