const mongoose = require('mongoose');
const User = require('../models/User');

const humanNames = [
  { username: 'rohit_gupta', fullName: 'Rohit Gupta' },
  { username: 'aryan_sharma', fullName: 'Aryan Sharma' },
  { username: 'isha_patel', fullName: 'Isha Patel' },
  { username: 'siddharth_v', fullName: 'Siddharth Verma' },
  { username: 'ananya_i', fullName: 'Ananya Iyer' },
  { username: 'vikram_m', fullName: 'Vikram Malhotra' },
  { username: 'kavya_r', fullName: 'Kavya Reddy' },
  { username: 'rohan_v', fullName: 'Rohan Verma' },
  { username: 'sneha_k', fullName: 'Sneha Kapoor' },
  { username: 'priyanka_s', fullName: 'Priyanka Singh' },
  { username: 'rahul_b', fullName: 'Rahul Bose' },
  { username: 'neha_d', fullName: 'Neha Dixit' },
  { username: 'amit_p', fullName: 'Amit Pandey' },
  { username: 'pooja_m', fullName: 'Pooja Mehra' },
  { username: 'akash_g', fullName: 'Akash Goel' }
];

async function renameUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/socialshield');
    console.log('Connected to MongoDB');

    // Rename user1 to rohit_gupta
    const user1 = await User.findOne({ username: 'user1' });
    if (user1) {
      user1.username = 'rohit_gupta';
      user1.fullName = 'Rohit Gupta';
      await user1.save();
      console.log('Renamed user1 to rohit_gupta');
    }

    // Rename other generic users
    for (let i = 2; i <= 20; i++) {
      const genericUsername = `user${i}`;
      const user = await User.findOne({ username: genericUsername });
      if (user && humanNames[i - 1]) {
        user.username = humanNames[i - 1].username;
        user.fullName = humanNames[i - 1].fullName;
        await user.save();
        console.log(`Renamed ${genericUsername} to ${user.username}`);
      }
    }

    console.log('Finished renaming users');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

renameUsers();
