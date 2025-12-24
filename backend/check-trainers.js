import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkTrainers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Tìm tất cả HLV (trainer hoặc instructor)
    const trainers = await User.find({
      role: { $in: ['trainer', 'instructor'] }
    }).select('username email fullName role phone');

    console.log(`📊 Tổng số HLV: ${trainers.length}\n`);
    
    if (trainers.length > 0) {
      console.log('👨‍🏫 DANH SÁCH HUẤN LUYỆN VIÊN:');
      console.log('='.repeat(60));
      trainers.forEach((trainer, i) => {
        console.log(`${i + 1}. ${trainer.fullName || trainer.username}`);
        console.log(`   📧 Email: ${trainer.email}`);
        console.log(`   👤 Username: ${trainer.username}`);
        console.log(`   🎭 Role: ${trainer.role === 'trainer' ? 'Huấn luyện viên' : 'Giảng viên'}`);
        console.log(`   📞 Phone: ${trainer.phone || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Không có HLV nào trong hệ thống!');
    }

    // Thống kê theo role
    const stats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    console.log('\n📈 THỐNG KÊ THEO VAI TRÒ:');
    console.log('='.repeat(60));
    stats.forEach(stat => {
      const roleNames = {
        'user': 'Người dùng',
        'admin': 'Quản trị viên',
        'trainer': 'Huấn luyện viên',
        'instructor': 'Giảng viên'
      };
      console.log(`${roleNames[stat._id] || stat._id}: ${stat.count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

checkTrainers();
