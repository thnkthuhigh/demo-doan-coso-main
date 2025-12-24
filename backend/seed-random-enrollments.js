import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Class from './models/Class.js';
import ClassEnrollment from './models/ClassEnrollment.js';

dotenv.config();

const seedRandomEnrollments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy tất cả người dùng (loại trừ admin và trainer)
    const users = await User.find({ 
      role: { $nin: ['admin', 'trainer'] } 
    }).limit(4);
    
    console.log(`\n📊 Tìm thấy ${users.length} người dùng`);
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email})`);
    });

    // Lấy tất cả lớp học
    const classes = await Class.find();
    console.log(`\n📚 Tìm thấy ${classes.length} lớp học`);
    classes.forEach(cls => {
      console.log(`  - ${cls.className} (${cls.classType})`);
    });

    if (users.length === 0) {
      console.log('\n❌ Không có người dùng nào để đăng ký!');
      return;
    }

    if (classes.length === 0) {
      console.log('\n❌ Không có lớp học nào!');
      return;
    }

    // Xóa các enrollment cũ (tùy chọn)
    console.log('\n🗑️  Xóa các enrollment cũ...');
    await ClassEnrollment.deleteMany({});

    let totalEnrollments = 0;

    // Đăng ký ngẫu nhiên cho mỗi người dùng
    for (const user of users) {
      console.log(`\n👤 Đang đăng ký cho: ${user.username}`);
      
      // Trộn ngẫu nhiên mảng lớp học
      const shuffledClasses = [...classes].sort(() => Math.random() - 0.5);
      
      // Chọn 2 lớp đầu tiên (hoặc ít hơn nếu không đủ lớp)
      const numEnrollments = Math.min(2, shuffledClasses.length);
      const selectedClasses = shuffledClasses.slice(0, numEnrollments);

      for (const cls of selectedClasses) {
        try {
          // Kiểm tra xem đã đăng ký chưa
          const existingEnrollment = await ClassEnrollment.findOne({
            user: user._id,
            class: cls._id
          });

          if (existingEnrollment) {
            console.log(`  ⏭️  Đã đăng ký: ${cls.className}`);
            continue;
          }

          // Tạo enrollment mới
          const enrollment = new ClassEnrollment({
            user: user._id,
            class: cls._id,
            status: 'active',
            enrollmentDate: new Date(),
            paymentStatus: true // Đã thanh toán để không bị xóa
          });

          await enrollment.save();
          
          // Cập nhật số lượng học viên trong lớp
          await Class.findByIdAndUpdate(cls._id, {
            $inc: { currentParticipants: 1 }
          });

          console.log(`  ✅ Đã đăng ký: ${cls.className}`);
          totalEnrollments++;
        } catch (error) {
          console.error(`  ❌ Lỗi khi đăng ký ${cls.className}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Hoàn thành! Tổng cộng ${totalEnrollments} đăng ký được tạo.`);

    // Hiển thị kết quả
    console.log('\n📋 Kết quả đăng ký:');
    const enrollments = await ClassEnrollment.find()
      .populate('user', 'username email')
      .populate('class', 'className classType');

    const userEnrollmentMap = {};
    enrollments.forEach(enrollment => {
      const username = enrollment.user.username;
      if (!userEnrollmentMap[username]) {
        userEnrollmentMap[username] = [];
      }
      userEnrollmentMap[username].push(enrollment.class.className);
    });

    Object.keys(userEnrollmentMap).forEach(username => {
      console.log(`\n  👤 ${username}:`);
      userEnrollmentMap[username].forEach(className => {
        console.log(`     - ${className}`);
      });
    });

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  }
};

seedRandomEnrollments();
