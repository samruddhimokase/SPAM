const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function renamePrimaryUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const oldUsername = 'samruddhi';
    const newUsername = 'rohit';
    const newFullName = 'Rohit';

    const user = await User.findOne({ username: oldUsername });
    if (user) {
      console.log(`Renaming ${oldUsername} to ${newUsername}...`);
      user.username = newUsername;
      user.fullName = newFullName;
      user.email = `${newUsername}@example.com`;
      await user.save();
      console.log('Primary user renamed successfully!');
    } else {
      console.log(`User ${oldUsername} not found. Checking if ${newUsername} already exists...`);
      const existing = await User.findOne({ username: newUsername });
      if (existing) {
        console.log(`User ${newUsername} already exists.`);
      } else {
        console.log('No primary user found to rename.');
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Renaming error:', err);
    process.exit(1);
  }
}

renamePrimaryUser();
