const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Post = require('../models/Post');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';
const CSV_FILE_PATH = "C:\\Users\\samru\\Downloads\\archive_1\\Instagram data.csv";

async function seedPostsFromCSV() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // 1. Get all users to distribute posts
    const users = await User.find({});
    if (users.length === 0) {
      console.error('No users found. Please run seed_from_kaggle.js first.');
      process.exit(1);
    }

    const posts = [];
    let rowCount = 0;

    console.log(`Reading posts from ${CSV_FILE_PATH}...`);

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (row) => {
        // Distribute posts among the 100 users seeded previously
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        // Map CSV headers to Post model
        // Headers: Impressions, From Home, From Hashtags, From Explore, From Other, Saves, Comments, Shares, Likes, Profile Visits, Follows, Caption, Hashtags
        
        const impressions = parseInt(row['Impressions']) || 0;
        const likeCount = parseInt(row['Likes']) || 0;
        const commentCount = parseInt(row['Comments']) || 0;
        const shareCount = parseInt(row['Shares']) || 0;
        const saveCount = parseInt(row['Saves']) || 0;

        posts.push({
          user: randomUser._id,
          type: 'post',
          imageUrl: `https://picsum.photos/800/800?sig=csv_${rowCount}`,
          caption: row['Caption'] || '',
          hashtags: row['Hashtags'] ? row['Hashtags'].split('\xa0') : [],
          likeCount: likeCount,
          likes: [], // Empty array for demo
          comments: Array.from({ length: Math.min(commentCount, 5) }).map(() => ({
            user: users[Math.floor(Math.random() * users.length)]._id,
            text: "Great post! 👏",
            createdAt: new Date()
          })),
          analytics: {
            impressions,
            saves: saveCount,
            shares: shareCount,
            profileVisits: parseInt(row['Profile Visits']) || 0,
            follows: parseInt(row['Follows']) || 0
          },
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
        });
        rowCount++;
      })
      .on('end', async () => {
        console.log(`Parsed ${posts.length} posts. Inserting into database...`);
        
        // Clear existing posts if any (optional, keeping previous for variety)
        // await Post.deleteMany({}); 
        
        await Post.insertMany(posts);
        console.log(`Successfully seeded ${posts.length} posts from CSV.`);
        process.exit(0);
      })
      .on('error', (err) => {
        console.error('Error reading CSV:', err);
        process.exit(1);
      });

  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedPostsFromCSV();
