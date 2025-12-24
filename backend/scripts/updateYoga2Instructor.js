import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Class from '../models/Class.js';
import User from '../models/User.js';

dotenv.config({ path: './backend/.env' });

const updateInstructor = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found');
      process.exit(1);
    }

    console.log('MONGODB_URI: Found');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Update YOGA 2 instructor to correct user
    const correctInstructorId = '6758a1ce3fc37e96c4d43d69'; // Đào Nguyễn Uyển Nghi
    
    const result = await Class.findOneAndUpdate(
      { className: 'YOGA 2' },
      { 
        instructor: new mongoose.Types.ObjectId(correctInstructorId),
        instructorName: 'Đào Nguyễn Uyển Nghi'
      },
      { new: true }
    ).populate('instructor', 'fullName username');

    if (result) {
      console.log('✅ Updated YOGA 2 instructor:');
      console.log(`   Class: ${result.className}`);
      console.log(`   New Instructor: ${result.instructor?.fullName || result.instructor?.username}`);
      console.log(`   Instructor ID: ${result.instructor?._id}`);
    } else {
      console.log('❌ YOGA 2 class not found');
    }

    console.log('\n✅ Update completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateInstructor();
