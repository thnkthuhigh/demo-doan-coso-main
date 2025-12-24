const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/gym-management')
  .then(async () => {
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\n📋 DANH SÁCH USERS:\n');
    users.forEach((u, i) => {
      console.log(`${i + 1}. Email: ${u.email}`);
      console.log(`   Username: ${u.username}`);
      console.log(`   FullName: ${u.fullName}`);
      console.log(`   Role: ${u.role}`);
      console.log('');
    });
    await mongoose.disconnect();
  });
