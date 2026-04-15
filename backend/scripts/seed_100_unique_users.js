const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function seed100Users() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // 1. Clear existing users (Optional - but helps ensure no duplicates for this demo)
    // console.log('Clearing existing users...');
    // await User.deleteMany({});

    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [];

    console.log('Generating 100 unique users...');
    for (let i = 1; i <= 100; i++) {
      const username = `user_shield_${i}`;
      
      // Check if user already exists
      const existing = await User.findOne({ username });
      if (existing) continue;

      users.push({
        username,
        fullName: `Shield User ${i}`,
        email: `${username}@socialshield.ai`,
        password: passwordHash,
        profilePicture: `https://i.pravatar.cc/150?u=${username}`,
        bio: `Secure profile #${i} protected by SocialShield AI.`,
        phoneNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        isVerified: i <= 10,
        riskScore: Math.floor(Math.random() * 20),
        riskClassification: 'Real',
        followers: [],
        following: []
      });
    }

    if (users.length > 0) {
      await User.insertMany(users);
      console.log(`Successfully added ${users.length} new unique users.`);
    } else {
      console.log('No new users to add.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed100Users();
