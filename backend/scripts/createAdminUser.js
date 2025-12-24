import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin exists
    const existing = await User.findOne({ email: 'admin@gym.com' });
    if (existing) {
      console.log('⚠️  Admin already exists!');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@gym.com',
      fullName: 'Admin User',
      password: '123456',
      phone: '0901234567',
      address: 'Gym HQ',
      dob: new Date('1990-01-01'),
      gender: 'male',
      role: 'admin'
    });

    await admin.save();
    
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@gym.com');
    console.log('🔑 Password: 123456');
    console.log('👤 Role: admin\n');

    // Create a regular user
    const user = new User({
      username: 'user123',
      email: 'user@gym.com',
      fullName: 'Regular User',
      password: '123456',
      phone: '0909876543',
      address: '123 Street',
      dob: new Date('2000-01-01'),
      gender: 'male',
      role: 'user'
    });

    await user.save();
    
    console.log('🎉 Regular user created successfully!');
    console.log('📧 Email: user@gym.com');
    console.log('🔑 Password: 123456');
    console.log('👤 Role: user\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

createAdmin();
