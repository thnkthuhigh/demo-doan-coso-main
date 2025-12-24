import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Class from '../models/Class.js';
import ClassEnrollment from '../models/ClassEnrollment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env từ backend directory
dotenv.config({ path: join(__dirname, '../.env') });

const syncCurrentMembers = async () => {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy tất cả các lớp
    const classes = await Class.find({});
    console.log(`\n📋 Found ${classes.length} classes`);

    for (const classItem of classes) {
      // Đếm số enrollment đã thanh toán
      const paidCount = await ClassEnrollment.countDocuments({
        class: classItem._id,
        paymentStatus: true
      });

      const oldCount = classItem.currentMembers;
      
      // Cập nhật currentMembers
      classItem.currentMembers = paidCount;
      await classItem.save();

      console.log(`\n✅ ${classItem.className}:`);
      console.log(`   Old: ${oldCount} → New: ${paidCount}`);
    }

    console.log('\n✅ Sync completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

syncCurrentMembers();
