import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './models/Attendance.js';

dotenv.config();

const resetAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Xóa tất cả attendance records
    const result = await Attendance.deleteMany({});
    
    console.log(`🗑️  Đã xóa ${result.deletedCount} bản ghi điểm danh`);
    console.log('✅ Reset thành công! Bây giờ bạn có thể điểm danh lại.\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Đã ngắt kết nối MongoDB');
  }
};

resetAttendance();
