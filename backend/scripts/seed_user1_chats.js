const mongoose = require('mongoose');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

async function seedUser1Chats() {
  try {
    await mongoose.connect('mongodb://localhost:27017/socialshield');
    console.log('Connected to MongoDB');

    const user1 = await User.findOne({ username: 'user1' });
    if (!user1) {
      console.error('User1 not found');
      process.exit(1);
    }

    // Seed chats with users 3 to 15
    for (let i = 3; i <= 15; i++) {
      const otherUser = await User.findOne({ username: `user${i}` });
      if (!otherUser) continue;

      // Check if chat already exists
      let chat = await Chat.findOne({
        participants: { $all: [user1._id, otherUser._id] }
      });

      if (!chat) {
        chat = new Chat({
          participants: [user1._id, otherUser._id],
          updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
        await chat.save();
        console.log(`Created chat with ${otherUser.username}`);
      }

      // Seed 1-3 messages for each chat
      const msgCount = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < msgCount; j++) {
        const text = [
          "Hey! How's it going?",
          "Are you coming to the event tomorrow?",
          "I saw your new post, looks great!",
          "Can you share the details?",
          "SocialShield is awesome!"
        ][Math.floor(Math.random() * 5)];

        const newMessage = new Message({
          chat: chat._id,
          sender: otherUser._id,
          text: text,
          status: 'delivered',
          createdAt: new Date(chat.updatedAt.getTime() + j * 60 * 60 * 1000)
        });
        await newMessage.save();
        chat.lastMessage = newMessage._id;
      }
      await chat.save();
    }

    console.log('Successfully seeded more chats for user1');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedUser1Chats();
