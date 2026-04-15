const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { detectScamMessage } = require('../utils/aiModels');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function seedFakeMessages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // 1. Get all users
    const users = await User.find({});
    if (users.length < 2) {
      console.error('Not enough users to create chats. Run seed_from_kaggle.js first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users. Clearing old chats and messages...`);
    await Chat.deleteMany({});
    await Message.deleteMany({});

    const conversations = [
      // Normal Chat
      ["Hey! How's your project going?", "It's going great! Just finishing up the UI.", "Awesome, can't wait to see it!", "Thanks! I'll send a link soon."],
      // Casual
      ["Are we meeting for coffee today?", "Yes, 4 PM at the usual place?", "Perfect, see you there!", "See ya!"],
      // Scam: OTP Request
      ["Hi, I'm from Instagram support. We need to verify your account.", "Oh, okay. How?", "We sent an OTP to your phone. Please share it here immediately.", "Wait, is this safe?", "Yes, it's urgent to prevent account suspension."],
      // Scam: Prize Claim
      ["CONGRATULATIONS! You won a $1000 Amazon gift card!", "Really??", "Yes! Just click this link to claim: http://amazon-gift-win.net/claim", "Is there any catch?", "No, just enter your login details to verify."],
      // Scam: Crypto
      ["Hey bro, check this out. I doubled my Bitcoin in 2 days!", "How is that possible?", "Using this new AI bot. Join here: http://crypto-rich-bot.io/invite", "Sounds suspicious...", "No trust me, it's 100% legit profit daily."],
      // Business
      ["Hello, I'm interested in your freelance services.", "Hi! I'd love to help. What do you need?", "I need a website for my bakery.", "Sure, let's schedule a call to discuss the details."]
    ];

    // Create 20-30 chats
    console.log('Generating 20+ chats with fake messages...');
    for (let i = 0; i < 25; i++) {
      const u1 = users[Math.floor(Math.random() * users.length)];
      let u2 = users[Math.floor(Math.random() * users.length)];
      while (u1._id.toString() === u2._id.toString()) {
        u2 = users[Math.floor(Math.random() * users.length)];
      }

      const chatStartTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const chat = new Chat({
        participants: [u1._id, u2._id],
        updatedAt: chatStartTime
      });
      await chat.save();

      const convTemplate = conversations[i % conversations.length];
      const msgsToInsert = [];

      for (let j = 0; j < convTemplate.length; j++) {
        const sender = j % 2 === 0 ? u1._id : u2._id;
        const text = convTemplate[j];
        const aiAnalysis = detectScamMessage(text);

        msgsToInsert.push({
          chat: chat._id,
          sender: sender,
          text: text,
          aiAnalysis: {
            isScam: aiAnalysis.classification === 'Scam',
            riskScore: aiAnalysis.riskScore,
            recommendation: aiAnalysis.recommendation,
            classification: aiAnalysis.classification,
            flags: aiAnalysis.flags
          },
          status: 'seen',
          createdAt: new Date(chatStartTime.getTime() + j * 60000) // Messages 1 min apart
        });
      }

      const savedMsgs = await Message.insertMany(msgsToInsert);
      const containsScam = msgsToInsert.some(m => m.aiAnalysis.isScam);
      await Chat.findByIdAndUpdate(chat._id, { 
        lastMessage: savedMsgs[savedMsgs.length - 1]._id,
        updatedAt: savedMsgs[savedMsgs.length - 1].createdAt,
        isSuspicious: containsScam
      });
    }

    console.log('Successfully seeded 25 chats with realistic AI-analyzed messages.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedFakeMessages();
