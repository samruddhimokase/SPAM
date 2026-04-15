const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Story = require('../models/Story');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const chatCount = await Chat.countDocuments();
    const messageCount = await Message.countDocuments();
    const storyCount = await Story.countDocuments();

    console.log(`--- DB STATUS ---`);
    console.log(`Users: ${userCount}`);
    console.log(`Posts: ${postCount}`);
    console.log(`Chats: ${chatCount}`);
    console.log(`Messages: ${messageCount}`);
    console.log(`Stories: ${storyCount}`);
    console.log(`-----------------`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
