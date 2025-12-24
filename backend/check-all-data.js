// Check all data in MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkAllData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/gym-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📊 TỔNG QUAN DATABASE:');
    console.log('='.repeat(60));
    
    let totalDocs = 0;
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      totalDocs += count;
      const status = count === 0 ? '❌ TRỐNG' : '✅ CÓ DỮ LIỆU';
      console.log(`${status} ${col.name.padEnd(25)} : ${count.toString().padStart(6)} documents`);
    }
    
    console.log('='.repeat(60));
    console.log(`📈 TỔNG SỐ DOCUMENTS: ${totalDocs}`);
    
    if (totalDocs === 0) {
      console.log('\n⚠️  DATABASE HOÀN TOÀN TRỐNG - ĐÃ BỊ RESET!');
    } else {
      console.log('\n✅ Database còn dữ liệu');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

checkAllData();
