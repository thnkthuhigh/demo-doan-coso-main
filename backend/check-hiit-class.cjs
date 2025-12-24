const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Define schemas directly to avoid loading server code
const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  sessionNumber: Number,
  sessionDate: Date,
  isPresent: Boolean,
}, { timestamps: true });

const ClassSchema = new mongoose.Schema({
  className: String,
  instructor: String,
  totalSessions: Number,
  schedule: String,
  duration: String,
}, { timestamps: true });

const ClassEnrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', AttendanceSchema);
const Class = mongoose.model('Class', ClassSchema);
const ClassEnrollment = mongoose.model('ClassEnrollment', ClassEnrollmentSchema);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function checkHIITClass() {
  try {
    // Find HIIT class
    const hiitClass = await Class.findOne({ className: /HIIT/i });
    
    if (!hiitClass) {
      console.log('❌ HIIT class not found');
      return;
    }
    
    console.log('\n🏋️ HIIT Class Details:');
    console.log('   ID:', hiitClass._id);
    console.log('   Name:', hiitClass.className);
    console.log('   Instructor:', hiitClass.instructor);
    console.log('   Total Sessions:', hiitClass.totalSessions);
    console.log('   Schedule:', hiitClass.schedule);
    console.log('   Duration:', hiitClass.duration);
    
    // Find all attendance records for this class
    const allAttendance = await Attendance.find({ classId: hiitClass._id })
      .sort({ sessionNumber: 1 });
    
    console.log('\n📊 Total Attendance Records:', allAttendance.length);
    
    // Group by session number
    const bySession = {};
    allAttendance.forEach(record => {
      const session = record.sessionNumber;
      if (!bySession[session]) {
        bySession[session] = [];
      }
      bySession[session].push(record);
    });
    
    console.log('\n📋 Attendance by Session:');
    Object.keys(bySession).sort((a, b) => a - b).forEach(session => {
      const records = bySession[session];
      console.log(`\n   Session ${session} (${records[0].sessionDate.toISOString().split('T')[0]}):`);
      console.log(`   Date: ${records[0].sessionDate}`);
      
      records.forEach(r => {
        const status = r.isPresent ? '✓ Present' : '✗ Absent';
        console.log(`      - User ${r.userId}: ${status}`);
      });
    });
    
    // Find enrollments for this class
    const enrollments = await ClassEnrollment.find({ classId: hiitClass._id });
    
    console.log('\n👥 Enrolled Students:', enrollments.length);
    
    // Find user "Uyển Nhi" attendance specifically
    const uyenNhi = await mongoose.connection.db.collection('users').findOne({
      $or: [
        { name: /Uyển Nhi/i },
        { email: /user3/i }
      ]
    });
    
    if (uyenNhi) {
      console.log('\n👤 Uyển Nhi Attendance in HIIT:');
      const userAttendance = allAttendance.filter(a => 
        a.userId && a.userId.toString() === uyenNhi._id.toString()
      );
      
      console.log(`   Total records: ${userAttendance.length}`);
      userAttendance.forEach(r => {
        const status = r.isPresent ? '✓ Present' : '✗ Absent';
        console.log(`   Session ${r.sessionNumber}: ${status} - ${r.sessionDate}`);
      });
    }
    
    console.log('\n✅ Check complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkHIITClass();
