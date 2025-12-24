import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym-management';

// Define Attendance schema inline
const attendanceSchema = new mongoose.Schema({
  classId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  sessionNumber: Number,
  sessionDate: Date,
  isPresent: Boolean,
  checkinTime: Date,
  notes: String,
  isLocked: Boolean,
  markedAt: Date,
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

async function addIsLockedField() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update tất cả attendance records để thêm field isLocked và markedAt
    const result = await Attendance.updateMany(
      { isLocked: { $exists: false } }, // Chỉ update những record chưa có field isLocked
      { 
        $set: { 
          isLocked: false,
          markedAt: null
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} attendance records`);
    console.log('Done!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addIsLockedField();
