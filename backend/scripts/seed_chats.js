const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

const SAMPLE_MESSAGES = [
  "Hey there! How's it going?",
  "Check out this cool new security feature!",
  "Are you joining the meeting at 3?",
  "Just saw your new post, looks great!",
  "Can you send me the documents?",
  "SocialShield is really impressive.",
  "Don't click that suspicious link!",
  "I've been learning about NLP lately.",
  "Let's catch up soon!",
  "The new update is live now."
];

const SCAM_MESSAGES = [
  "URGENT: Your account will be suspended. Click here: http://socialshield-verify.com",
  "Congratulations! You've won a $1000 prize. Reply to claim.",
  "Invest in our new crypto coin for 10x returns! Join here: http://scam-crypto.io",
  "We've detected suspicious activity on your profile. Please provide your password.",
  "Get a high-paying remote job today! No experience needed: http://fake-jobs.net"
];

async function seedChatsAndMessages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    // Clear existing chats/messages to avoid duplicates
    console.log('Cleaning existing chats and messages...');
    await Chat.deleteMany({});
    await Message.deleteMany({});

    const users = await User.find({ username: /^user_/ });
    console.log(`Found ${users.length} seeded users.`);

    if (users.length < 10) {
      console.error('Not enough users to seed chats. Please run seed_50_users.js first.');
      process.exit(1);
    }

    // Create some chats between the first 10 users and others
    console.log('Seeding chats and messages...');
    
    for (let i = 0; i < 20; i++) {
      const userA = users[Math.floor(Math.random() * users.length)];
      let userB = users[Math.floor(Math.random() * users.length)];
      
      while (userA._id.equals(userB._id)) {
        userB = users[Math.floor(Math.random() * users.length)];
      }

      const newChat = new Chat({
        participants: [userA._id, userB._id],
        isGroupChat: false,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random date in last 7 days
      });
      await newChat.save();

      // Seed 3-7 messages for each chat
      const msgCount = 3 + Math.floor(Math.random() * 5);
      let lastMsgId = null;

      for (let j = 0; j < msgCount; j++) {
        const isScam = Math.random() > 0.8;
        const msgText = isScam 
          ? SCAM_MESSAGES[Math.floor(Math.random() * SCAM_MESSAGES.length)]
          : SAMPLE_MESSAGES[Math.floor(Math.random() * SAMPLE_MESSAGES.length)];

        const newMessage = new Message({
          chat: newChat._id,
          sender: Math.random() > 0.5 ? userA._id : userB._id,
          text: msgText,
          status: 'seen',
          createdAt: new Date(newChat.createdAt.getTime() + j * 60 * 60 * 1000)
        });
        await newMessage.save();
        lastMsgId = newMessage._id;
      }

      // Update chat's last message
      newChat.lastMessage = lastMsgId;
      await newChat.save();
    }

    console.log('Successfully seeded 20 chats and related messages.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedChatsAndMessages();
