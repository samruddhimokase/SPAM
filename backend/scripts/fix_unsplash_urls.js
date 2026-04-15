const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Post = require('../models/Post');
const Story = require('../models/Story');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function fixUrls() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // 1. Fix Posts
    console.log('Checking Posts for Unsplash URLs...');
    const posts = await Post.find({ imageUrl: /unsplash\.com/ });
    console.log(`Found ${posts.length} posts with Unsplash URLs.`);

    for (let post of posts) {
      const oldUrl = post.imageUrl;
      // Extract a unique ID from the unsplash URL if possible, or just use a random one
      const match = oldUrl.match(/photo-([a-zA-Z0-9-]+)/);
      const id = match ? match[1] : Math.random().toString(36).substring(7);
      const newUrl = `https://i.pravatar.cc/1000?u=${id}`;
      
      post.imageUrl = newUrl;
      if (post.type === 'reel') {
        post.videoUrl = newUrl; // Since these are demo images anyway
      }
      await post.save();
    }
    console.log('Successfully updated posts.');

    // 2. Fix Stories
    console.log('Checking Stories for Unsplash URLs...');
    const stories = await Story.find({ imageUrl: /unsplash\.com/ });
    console.log(`Found ${stories.length} stories with Unsplash URLs.`);

    for (let story of stories) {
      const oldUrl = story.imageUrl;
      const match = oldUrl.match(/photo-([a-zA-Z0-9-]+)/);
      const id = match ? match[1] : Math.random().toString(36).substring(7);
      const newUrl = `https://i.pravatar.cc/1000?u=${id}`;
      
      story.imageUrl = newUrl;
      await story.save();
    }
    console.log('Successfully updated stories.');

    // 3. Fix Users (just in case)
    console.log('Checking Users for Unsplash URLs...');
    const users = await User.find({ profilePicture: /unsplash\.com/ });
    console.log(`Found ${users.length} users with Unsplash URLs.`);

    for (let user of users) {
      const oldUrl = user.profilePicture;
      const match = oldUrl.match(/photo-([a-zA-Z0-9-]+)/);
      const id = match ? match[1] : user.username;
      const newUrl = `https://i.pravatar.cc/150?u=${id}`;
      
      user.profilePicture = newUrl;
      await user.save();
    }
    console.log('Successfully updated users.');

    console.log('All Unsplash URLs have been replaced with pravatar.cc URLs.');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing URLs:', err);
    process.exit(1);
  }
}

fixUrls();
