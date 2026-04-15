const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function randomizeAllFollowers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} total users.`);

    // Clear existing followers/following for a fresh start (optional, but ensures clean random data)
    // await User.updateMany({}, { followers: [], following: [] });

    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      
      // Determine a random number of people this user follows (e.g., between 5 and 50)
      const followCount = Math.floor(Math.random() * 45) + 5;
      
      // Pick random users to follow
      const randomFollowing = allUsers
        .filter(u => u._id.toString() !== user._id.toString())
        .sort(() => 0.5 - Math.random())
        .slice(0, followCount);

      const followingIds = randomFollowing.map(u => u._id);

      // Update this user's 'following' list
      await User.findByIdAndUpdate(user._id, { following: followingIds });

      // For each user they follow, add this user to their 'followers' list
      for (const followedId of followingIds) {
        await User.findByIdAndUpdate(followedId, {
          $addToSet: { followers: user._id }
        });
      }

      if ((i + 1) % 100 === 0) {
        console.log(`Processed ${i + 1} users...`);
      }
    }

    console.log('Successfully randomized all followers and following for all users!');
    process.exit(0);
  } catch (err) {
    console.error('Error randomizing followers:', err);
    process.exit(1);
  }
}

randomizeAllFollowers();
