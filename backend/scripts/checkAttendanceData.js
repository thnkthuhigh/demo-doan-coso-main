import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from '../models/Attendance.js';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const records = await Attendance.find({}).limit(5).lean();
    
    console.log('\n📊 Sample attendance records:');
    console.log('Total records:', await Attendance.countDocuments());
    console.log('');
    
    records.forEach((r, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  _id: ${r._id}`);
      console.log(`  classId: ${r.classId}`);
      console.log(`  userId: ${r.userId}`);
      console.log(`  sessionNumber: ${r.sessionNumber}`);
      console.log(`  sessionDate: ${r.sessionDate}`);
      console.log(`  isPresent: ${r.isPresent}`);
      console.log(`  isLocked: ${r.isLocked}`);
      console.log(`  markedAt: ${r.markedAt}`);
      console.log('');
    });
    
    // Check if any records missing sessionDate
    const missingDate = await Attendance.countDocuments({ sessionDate: { $exists: false } });
    console.log(`⚠️  Records missing sessionDate: ${missingDate}`);
    
    const missingLocked = await Attendance.countDocuments({ isLocked: { $exists: false } });
    console.log(`⚠️  Records missing isLocked: ${missingLocked}`);
    
    mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();
