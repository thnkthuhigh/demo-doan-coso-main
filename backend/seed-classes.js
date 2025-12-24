import mongoose from 'mongoose';
import Class from './models/Class.js';
import Service from './models/Service.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedClasses = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Lấy HLV
    const trainers = await User.find({ role: { $in: ['trainer', 'instructor'] } });
    if (trainers.length === 0) {
      console.log('❌ Không có HLV nào. Vui lòng tạo HLV trước!');
      await mongoose.disconnect();
      return;
    }

    // Lấy services
    const services = await Service.find({});
    if (services.length === 0) {
      console.log('❌ Không có dịch vụ nào. Vui lòng chạy seed-clubs-services.js trước!');
      await mongoose.disconnect();
      return;
    }

    console.log(`📊 Tìm thấy ${trainers.length} HLV và ${services.length} dịch vụ\n`);

    // Xóa classes cũ
    await Class.deleteMany({});
    console.log('🗑️  Đã xóa các lớp học cũ\n');

    // Hàm tạo sessions dựa trên schedule
    const generateSessions = (startDate, totalSessions, schedule) => {
      const sessions = [];
      let currentDate = new Date(startDate);
      let sessionCount = 0;

      // Lặp qua các ngày cho đến khi đủ số buổi
      while (sessionCount < totalSessions) {
        const dayOfWeek = currentDate.getDay(); // 0 = CN, 1 = T2, ...
        
        // Kiểm tra xem ngày này có trong lịch không
        const scheduleItem = schedule.find(s => s.dayOfWeek === dayOfWeek);
        
        if (scheduleItem) {
          sessions.push({
            sessionNumber: sessionCount + 1,
            date: new Date(currentDate),
            startTime: scheduleItem.startTime,
            endTime: scheduleItem.endTime,
            status: 'scheduled'
          });
          sessionCount++;
        }
        
        // Tăng lên 1 ngày
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return sessions;
    };

    // Tính ngày bắt đầu (Thứ 2 tuần sau)
    const getNextMonday = () => {
      const today = new Date();
      const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      return nextMonday;
    };

    const startDate = getNextMonday();

    // Tạo 3 lớp học
    const classesData = [
      {
        className: 'Yoga Cơ Bản Buổi Sáng',
        instructor: trainers[Math.floor(Math.random() * trainers.length)],
        service: services[Math.floor(Math.random() * services.length)],
        description: 'Lớp yoga cơ bản dành cho người mới bắt đầu. Tập trung vào các tư thế căn bản, hô hấp và thiền định.',
        maxMembers: 20,
        totalSessions: 12,
        price: 1500000,
        startDate: startDate,
        endDate: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 ngày
        schedule: [
          { dayOfWeek: 1, startTime: '06:00', endTime: '07:30' }, // Thứ 2
          { dayOfWeek: 3, startTime: '06:00', endTime: '07:30' }, // Thứ 4
          { dayOfWeek: 5, startTime: '06:00', endTime: '07:30' }, // Thứ 6
        ],
        location: 'Phòng Yoga A1, Tầng 2',
        status: 'ongoing',
      },
      {
        className: 'Boxing Nâng Cao',
        instructor: trainers[Math.floor(Math.random() * trainers.length)],
        service: services[Math.floor(Math.random() * services.length)],
        description: 'Lớp boxing dành cho học viên có kinh nghiệm. Luyện tập kỹ thuật nâng cao, combo đấm, phòng thủ và sparring.',
        maxMembers: 15,
        totalSessions: 16,
        price: 2500000,
        startDate: startDate,
        endDate: new Date(startDate.getTime() + 120 * 24 * 60 * 60 * 1000), // 120 ngày
        schedule: [
          { dayOfWeek: 2, startTime: '18:00', endTime: '19:30' }, // Thứ 3
          { dayOfWeek: 4, startTime: '18:00', endTime: '19:30' }, // Thứ 5
          { dayOfWeek: 6, startTime: '18:00', endTime: '19:30' }, // Thứ 7
        ],
        location: 'Phòng Boxing, Tầng 3',
        status: 'ongoing',
      },
      {
        className: 'HIIT & Cardio Giảm Cân',
        instructor: trainers[Math.floor(Math.random() * trainers.length)],
        service: services[Math.floor(Math.random() * services.length)],
        description: 'Lớp tập HIIT cường độ cao kết hợp cardio giúp đốt cháy mỡ hiệu quả. Phù hợp cho người muốn giảm cân nhanh.',
        maxMembers: 25,
        totalSessions: 20,
        price: 2000000,
        startDate: startDate,
        endDate: new Date(startDate.getTime() + 150 * 24 * 60 * 60 * 1000), // 150 ngày
        schedule: [
          { dayOfWeek: 1, startTime: '18:30', endTime: '19:30' }, // Thứ 2
          { dayOfWeek: 3, startTime: '18:30', endTime: '19:30' }, // Thứ 4
          { dayOfWeek: 5, startTime: '18:30', endTime: '19:30' }, // Thứ 6
        ],
        location: 'Studio Dance, Tầng 2',
        status: 'ongoing',
      },
    ];

    // Tạo classes với đầy đủ thông tin và sessions
    const createdClasses = [];
    for (const classData of classesData) {
      // Tạo sessions cho lớp này
      const sessions = generateSessions(classData.startDate, classData.totalSessions, classData.schedule);
      
      const newClass = new Class({
        ...classData,
        instructorName: classData.instructor.fullName || classData.instructor.username,
        serviceName: classData.service.name,
        currentMembers: 0,
        currentSession: 0,
        sessions: sessions
      });
      
      const saved = await newClass.save();
      createdClasses.push(saved);
    }

    console.log(`✅ Đã tạo ${createdClasses.length} lớp học:\n`);
    createdClasses.forEach((cls, i) => {
      console.log(`${i + 1}. ${cls.className}`);
      console.log(`   👨‍🏫 HLV: ${cls.instructorName}`);
      console.log(`   🏋️ Dịch vụ: ${cls.serviceName}`);
      console.log(`   👥 Sức chứa: ${cls.maxMembers} người`);
      console.log(`   📚 Tổng buổi: ${cls.totalSessions} buổi`);
      console.log(`   💰 Giá: ${cls.price.toLocaleString('vi-VN')} VNĐ`);
      console.log(`   📅 Bắt đầu: ${cls.startDate.toLocaleDateString('vi-VN')}`);
      console.log(`   📅 Kết thúc: ${cls.endDate.toLocaleDateString('vi-VN')}`);
      console.log(`   📍 Địa điểm: ${cls.location}`);
      console.log(`   🎯 Trạng thái: ${cls.status}`);
      console.log('');
    });

    console.log('🎉 Tạo lớp học thành công!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

seedClasses();
