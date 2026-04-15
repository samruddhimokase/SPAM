const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield');
    const users = await User.find({}, 'username fullName');
    console.log('Current users:');
    users.forEach(u => console.log(`- ${u.username} (${u.fullName})`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listUsers();
