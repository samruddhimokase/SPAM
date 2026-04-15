const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { detectScamMessage } = require('../utils/aiModels');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function seedBulkMessages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const user1 = await User.findOne({ username: 'rohit' });
    if (!user1) {
      console.error('User rohit not found.');
      process.exit(1);
    }

    const allUsers = await User.find({ _id: { $ne: user1._id } });
    console.log(`Found ${allUsers.length} potential participants.`);

    const randomTemplates = [
      ["Hey!", "Hi, how are you?", "Doing good, you?", "Same here!"],
      ["Did you check out the new reel?", "Not yet, link?", "Sending it now...", "Cool, thanks!"],
      ["Are we meeting today?", "Yeah, at 5?", "Sounds good.", "See you there!"],
      ["Can you send me the photos from yesterday?", "Sure, give me a sec.", "Received them, thanks!", "You're welcome!"],
      ["Happy Birthday!", "Thank you so much!", "Hope you have a great day!", "Thanks, appreciate it!"],
      ["Nice profile pic!", "Thanks, just changed it.", "Where was it taken?", "In Bali last summer."],
      ["What's the homework for tomorrow?", "Math exercises 1 to 10.", "Thanks, was totally lost.", "No worries!"],
      ["Do you want to go for a run tomorrow?", "I'm busy in the morning, how about evening?", "Evening works for me too.", "Great, let's meet at the park at 6."]
    ];

    console.log('Adding 25 more random chats...');
    for (let i = 0; i < 25; i++) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      
      let chat = await Chat.findOne({
        participants: { $all: [user1._id, randomUser._id] }
      });

      if (!chat) {
        chat = new Chat({
          participants: [user1._id, randomUser._id],
          updatedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000) // Random time in last 10 days
        });
        await chat.save();
      }

      const template = randomTemplates[Math.floor(Math.random() * randomTemplates.length)];
      const messagesToSave = [];
      
      for (let j = 0; j < template.length; j++) {
        const sender = j % 2 === 0 ? randomUser._id : user1._id;
        const ai = detectScamMessage(template[j]);

        messagesToSave.push({
          chat: chat._id,
          sender: sender,
          text: template[j],
          aiAnalysis: {
            isScam: ai.classification === 'Scam',
            riskScore: ai.riskScore,
            recommendation: ai.recommendation,
            classification: ai.classification,
            flags: ai.flags
          },
          status: 'seen',
          createdAt: new Date(chat.updatedAt.getTime() + j * 60000)
        });
      }

      const savedMsgs = await Message.insertMany(messagesToSave);
      const lastMsg = savedMsgs[savedMsgs.length - 1];
      
      await Chat.findByIdAndUpdate(chat._id, {
        lastMessage: lastMsg._id,
        updatedAt: lastMsg.createdAt
      });
    }

    console.log('Successfully added 25 more random chats!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedBulkMessages();
