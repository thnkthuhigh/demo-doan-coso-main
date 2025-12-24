import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: './backend/.env' });

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Tìm tất cả users
    const allUsers = await User.find().select('_id username fullName email role');
    console.log('=== ALL USERS ===');
    allUsers.forEach(u => {
      console.log(`${u._id} | ${u.fullName || u.username} | ${u.role}`);
    });
    console.log('');

    // Tìm user có tên chứa "Nghi"
    const user = await User.findOne({ 
      $or: [
        { fullName: /Nghi/i },
        { username: /nghi/i }
      ]
    }).select('_id username fullName email role');
    
    if (user) {
      console.log('=== FOUND USER WITH "NGHI" ===');
      console.log('ID:', user._id);
      console.log('Username:', user.username);
      console.log('Full Name:', user.fullName);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('');
      
      if (user.role !== 'instructor') {
        console.log('⚠️  WARNING: Role is not "instructor"!');
        console.log('Updating role to "instructor"...');
        
        user.role = 'instructor';
        await user.save();
        
        console.log('✅ Role updated to "instructor"');
      } else {
        console.log('✅ Role is correct: instructor');
      }
    } else {
      console.log('❌ User with "Nghi" not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkUser();
