const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const XLSX = require('xlsx');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Post = require('../models/Post');
const Story = require('../models/Story');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

const MAIN_DATASET_PATH = "C:\\Users\\samru\\Downloads\\archive\\MainDataset- Instagram.xlsx";

async function seedFromKaggle() {
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

    // 2. Read Excel File
    console.log(`Reading dataset from ${MAIN_DATASET_PATH}...`);
    const workbook = XLSX.readFile(MAIN_DATASET_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} users in dataset.`);

    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [];
    const userIdMap = {};

    // 3. Seed Users
    console.log('Seeding users and calculating risk scores...');
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const username = (row['Users'] || `user_${i}`).toLowerCase().replace(/\s+/g, '_');
      
      // Basic AI logic for risk:
      // High risk if: very few followers but many posts, or very high following to follower ratio
      const followers = parseInt(row['Number of Followers']) || 0;
      const following = parseInt(row['Number of Followings']) || 0;
      const postsCount = parseInt(row['Number of Posts']) || 0;
      
      let riskScore = 0;
      let riskClassification = 'Real';

      if (followers < 50 && postsCount > 200) {
        riskScore += 40;
      }
      if (following > followers * 10 && following > 100) {
        riskScore += 30;
      }
      if (followers === 0 && following > 0) {
        riskScore += 20;
      }

      if (riskScore > 60) riskClassification = 'Scam';
      else if (riskScore > 30) riskClassification = 'Suspicious';

      const newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        username,
        fullName: row['Users'] || `User ${i}`,
        email: `${username}@example.com`,
        password: passwordHash,
        profilePicture: `https://i.pravatar.cc/150?u=${username}`,
        bio: `Instagram user with ${postsCount} posts. Analyzed by SocialShield AI.`,
        phoneNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        accountAge: Math.floor(Math.random() * 365),
        isVerified: followers > 1000,
        riskScore,
        riskClassification
      });

      users.push(newUser);
      userIdMap[username] = newUser._id;
    }

    await User.insertMany(users);
    console.log(`Successfully seeded ${users.length} users.`);

    // 4. Seed Posts
    console.log('Seeding posts for users...');
    const posts = [];
    // Only seed for the first 50 users to avoid massive DB size for demo
    const usersToSeedPosts = users.slice(0, 50);
    
    for (const user of usersToSeedPosts) {
      // Create 1-3 posts per user
      const numPosts = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numPosts; j++) {
        const isReel = Math.random() > 0.7;
        posts.push({
          user: user._id,
          type: isReel ? 'reel' : 'post',
          imageUrl: `https://picsum.photos/800/800?sig=${user.username}_${j}`,
          videoUrl: isReel ? 'https://www.w3schools.com/html/mov_bbb.mp4' : null,
          caption: `Post #${j + 1} from ${user.username}. #instagram #socialshield`,
          likes: [],
          likeCount: Math.floor(Math.random() * 100),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }
    await Post.insertMany(posts);
    console.log(`Successfully seeded ${posts.length} posts.`);

    // 5. Seed Stories
    console.log('Seeding stories...');
    const stories = [];
    for (const user of usersToSeedPosts.slice(0, 20)) {
      stories.push({
        user: user._id,
        imageUrl: `https://picsum.photos/300/600?sig=story_${user.username}`,
        type: 'image',
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
      });
    }
    await Story.insertMany(stories);

    // 6. Seed Chats & Messages
    console.log('Seeding chats and messages...');
    for (let k = 0; k < 15; k++) {
      const u1 = users[k];
      const u2 = users[k + 1];
      
      const chat = new Chat({
        participants: [u1._id, u2._id],
        updatedAt: new Date()
      });
      await chat.save();

      const msgs = [
        { chat: chat._id, sender: u1._id, text: `Hello ${u2.username}!`, createdAt: new Date(Date.now() - 10000) },
        { chat: chat._id, sender: u2._id, text: `Hi ${u1.username}, how are you?`, createdAt: new Date(Date.now() - 5000) }
      ];
      
      // Add a scam message if one of them is a scammer
      if (u1.riskClassification === 'Scam' || u2.riskClassification === 'Scam') {
        const scammer = u1.riskClassification === 'Scam' ? u1 : u2;
        msgs.push({
          chat: chat._id,
          sender: scammer._id,
          text: "CONGRATULATIONS! You won a $500 gift card! Click here to claim: http://scam-link.io/win",
          createdAt: new Date(),
          aiAnalysis: { isScam: true, riskScore: 95, recommendation: "Block and report this user." }
        });
      }

      const savedMsgs = await Message.insertMany(msgs);
      await Chat.findByIdAndUpdate(chat._id, { lastMessage: savedMsgs[savedMsgs.length - 1]._id });
    }

    console.log('Successfully seeded the dataset from Kaggle.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedFromKaggle();
