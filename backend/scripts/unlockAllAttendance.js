import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gym-management";

async function unlockAllAttendance() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n🔓 Unlocking all attendance records...");
    
    // Cập nhật tất cả records - bỏ lock
    const result = await Attendance.updateMany(
      { isLocked: true },
      {
        $set: {
          isLocked: false
        },
        $unset: {
          markedAt: "" // Xóa field markedAt
        }
      }
    );

    console.log(`\n✅ Successfully unlocked ${result.modifiedCount} attendance records!`);
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
    console.log("✅ Unlock completed successfully!");

  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
unlockAllAttendance();
