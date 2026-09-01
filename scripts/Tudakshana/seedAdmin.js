import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../../config/db.js';
import User from '../../models/Tudakshana/User.js';

dotenv.config();

const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@glowy.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '1234567890';

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      existingAdmin.name = ADMIN_NAME;
      existingAdmin.password = ADMIN_PASSWORD;
      existingAdmin.phone = ADMIN_PHONE;
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();

      console.log('Admin user updated successfully.');
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        phone: ADMIN_PHONE,
        role: 'admin',
        isActive: true,
      });

      console.log('Admin user created successfully.');
    }

    console.log('Admin login credentials:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error('Failed to seed admin user:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedAdmin();
