const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Post = require('../models/Post');
const Story = require('../models/Story');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // 1. Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Story.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});

    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [];

    // 2. Seed Users (u1 -> u100)
    console.log('Seeding 100 users...');
    for (let i = 1; i <= 100; i++) {
      const isScammer = i % 15 === 0;
      users.push({
        _id: new mongoose.Types.ObjectId(),
        username: `user${i}`,
        fullName: `User ${i}`,
        email: `user${i}@example.com`,
        password: passwordHash,
        profilePicture: `https://i.pravatar.cc/150?u=user${i}`,
        bio: i <= 10 ? "Social media security expert 🛡️" : isScammer ? "Get rich quick! DM me for details 💰" : `Digital nomad | Traveling the world 🌍 user${i}`,
        phoneNumber: `9000000${100 + i}`,
        isVerified: i <= 10,
        accountAge: Math.floor(Math.random() * 365),
        riskScore: isScammer ? 85 : Math.floor(Math.random() * 20),
        riskClassification: isScammer ? 'Scam' : 'Real'
      });
    }
    const savedUsers = await User.insertMany(users);
    const userMap = {};
    const userIdList = [];
    savedUsers.forEach(u => { 
      userMap[u.username] = u._id; 
      userIdList.push(u._id);
    });

    // 3. Seed Follows
    console.log('Seeding follow relationships...');
    for (const user of savedUsers) {
      // Each user follows 5-10 random people
      const numFollows = 5 + Math.floor(Math.random() * 6);
      const shuffled = [...userIdList].sort(() => 0.5 - Math.random());
      const followingIds = shuffled.slice(0, numFollows).filter(id => id.toString() !== user._id.toString());
      
      user.following = followingIds;
      await user.save();
      
      // Update followers for those people
      for (const targetId of followingIds) {
        await User.findByIdAndUpdate(targetId, { $addToSet: { followers: user._id } });
      }
    }

    // 4. Seed Reels & Posts
    console.log('Seeding reels and posts...');
    const reels = [
      {
        user: userIdList[0],
        type: 'reel',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        imageUrl: 'https://picsum.photos/400/600?1',
        caption: 'Security alert: Always use 2FA! 🛡️ #security #socialshield',
        likes: userIdList.slice(1, 5),
        likeCount: 4,
        createdAt: new Date('2026-03-01')
      },
      {
        user: userIdList[14], // Scammer
        type: 'post',
        imageUrl: 'https://picsum.photos/800/800?2',
        caption: 'CONGRATULATIONS! You won $10,000! Click link in bio to claim! 🎁💸',
        likes: [],
        likeCount: 0,
        isSuspicious: true,
        aiAnalysis: { classification: 'Scam', riskScore: 95, flags: ['Monetary lure', 'Urgency'] },
        createdAt: new Date('2026-03-05')
      }
    ];

    // Add 100+ more diverse posts and reels
    const videoUrls = [
      'https://www.w3schools.com/html/mov_bbb.mp4',
      'https://www.w3schools.com/html/movie.mp4',
      'https://media.w3.org/2010/05/sintel/trailer.mp4',
      'https://media.w3.org/2010/05/bunny/trailer.mp4',
      'https://vjs.zencdn.net/v/oceans.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'
    ];

    for (let i = 3; i <= 103; i++) {
      const randomUser = savedUsers[Math.floor(Math.random() * savedUsers.length)];
      const isReel = Math.random() > 0.3; // More reels for better variety
      reels.push({
        user: randomUser._id,
        type: isReel ? 'reel' : 'post',
        imageUrl: `https://picsum.photos/800/800?sig=${i}`,
        videoUrl: isReel ? videoUrls[Math.floor(Math.random() * videoUrls.length)] : null,
        caption: isReel ? `Cool reel #${i}! Check this out 🚀 #trending #reels #${Math.random().toString(36).substring(7)}` : `Beautiful post #${i}! 😍 #lifestyle #vibes #${Math.random().toString(36).substring(7)}`,
        likes: userIdList.slice(0, Math.floor(Math.random() * 50)),
        likeCount: Math.floor(Math.random() * 50),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      });
    }
    const savedPosts = await Post.insertMany(reels);

    // 5. Seed Stories
    console.log('Seeding stories...');
    const stories = [];
    for (let i = 1; i <= 10; i++) {
      stories.push({
        user: userIdList[i],
        imageUrl: `https://picsum.photos/300?story${i}`,
        type: 'image',
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      });
    }
    await Story.insertMany(stories);

    // 6. Seed Chats & Messages (including scams)
    console.log('Seeding 20+ chats and messages...');
    for (let i = 0; i < 20; i++) {
      const uA = userIdList[i];
      const uB = userIdList[i + 1];
      
      const chat = new Chat({ participants: [uA, uB], updatedAt: new Date() });
      await chat.save();

      const isScamChat = i % 5 === 0;
      const msgs = [
        { chat: chat._id, sender: uA, text: isScamChat ? "HELLO! You've been selected for a special prize! 🎁" : "Hey! Long time no see.", createdAt: new Date(Date.now() - 10000) },
        { chat: chat._id, sender: uB, text: isScamChat ? "Is this real?" : "Yeah! We should catch up.", createdAt: new Date(Date.now() - 5000) }
      ];
      if (isScamChat) {
        msgs.push({ 
          chat: chat._id, 
          sender: uA, 
          text: "YES! Just click this secure link to verify: http://insta-win-claim.io/verify", 
          createdAt: new Date(),
          aiAnalysis: { isScam: true, riskScore: 98, recommendation: "Block and report this user immediately." }
        });
      }
      const savedMsgs = await Message.insertMany(msgs);
      await Chat.findByIdAndUpdate(chat._id, { lastMessage: savedMsgs[savedMsgs.length - 1]._id });
    }

    // 7. Seed Notifications
    console.log('Seeding notifications...');
    const notifications = [];
    for (let i = 0; i < 30; i++) {
      const recipient = userIdList[0]; // user1 receives all demo notifs
      const sender = userIdList[Math.floor(Math.random() * 50) + 1];
      const type = ['like', 'comment', 'follow', 'message'][Math.floor(Math.random() * 4)];
      
      notifications.push({
        recipient,
        sender,
        type,
        post: type === 'like' || type === 'comment' ? savedPosts[0]._id : null,
        content: type === 'comment' ? 'Great post! 👏' : type === 'message' ? 'Check your DM!' : '',
        isRead: Math.random() > 0.7
      });
    }
    await Notification.insertMany(notifications);

    console.log('Successfully seeded the final dataset.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
