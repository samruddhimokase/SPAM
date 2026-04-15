const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Story = require('../models/Story');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

// Users from images provided by the user
const USER_MAPPING = [
  { username: '_sakshi_23_07_', fullName: '✨', profilePicture: 'https://i.pravatar.cc/150?u=sakshi' },
  { username: 'dts_technologies', fullName: 'DEVGIRI TECHNOLOGIES', profilePicture: 'https://i.pravatar.cc/150?u=dts' },
  { username: 'rupali_chavan.7406', fullName: '.. 🖤 chavan 🖤 ..', profilePicture: 'https://i.pravatar.cc/150?u=rupali' },
  { username: 'anuragdhumane007', fullName: 'Anurag Dhumane', profilePicture: 'https://i.pravatar.cc/150?u=anurag' },
  { username: 'kohinoor_milk_dairy', fullName: 'कोहिनूर दूध डेअरी', profilePicture: 'https://i.pravatar.cc/150?u=dairy' },
  { username: 'its_vaishnavi_kolge', fullName: 'vaishnavi 😇', profilePicture: 'https://i.pravatar.cc/150?u=vaishnavi' }
];

const STORY_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&auto=format&fit=crop&q=60'
];

async function seedStories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // Create users if they don't exist
    const userIds = [];
    for (const u of USER_MAPPING) {
      let user = await User.findOne({ username: u.username });
      if (!user) {
        user = new User({
          username: u.username,
          fullName: u.fullName,
          email: `${u.username}@example.com`,
          password: 'password123',
          profilePicture: u.profilePicture,
          bio: 'Imported from Kaggle dataset analysis',
          phoneNumber: `987${Math.floor(Math.random() * 10000000)}`,
          accountAge: Math.floor(Math.random() * 365),
          isVerified: true,
          riskScore: 0,
          riskClassification: 'Real'
        });
        await user.save();
        console.log(`Created user: ${u.username}`);
      }
      userIds.push(user._id);
    }

    // Clean existing stories
    await Story.deleteMany({});
    console.log('Cleaned existing stories.');

    const results = [];
    const csvPath = path.join(__dirname, 'instagram_data.csv');

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Read ${results.length} records from CSV.`);

        const stories = [];
        // Take 20 records and map them to stories
        const limitedResults = results.slice(0, 20);

        limitedResults.forEach((record, index) => {
          const userIdx = index % userIds.length;
          const imageIdx = index % STORY_IMAGES.length;

          stories.push({
            user: userIds[userIdx],
            imageUrl: STORY_IMAGES[imageIdx],
            type: record.media_type === 'video' ? 'video' : 'image',
            createdAt: new Date()
          });
        });

        await Story.insertMany(stories);
        console.log(`Successfully seeded ${stories.length} stories.`);
        process.exit(0);
      });

  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedStories();
