import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './models/Attendance.js';
import User from './models/User.js';
import Class from './models/Class.js';

dotenv.config();

const checkUyenNhi = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Tìm user Uyển Nhi
    const user = await User.findOne({ 
      $or: [
        { fullName: /uyển nhi/i },
        { fullName: /uyen nhi/i },
        { email: /uyennhi/i }
      ]
    });

    if (!user) {
      console.log('❌ Không tìm thấy user Uyển Nhi');
      mongoose.connection.close();
      return;
    }

    console.log('👤 User found:');
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user._id}\n`);

    // Tìm tất cả attendance của user này
    const attendances = await Attendance.find({ userId: user._id })
      .populate('classId', 'className')
      .sort({ sessionDate: -1 });

    console.log(`📊 Total attendance records: ${attendances.length}\n`);

    if (attendances.length > 0) {
      console.log('📋 Attendance Details:\n');
      attendances.forEach((att, index) => {
        console.log(`${index + 1}. Class: ${att.classId?.className || 'N/A'}`);
        console.log(`   Session: ${att.sessionNumber}`);
        console.log(`   Date: ${att.sessionDate}`);
        console.log(`   Status: ${att.isPresent ? '✓ Present' : '✗ Absent'}`);
        console.log(`   ClassId: ${att.classId?._id}`);
        console.log('');
      });
    } else {
      console.log('⚠️ User chưa có attendance records nào!\n');
    }

    // Kiểm tra class HIIT
    const hiitClass = await Class.findOne({ className: /HIIT/i });
    if (hiitClass) {
      console.log('🏋️ HIIT Class found:');
      console.log(`   Name: ${hiitClass.className}`);
      console.log(`   ID: ${hiitClass._id}\n`);

      const hiitAttendances = await Attendance.find({ 
        userId: user._id, 
        classId: hiitClass._id 
      }).sort({ sessionNumber: 1 });

      console.log(`📊 HIIT Attendance: ${hiitAttendances.length} records\n`);
      hiitAttendances.forEach(att => {
        console.log(`   Session ${att.sessionNumber}: ${att.isPresent ? '✓ Present' : '✗ Absent'} - ${att.sessionDate}`);
      });
    }

    mongoose.connection.close();
    console.log('\n✅ Check complete');
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
  }
};

checkUyenNhi();
