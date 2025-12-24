const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const ClassSchema = new mongoose.Schema({
  className: String,
  instructor: String,
  totalSessions: Number,
}, { timestamps: true });

const Class = mongoose.model('Class', ClassSchema);

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    await fixTotalSessions();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function fixTotalSessions() {
  try {
    // Find all classes with totalSessions > 12
    const classes = await Class.find({ totalSessions: { $gt: 12 } });
    
    console.log(`\n📊 Found ${classes.length} classes with totalSessions > 12:`);
    classes.forEach(c => {
      console.log(`   - ${c.className}: ${c.totalSessions} sessions`);
    });
    
    // Update all to 12
    const result = await Class.updateMany(
      { totalSessions: { $gt: 12 } },
      { $set: { totalSessions: 12 } }
    );
    
    console.log(`\n✅ Updated ${result.modifiedCount} classes to 12 sessions`);
    
    // Verify
    const updated = await Class.find({ className: /HIIT/i });
    console.log('\n🏋️ HIIT Class after update:');
    updated.forEach(c => {
      console.log(`   - ${c.className}: ${c.totalSessions} sessions`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixTotalSessions();
