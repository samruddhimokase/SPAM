const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { detectScamMessage } = require('../utils/aiModels');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function seedMoreMessages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const users = await User.find({});
    if (users.length < 10) {
      console.error('Not enough users. Please run seed_100_unique_users.js first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users. Adding 50 more chats for rohit...`);

    const user1 = await User.findOne({ username: 'rohit' });
    if (!user1) {
      console.error('User rohit not found.');
      process.exit(1);
    }

    const templates = [
      ["Hey, did you see the new post?", "Which one?", "The one about AI security.", "Oh yeah, it was very informative!"],
      ["Can you help me with my assignment?", "Sure, what's the topic?", "It's about React hooks.", "I can definitely help with that. When are you free?"],
      ["Are you coming to the party tonight?", "I'm not sure yet. Who else is coming?", "Almost everyone from the team.", "Okay, I'll try to be there by 9."],
      ["URGENT: Your account will be locked.", "What? Why?", "Click this link to verify now: http://secure-verify-shield.com", "This looks like a scam.", "No, it's official support. Do it now!"],
      ["Hello! You've been selected for a remote job.", "I'm interested. What's the pay?", "$50/hour. Just pay $10 for registration here.", "Wait, why do I have to pay?", "It's for the background check."],
      ["Hi, I love your photography!", "Thank you so much!", "Do you do professional shoots?", "Yes, I do. You can check my portfolio in bio."],
      ["Nice reel!", "Thanks! I spent hours editing it.", "It shows! The transitions are smooth.", "Appreciate it!"],
      ["Bro, I found a way to get free followers.", "Really? How?", "Just enter your password on this site: http://free-followers-inst.net", "That's definitely a phishing site.", "No, my friend used it and it works!"]
    ];

    for (let i = 0; i < 50; i++) {
      const u1 = user1;
      let u2 = users[Math.floor(Math.random() * users.length)];
      while (u1._id.toString() === u2._id.toString()) {
        u2 = users[Math.floor(Math.random() * users.length)];
      }

      // Check if chat already exists
      let chat = await Chat.findOne({
        participants: { $all: [u1._id, u2._id] }
      });

      if (!chat) {
        chat = new Chat({
          participants: [u1._id, u2._id],
          updatedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
        });
        await chat.save();
      }

      const conv = templates[Math.floor(Math.random() * templates.length)];
      const msgs = [];

      for (let j = 0; j < conv.length; j++) {
        const sender = j % 2 === 0 ? u2._id : u1._id; // Alternate sender, user1 is usually recipient of first msg
        const text = conv[j];
        const ai = detectScamMessage(text);

        msgs.push({
          chat: chat._id,
          sender: sender,
          text: text,
          aiAnalysis: {
            isScam: ai.classification === 'Scam',
            riskScore: ai.riskScore,
            recommendation: ai.recommendation,
            classification: ai.classification,
            flags: ai.flags
          },
          status: 'seen',
          createdAt: new Date(chat.updatedAt.getTime() + j * 120000) // 2 mins apart
        });
      }

      const saved = await Message.insertMany(msgs);
      const isSuspicious = msgs.some(m => m.aiAnalysis.isScam);
      
      await Chat.findByIdAndUpdate(chat._id, {
        lastMessage: saved[saved.length - 1]._id,
        updatedAt: saved[saved.length - 1].createdAt,
        isSuspicious: isSuspicious
      });
    }

    console.log('Successfully added 50 more chats for user1 with interactive messages.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedMoreMessages();
