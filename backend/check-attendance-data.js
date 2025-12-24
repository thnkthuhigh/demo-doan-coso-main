import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './models/Attendance.js';
import User from './models/User.js';
import Class from './models/Class.js';

dotenv.config();

const checkAttendanceData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy tất cả attendance records
    const attendances = await Attendance.find()
      .populate('userId', 'fullName email')
      .populate('classId', 'className')
      .sort({ createdAt: -1 })
      .limit(20);

    console.log('\n📊 Total Attendance Records:', await Attendance.countDocuments());
    console.log('\n📋 Latest 20 Records:');
    console.log('=' .repeat(100));

    attendances.forEach((att, index) => {
      console.log(`\n${index + 1}. Record ID: ${att._id}`);
      console.log(`   User: ${att.userId?.fullName || 'N/A'} (${att.userId?._id})`);
      console.log(`   Class: ${att.classId?.className || 'N/A'} (${att.classId?._id})`);
      console.log(`   Session: ${att.sessionNumber || 'N/A'}`);
      console.log(`   Date: ${att.sessionDate || att.date}`);
      console.log(`   Status: ${att.isPresent ? '✓ Present' : '✗ Absent'}`);
      console.log(`   Created: ${att.createdAt}`);
    });

    // Kiểm tra duplicate records
    console.log('\n\n🔍 Checking for duplicates...');
    const pipeline = [
      {
        $group: {
          _id: {
            userId: '$userId',
            classId: '$classId',
            sessionNumber: '$sessionNumber'
          },
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ];

    const duplicates = await Attendance.aggregate(pipeline);
    
    if (duplicates.length > 0) {
      console.log(`⚠️ Found ${duplicates.length} duplicate combinations:`);
      duplicates.forEach(dup => {
        console.log(`   User: ${dup._id.userId}, Class: ${dup._id.classId}, Session: ${dup._id.sessionNumber} - Count: ${dup.count}`);
      });
    } else {
      console.log('✅ No duplicates found');
    }

    // Kiểm tra records cho user cụ thể
    console.log('\n\n👤 Checking users with attendance:');
    const users = await User.find({ role: 'user' }).select('fullName email').limit(5);
    
    for (const user of users) {
      const userAttendance = await Attendance.countDocuments({ userId: user._id });
      console.log(`   ${user.fullName}: ${userAttendance} records`);
      
      // Chi tiết nếu có attendance
      if (userAttendance > 0) {
        const userRecords = await Attendance.find({ userId: user._id })
          .populate('classId', 'className')
          .sort({ sessionDate: -1 });
        
        userRecords.forEach(rec => {
          console.log(`      - ${rec.classId?.className}: Session ${rec.sessionNumber}, ${rec.isPresent ? 'Present' : 'Absent'}, Date: ${rec.sessionDate}`);
        });
      }
    }

    mongoose.connection.close();
    console.log('\n✅ Check complete');
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
  }
};

checkAttendanceData();
