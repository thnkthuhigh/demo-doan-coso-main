import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Class from '../models/Class.js';
import User from '../models/User.js';

dotenv.config({ path: './backend/.env' });

const revertInstructor = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Revert YOGA 2 về instructor ban đầu (user "da")
    const originalInstructorId = '6937200d7bb4aac99bed3a76'; // user "da" với role trainer
    
    const yoga2 = await Class.findOneAndUpdate(
      { className: 'YOGA 2' },
      { 
        instructor: new mongoose.Types.ObjectId(originalInstructorId),
        instructorName: 'da'
      },
      { new: true }
    ).populate('instructor', 'fullName username role');

    if (yoga2) {
      console.log('✅ Reverted YOGA 2 về instructor ban đầu:');
      console.log('   Class:', yoga2.className);
      console.log('   Instructor Username:', yoga2.instructor.username);
      console.log('   Instructor Role:', yoga2.instructor.role);
      console.log('   Instructor ID:', yoga2.instructor._id);
    }

    console.log('\n✅ Revert completed!');
    console.log('\n📱 BÂY GIỜ TRONG APP (với tài khoản bạn đang dùng):');
    console.log('1. Reload app');
    console.log('2. Vào "Quản lý lớp học" sẽ thấy YOGA 2');
    console.log('3. Middleware đã support cả "trainer" và "instructor" role');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

revertInstructor();
