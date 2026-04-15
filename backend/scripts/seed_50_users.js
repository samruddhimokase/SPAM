const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

const PROVIDED_DATASET = [
  { "username": "user_1", "name": "User 1", "email": "user1@gmail.com", "phone": "9000000101", "followers": 345, "following": 210, "profilePic": "https://i.pravatar.cc/150?img=1", "bio": "Demo user 1" },
  { "username": "user_2", "name": "User 2", "email": "user2@gmail.com", "phone": "9000000102", "followers": 876, "following": 150, "profilePic": "https://i.pravatar.cc/150?img=2", "bio": "Demo user 2" },
  { "username": "user_3", "name": "User 3", "email": "user3@gmail.com", "phone": "9000000103", "followers": 120, "following": 340, "profilePic": "https://i.pravatar.cc/150?img=3", "bio": "Demo user 3" },
  { "username": "user_4", "name": "User 4", "email": "user4@gmail.com", "phone": "9000000104", "followers": 560, "following": 220, "profilePic": "https://i.pravatar.cc/150?img=4", "bio": "Demo user 4" },
  { "username": "user_5", "name": "User 5", "email": "user5@gmail.com", "phone": "9000000105", "followers": 980, "following": 410, "profilePic": "https://i.pravatar.cc/150?img=5", "bio": "Demo user 5" },
  { "username": "user_6", "name": "User 6", "email": "user6@gmail.com", "phone": "9000000106", "followers": 230, "following": 190, "profilePic": "https://i.pravatar.cc/150?img=6", "bio": "Demo user 6" },
  { "username": "user_7", "name": "User 7", "email": "user7@gmail.com", "phone": "9000000107", "followers": 760, "following": 300, "profilePic": "https://i.pravatar.cc/150?img=7", "bio": "Demo user 7" },
  { "username": "user_8", "name": "User 8", "email": "user8@gmail.com", "phone": "9000000108", "followers": 150, "following": 90, "profilePic": "https://i.pravatar.cc/150?img=8", "bio": "Demo user 8" },
  { "username": "user_9", "name": "User 9", "email": "user9@gmail.com", "phone": "9000000109", "followers": 640, "following": 280, "profilePic": "https://i.pravatar.cc/150?img=9", "bio": "Demo user 9" },
  { "username": "user_10", "name": "User 10", "email": "user10@gmail.com", "phone": "9000000110", "followers": 430, "following": 350, "profilePic": "https://i.pravatar.cc/150?img=10", "bio": "Demo user 10" }
];

async function seedUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [];

    // Add provided 10 users
    PROVIDED_DATASET.forEach((u, index) => {
      users.push({
        username: u.username,
        fullName: u.name,
        email: u.email,
        phoneNumber: u.phone,
        password: passwordHash,
        profilePicture: u.profilePic,
        bio: u.bio,
        followers: [],
        following: [],
        accountAge: Math.floor(Math.random() * 365),
        isVerified: Math.random() > 0.8,
        riskScore: Math.floor(Math.random() * 100),
        riskClassification: 'Real'
      });
    });

    // Add 40 more users to reach 50
    for (let i = 11; i <= 50; i++) {
      users.push({
        username: `user_${i}`,
        fullName: `User ${i}`,
        email: `user${i}@gmail.com`,
        phoneNumber: `9000000${100 + i}`,
        password: passwordHash,
        profilePicture: `https://i.pravatar.cc/150?img=${i}`,
        bio: `Demo user ${i}. Automatically generated profile for SocialShield simulation.`,
        followers: [],
        following: [],
        accountAge: Math.floor(Math.random() * 365),
        isVerified: Math.random() > 0.8,
        riskScore: Math.floor(Math.random() * 100),
        riskClassification: 'Real'
      });
    }

    console.log('Cleaning existing demo users...');
    await User.deleteMany({ username: /^user_/ });

    console.log('Seeding 50 users (including provided dataset)...');
    await User.insertMany(users);

    console.log('Successfully seeded 50 users.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedUsers();
