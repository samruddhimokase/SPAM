const mongoose = require('mongoose');
const User = require('../models/User');

async function initDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/socialshield');
    console.log('Connected to MongoDB');
    
    const result1 = await User.updateMany({ followers: { $exists: false } }, { $set: { followers: [] } });
    const result2 = await User.updateMany({ following: { $exists: false } }, { $set: { following: [] } });
    
    console.log(`Initialized followers for ${result1.modifiedCount} users`);
    console.log(`Initialized following for ${result2.modifiedCount} users`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

initDB();
