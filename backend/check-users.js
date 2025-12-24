import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}, 'username email fullName role').limit(20);
    
    console.log(`📊 Tổng số users: ${users.length}\n`);
    
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.fullName || user.username}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Username: ${user.username}`);
      console.log(`   🎭 Role: ${user.role}`);
      console.log('');
    });

    // Check specific users
    const thanh = await User.findOne({ $or: [{ email: 'thanh' }, { username: 'thanh' }] });
    const nghi = await User.findOne({ $or: [{ email: 'nghi' }, { username: 'nghi' }] });
    const userAccount = await User.findOne({ $or: [{ email: 'user' }, { username: 'user' }] });

    console.log('\n🔍 KIỂM TRA TÀI KHOẢN CỤ THỂ:');
    console.log('================================');
    console.log('Thanh:', thanh ? '✅ Tồn tại' : '❌ Không tồn tại');
    console.log('Nghi:', nghi ? '✅ Tồn tại' : '❌ Không tồn tại');
    console.log('User:', userAccount ? '✅ Tồn tại' : '❌ Không tồn tại');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

checkUsers();
