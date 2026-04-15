const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

const humanNames = [
  { old: 'user-1', new: 'rohit', full: 'Rohit' },
  { old: 'user-2', new: 'aditya_v', full: 'Aditya Verma' },
  { old: 'user-3', new: 'neha_s', full: 'Neha Sharma' },
  { old: 'user-4', new: 'rohan_p', full: 'Rohan Patil' },
  { old: 'user-5', new: 'priya_k', full: 'Priya Kulkarni' },
  { old: 'user-6', new: 'amit_m', full: 'Amit Mishra' },
  { old: 'user-7', new: 'anita_d', full: 'Anita Deshmukh' },
  { old: 'user-8', new: 'rahul_j', full: 'Rahul Joshi' },
  { old: 'user-9', new: 'snehal_p', full: 'Snehal Pawar' },
  { old: 'user-10', new: 'vikas_g', full: 'Vikas Gupta' }
];

const randomFirstNames = ['Arjun', 'Isha', 'Kabir', 'Myra', 'Aryan', 'Kiara', 'Vivaan', 'Ananya', 'Aarav', 'Saanvi', 'Rudra', 'Zoya'];
const randomLastNames = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Malhotra', 'Kapoor', 'Reddy', 'Chopra', 'Das'];

async function renameUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // 1. Update specific top 10 users
    for (const name of humanNames) {
      const user = await User.findOne({ username: name.old });
      if (user) {
        console.log(`Renaming ${name.old} to ${name.new}...`);
        user.username = name.new;
        user.fullName = name.full;
        // Also update email to match new username
        user.email = `${name.new}@example.com`;
        await user.save();
      }
    }

    // 2. Update other 'user-N' style usernames
    const otherGenericUsers = await User.find({ username: /^user-/ });
    console.log(`Found ${otherGenericUsers.length} other generic users.`);

    for (const user of otherGenericUsers) {
      const firstName = randomFirstNames[Math.floor(Math.random() * randomFirstNames.length)];
      const lastName = randomLastNames[Math.floor(Math.random() * randomLastNames.length)];
      const newUsername = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 1000)}`;
      
      // Check if username already exists
      const existing = await User.findOne({ username: newUsername });
      if (!existing) {
        user.username = newUsername;
        user.fullName = `${firstName} ${lastName}`;
        user.email = `${newUsername}@example.com`;
        await user.save();
      }
    }

    console.log('Successfully renamed generic users to human names!');
    process.exit(0);
  } catch (err) {
    console.error('Renaming error:', err);
    process.exit(1);
  }
}

renameUsers();
