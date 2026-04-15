const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield';

async function fixAllUnsplash() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      const name = collection.collectionName;
      console.log(`Checking collection: ${name}`);
      
      // Find all documents in this collection
      const docs = await collection.find({}).toArray();
      let updatedCount = 0;

      for (let doc of docs) {
        let needsUpdate = false;
        const newDoc = { ...doc };

        // Recursively search and replace unsplash URLs in all string fields
        const replaceUnsplash = (obj) => {
          for (let key in obj) {
            if (typeof obj[key] === 'string' && obj[key].includes('unsplash.com')) {
              const oldUrl = obj[key];
              const match = oldUrl.match(/photo-([a-zA-Z0-9-]+)/);
              const id = match ? match[1] : Math.random().toString(36).substring(7);
              obj[key] = `https://i.pravatar.cc/1000?u=${id}`;
              needsUpdate = true;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              replaceUnsplash(obj[key]);
            }
          }
        };

        replaceUnsplash(newDoc);

        if (needsUpdate) {
          await collection.updateOne({ _id: doc._id }, { $set: newDoc });
          updatedCount++;
        }
      }
      
      if (updatedCount > 0) {
        console.log(`Updated ${updatedCount} documents in ${name}`);
      }
    }

    console.log('Finished deep cleaning all collections.');
    process.exit(0);
  } catch (err) {
    console.error('Error during deep clean:', err);
    process.exit(1);
  }
}

fixAllUnsplash();
