// Check all collections in MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkCollections = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/gym-management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📚 All Collections:');
    collections.forEach((col, i) => {
      console.log(`${i + 1}. ${col.name}`);
    });
    
    // Check each collection for enrollment-related data
    console.log('\n=== ENROLLMENT COLLECTIONS ===');
    for (const col of collections) {
      if (col.name.toLowerCase().includes('enroll') || col.name.toLowerCase().includes('class')) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`📊 ${col.name}: ${count} documents`);
        
        if (count > 0 && count < 10) {
          const samples = await mongoose.connection.db.collection(col.name).find().limit(2).toArray();
          console.log('   Sample:', JSON.stringify(samples[0], null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

checkCollections();
