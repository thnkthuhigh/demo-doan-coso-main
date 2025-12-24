import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gym-management";

async function checkLockedStatus() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const allRecords = await Attendance.find({}).sort({ sessionDate: -1 });
    
    console.log(`📊 Total attendance records: ${allRecords.length}\n`);
    
    allRecords.forEach((record, index) => {
      console.log(`Record #${index + 1}:`);
      console.log(`  Class ID: ${record.classId}`);
      console.log(`  User ID: ${record.userId}`);
      console.log(`  Session #${record.sessionNumber}`);
      console.log(`  Date: ${record.sessionDate.toISOString().split('T')[0]}`);
      console.log(`  Present: ${record.isPresent}`);
      console.log(`  Locked: ${record.isLocked || false}`);
      console.log(`  Marked At: ${record.markedAt || 'N/A'}`);
      console.log('---');
    });

    const lockedCount = allRecords.filter(r => r.isLocked).length;
    console.log(`\n🔒 Locked records: ${lockedCount} / ${allRecords.length}`);

    await mongoose.connection.close();
    console.log("\n✅ Check completed!");
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkLockedStatus();
