const mongoose = require('mongoose');
const User = require('../models/User');
const Story = require('../models/Story');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function checkStories() {
  try {
    await mongoose.connect(MONGODB_URI);
    const stories = await Story.find().populate('user');
    
    console.log(`--- STORY DETAILS ---`);
    stories.forEach(s => {
      console.log(`Story ID: ${s._id}`);
      console.log(`User: ${s.user?.username || 'Unknown'}`);
      console.log(`CreatedAt: ${s.createdAt}`);
      console.log(`Is Older Than 24h: ${new Date(s.createdAt) < new Date(Date.now() - 24 * 60 * 60 * 1000)}`);
      console.log(`-------------------`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStories();
