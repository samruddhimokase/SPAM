const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function boostStats() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const user1 = await User.findOne({ username: 'rohit' });
    if (!user1) {
      console.error('User rohit not found.');
      process.exit(1);
    }

    const allOtherUsers = await User.find({ _id: { $ne: user1._id } });
    console.log(`Found ${allOtherUsers.length} other users.`);

    // Shuffle and pick 100 followers
    const followers = allOtherUsers.sort(() => 0.5 - Math.random()).slice(0, 100).map(u => u._id);
    
    // Shuffle and pick 50 following
    const following = allOtherUsers.sort(() => 0.5 - Math.random()).slice(0, 50).map(u => u._id);

    await User.findByIdAndUpdate(user1._id, {
      followers: followers,
      following: following
    });

    // Also make some of them follow user1 back
    for (const followerId of followers) {
      await User.findByIdAndUpdate(followerId, {
        $addToSet: { following: user1._id }
      });
    }

    console.log(`Successfully boosted User-1: ${followers.length} followers and ${following.length} following!`);
    process.exit(0);
  } catch (err) {
    console.error('Error boosting stats:', err);
    process.exit(1);
  }
}

boostStats();
