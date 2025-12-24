import mongoose from 'mongoose';
import Class from '../models/Class.js';
import ClassEnrollment from '../models/ClassEnrollment.js';
import Payment from '../models/Payment.js';
import dotenv from 'dotenv';

dotenv.config();

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management');
    
    console.log('🗑️  Bắt đầu xóa dữ liệu mẫu...');
    
    // Xóa tất cả lớp học
    const classResult = await Class.deleteMany({});
    console.log(`✅ Đã xóa ${classResult.deletedCount} lớp học`);
    
    // Xóa tất cả đăng ký lớp
    const enrollResult = await ClassEnrollment.deleteMany({});
    console.log(`✅ Đã xóa ${enrollResult.deletedCount} đăng ký lớp`);
    
    // Xóa tất cả thanh toán liên quan đến lớp
    const paymentResult = await Payment.deleteMany({ paymentType: 'class' });
    console.log(`✅ Đã xóa ${paymentResult.deletedCount} thanh toán lớp học`);
    
    console.log('🎉 Xóa dữ liệu thành công! Database đã sạch.');
    console.log('💡 Bây giờ bạn có thể tạo lớp mới từ web admin.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

clearData();
