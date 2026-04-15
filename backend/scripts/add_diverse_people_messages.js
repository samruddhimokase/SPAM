const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { detectScamMessage } = require('../utils/aiModels');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function seedDiverseMessages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const user1 = await User.findOne({ username: 'rohit' });
    if (!user1) {
      console.error('User rohit not found. Please ensure the main user exists.');
      process.exit(1);
    }

    const specialUsers = [
      {
        username: 'meta_ai',
        fullName: 'Meta AI',
        profilePicture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1280px-Meta_Platforms_Inc._logo.svg.png',
        isVerified: true,
        riskScore: 0,
        riskClassification: 'Real',
        bio: 'I\'m your AI assistant. How can I help you today?',
        phoneNumber: '0000000001'
      },
      {
        username: 'cristiano',
        fullName: 'Cristiano Ronaldo',
        profilePicture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6A6R_f9v8f3v4f5v6f7v8f9v0f1v2f3v4f5&s',
        isVerified: true,
        riskScore: 5,
        riskClassification: 'Real',
        bio: 'SIUUUUU! Official Instagram account of Cristiano Ronaldo.',
        phoneNumber: '0000000002'
      },
      {
        username: 'crypto_king_99',
        fullName: 'Crypto King 🚀',
        profilePicture: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&h=400&fit=crop',
        isVerified: false,
        riskScore: 85,
        riskClassification: 'Likely Fake',
        bio: 'DM for 10x returns! 💰 Bitcoin & Forex specialist. 📈',
        phoneNumber: '0000000003'
      },
      {
        username: 'tech_support_official',
        fullName: 'Instagram Support',
        profilePicture: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1024px-Instagram_icon.png',
        isVerified: false,
        riskScore: 95,
        riskClassification: 'Likely Fake',
        bio: 'Official Support Channel for Account Verification.',
        phoneNumber: '0000000004'
      },
      {
        username: 'fitness_freak_sarah',
        fullName: 'Sarah Miller',
        profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        isVerified: true,
        riskScore: 10,
        riskClassification: 'Real',
        bio: 'Fitness Coach | Yoga | Healthy Lifestyle 🧘‍♀️',
        phoneNumber: '0000000005'
      }
    ];

    console.log('Adding special personas...');
    const personaIds = [];
    for (const persona of specialUsers) {
      let user = await User.findOne({ username: persona.username });
      if (!user) {
        user = new User({
          ...persona,
          email: `${persona.username}@example.com`,
          password: 'password123'
        });
        await user.save();
      } else {
        // Update existing user to match persona
        Object.assign(user, persona);
        await user.save();
      }
      personaIds.push(user);
    }

    const chatTemplates = [
      {
        persona: 'meta_ai',
        messages: [
          { text: 'Hi! I can help you write captions, generate images, or just chat. What\'s on your mind?', sender: 'other' },
          { text: 'Can you help me write a caption for a beach photo?', sender: 'me' },
          { text: 'Sure! How about: "Salt in the air, sand in my hair. 🌊✨" or "Beach days are the best days. 🏖️"', sender: 'other' }
        ]
      },
      {
        persona: 'cristiano',
        messages: [
          { text: 'Great game tonight! Keep working hard.', sender: 'other' },
          { text: 'Thanks legend! You are the GOAT 🐐', sender: 'me' },
          { text: 'Appreciate the support. See you soon!', sender: 'other' }
        ]
      },
      {
        persona: 'crypto_king_99',
        messages: [
          { text: 'Hey bro! I saw your profile. Are you interested in making $5000 a week with crypto?', sender: 'other' },
          { text: 'How does it work?', sender: 'me' },
          { text: 'Just send 0.1 BTC to my wallet and I will double it for you in 24 hours! No risk! 🚀💰', sender: 'other' },
          { text: 'Wait, that sounds like a scam.', sender: 'me' },
          { text: 'Trust me, I have 10k followers. It\'s a limited time offer! Act fast! ⏳', sender: 'other' }
        ]
      },
      {
        persona: 'tech_support_official',
        messages: [
          { text: 'Your account has been reported for copyright violation. To avoid suspension, please verify your identity.', sender: 'other' },
          { text: 'Oh no, what do I need to do?', sender: 'me' },
          { text: 'Please send your one-time password (OTP) and login details to this chat immediately for verification.', sender: 'other' }
        ]
      },
      {
        persona: 'fitness_freak_sarah',
        messages: [
          { text: 'Hey! Loved your recent workout post. Would you like to join our community challenge?', sender: 'other' },
          { text: 'Sure, Sarah! What are the details?', sender: 'me' },
          { text: 'It\'s a 30-day yoga challenge. I\'ll send you the link to the private group! 🧘‍♀️', sender: 'other' }
        ]
      }
    ];

    console.log('Creating diverse chats...');
    for (const template of chatTemplates) {
      const persona = personaIds.find(p => p.username === template.persona);
      
      // Create or find chat
      let chat = await Chat.findOne({
        participants: { $all: [user1._id, persona._id] }
      });

      if (!chat) {
        chat = new Chat({
          participants: [user1._id, persona._id],
          updatedAt: new Date()
        });
        await chat.save();
      }

      const messagesToSave = [];
      for (let i = 0; i < template.messages.length; i++) {
        const msgData = template.messages[i];
        const sender = msgData.sender === 'me' ? user1._id : persona._id;
        const ai = detectScamMessage(msgData.text);

        messagesToSave.push({
          chat: chat._id,
          sender: sender,
          text: msgData.text,
          aiAnalysis: {
            isScam: ai.classification === 'Scam',
            riskScore: ai.riskScore,
            recommendation: ai.recommendation,
            classification: ai.classification,
            flags: ai.flags
          },
          status: 'seen',
          createdAt: new Date(Date.now() - (template.messages.length - i) * 60000) // minutes apart
        });
      }

      // Delete old messages in this specific chat to refresh it
      await Message.deleteMany({ chat: chat._id });
      
      const savedMsgs = await Message.insertMany(messagesToSave);
      const lastMsg = savedMsgs[savedMsgs.length - 1];
      const isSuspicious = messagesToSave.some(m => m.aiAnalysis.isScam);

      await Chat.findByIdAndUpdate(chat._id, {
        lastMessage: lastMsg._id,
        updatedAt: lastMsg.createdAt,
        isSuspicious: isSuspicious
      });
    }

    console.log('Successfully added diverse people and messages!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDiverseMessages();
