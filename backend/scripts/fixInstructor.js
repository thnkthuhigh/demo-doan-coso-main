import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Class from '../models/Class.js';

dotenv.config({ path: './backend/.env' });

const fixInstructor = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Update user "Đào Nguyễn Uyển Nghi" to instructor
    const correctUserId = '693d7eb51c6c0464c713937f';
    
    const user = await User.findByIdAndUpdate(
      correctUserId,
      { role: 'instructor' },
      { new: true }
    );
    
    if (user) {
      console.log('✅ Updated user to instructor:');
      console.log('   ID:', user._id);
      console.log('   Name:', user.fullName);
      console.log('   Role:', user.role);
      console.log('');
    }

    // Update YOGA 2 instructor
    const yoga2 = await Class.findOneAndUpdate(
      { className: 'YOGA 2' },
      { 
        instructor: new mongoose.Types.ObjectId(correctUserId),
        instructorName: 'Đào Nguyễn Uyển Nghi'
      },
      { new: true }
    ).populate('instructor', 'fullName username role');

    if (yoga2) {
      console.log('✅ Updated YOGA 2:');
      console.log('   Class:', yoga2.className);
      console.log('   Instructor:', yoga2.instructor.fullName);
      console.log('   Instructor Role:', yoga2.instructor.role);
      console.log('   Instructor ID:', yoga2.instructor._id);
    }

    console.log('\n✅ All updates completed!');
    console.log('\n📱 BÂY GIỜ TRONG APP:');
    console.log('1. LOGOUT');
    console.log('2. LOGIN lại bằng account "Đào Nguyễn Uyển Nghi"');
    console.log('3. Vào "Quản lý lớp học" sẽ thấy YOGA 2');
    console.log('4. Vào "Lịch dạy" sẽ thấy lịch dạy YOGA 2');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixInstructor();
