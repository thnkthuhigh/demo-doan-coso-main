import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const testLogin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Lấy TẤT CẢ users
    const users = await User.find({}).select('username email password');

    console.log(`📊 Tổng số users: ${users.length}\n`);
    console.log('📋 KIỂM TRA TÀI KHOẢN:');
    console.log('='.repeat(60));

    for (const user of users) {
      console.log(`\n👤 Username: ${user.username}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Password Hash: ${user.password.substring(0, 30)}...`);
      
      // Test các password phổ biến
      const testPasswords = ['123456', '12345678', 'password', user.username, 'user123'];
      
      for (const pwd of testPasswords) {
        const match = await bcrypt.compare(pwd, user.password);
        if (match) {
          console.log(`   ✅ PASSWORD ĐÚNG: "${pwd}"`);
          break;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n💡 Gợi ý: Hãy thử đăng nhập với các password đã test ở trên');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

testLogin();
