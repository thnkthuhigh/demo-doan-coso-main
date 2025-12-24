// Script to check enrollments in MongoDB
// Run: node backend/check-enrollments.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkEnrollments = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/gym-management';
    console.log('📍 MongoDB URI:', mongoUri.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const ClassEnrollment = mongoose.model('ClassEnrollment', new mongoose.Schema({}, { strict: false }));
    const Class = mongoose.model('Class', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Get all classes
    const classes = await Class.find().select('_id className instructor');
    console.log('📚 Total classes:', classes.length);
    console.log('\n=== CLASSES ===');
    classes.forEach((cls, index) => {
      console.log(`${index + 1}. ${cls.className} (ID: ${cls._id})`);
      console.log(`   Instructor: ${cls.instructor}`);
    });

    console.log('\n=== CHECKING ENROLLMENTS ===');
    
    for (const cls of classes) {
      console.log(`\n📖 Class: ${cls.className} (${cls._id})`);
      
      const enrollments = await ClassEnrollment.find({ classId: cls._id });
      console.log(`   Total enrollments: ${enrollments.length}`);
      
      if (enrollments.length > 0) {
        const paidEnrollments = enrollments.filter(e => e.paymentStatus === 'paid');
        console.log(`   Paid enrollments: ${paidEnrollments.length}`);
        
        for (const enrollment of enrollments) {
          console.log(`\n   📝 Enrollment ${enrollment._id}:`);
          console.log(`      - User ID: ${enrollment.userId}`);
          console.log(`      - Payment Status: ${enrollment.paymentStatus}`);
          console.log(`      - Status: ${enrollment.status}`);
          
          if (enrollment.userId) {
            const user = await User.findById(enrollment.userId).select('fullName email role');
            if (user) {
              console.log(`      - User: ${user.fullName} (${user.email})`);
              console.log(`      - Role: ${user.role}`);
            } else {
              console.log(`      ⚠️  User not found!`);
            }
          }
        }
      } else {
        console.log(`   ⚠️  No enrollments found`);
      }
    }

    console.log('\n=== RECOMMENDATIONS ===');
    console.log('1. Make sure enrollments have paymentStatus = "paid"');
    console.log('2. Ensure userId field points to valid User documents');
    console.log('3. Check that the trainer is assigned to the class (instructor field)');
    
    console.log('\n=== QUICK FIX SCRIPT ===');
    console.log('To set all enrollments to paid status, run in MongoDB:');
    console.log('db.classenrollments.updateMany({}, { $set: { paymentStatus: "paid" } })');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

checkEnrollments();
