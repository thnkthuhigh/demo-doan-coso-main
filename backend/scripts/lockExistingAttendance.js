import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gym-management";

async function lockExistingAttendance() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n📊 Finding attendance records that need to be locked...");
    
    // Tìm tất cả attendance records đã được điểm danh nhưng chưa khóa
    const recordsToLock = await Attendance.find({
      $or: [
        { isPresent: true },  // Đã đánh dấu có mặt
        { isPresent: false, checkinTime: { $ne: null } }, // Đã có thời gian checkin
      ],
      isLocked: { $ne: true } // Chưa bị khóa
    });

    console.log(`📝 Found ${recordsToLock.length} records to lock`);

    if (recordsToLock.length === 0) {
      console.log("✅ All attendance records are already locked!");
      await mongoose.connection.close();
      return;
    }

    // Hiển thị một số records để xem
    console.log("\n📋 Sample records to be locked:");
    recordsToLock.slice(0, 5).forEach((record, index) => {
      console.log(`   ${index + 1}. ClassId: ${record.classId}, UserId: ${record.userId}, Session: ${record.sessionNumber}, Present: ${record.isPresent}`);
    });

    console.log("\n🔒 Locking attendance records...");
    
    // Cập nhật tất cả records
    const result = await Attendance.updateMany(
      {
        $or: [
          { isPresent: true },
          { isPresent: false, checkinTime: { $ne: null } },
        ],
        isLocked: { $ne: true }
      },
      {
        $set: {
          isLocked: true,
          markedAt: new Date() // Set thời gian khóa
        }
      }
    );

    console.log(`\n✅ Successfully locked ${result.modifiedCount} attendance records!`);
    console.log(`   Matched: ${result.matchedCount}`);
    console.log(`   Modified: ${result.modifiedCount}`);

    // Verify
    const lockedCount = await Attendance.countDocuments({ isLocked: true });
    const totalCount = await Attendance.countDocuments();
    console.log(`\n📊 Final Status:`);
    console.log(`   Total attendance records: ${totalCount}`);
    console.log(`   Locked records: ${lockedCount}`);
    console.log(`   Unlocked records: ${totalCount - lockedCount}`);

    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    console.log("✅ Migration completed successfully!");

  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
lockExistingAttendance();
