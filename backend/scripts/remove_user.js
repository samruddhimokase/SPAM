const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

async function removeUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield');
    const username = '_samruddhi.__07';
    const result = await User.deleteOne({ username });
    console.log(`Delete result for ${username}:`, result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

removeUser();
