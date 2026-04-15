const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');

async function seedFakeNotifications() {
  try {
    await mongoose.connect('mongodb://localhost:27017/socialshield');
    console.log('Connected to MongoDB');

    const currentUser = await User.findOne({ username: 'rohit_gupta' });
    if (!currentUser) {
      console.error('rohit_gupta not found');
      process.exit(1);
    }

    // 1. Create a "Fake" High Risk User (Scammer)
    let cryptoScammer = await User.findOne({ username: 'crypto_king_99' });
    if (!cryptoScammer) {
      cryptoScammer = new User({
        username: 'crypto_king_99',
        fullName: 'Crypto King Support',
        email: 'scam1@fake.com',
        password: 'password123',
        phoneNumber: '1234567891',
        profilePicture: 'https://i.pravatar.cc/150?u=scam1',
        bio: 'Official crypto giveaway! Doubling all investments today only. DM for link 🚀',
        riskScore: 98,
        riskClassification: 'Scam',
        riskFlags: ['High scam probability', 'Unverified account', 'Suspicious bio keywords']
      });
      await cryptoScammer.save();
      console.log('Created fake user: crypto_king_99');
    }

    // 2. Create another "Fake" Suspicious User
    let prizeBot = await User.findOne({ username: 'prize_winner_bot' });
    if (!prizeBot) {
      prizeBot = new User({
        username: 'prize_winner_bot',
        fullName: 'Win Big Prizes',
        email: 'scam2@fake.com',
        password: 'password123',
        phoneNumber: '1234567892',
        profilePicture: 'https://i.pravatar.cc/150?u=scam2',
        bio: 'You have been selected! Click the link in bio to claim your $1000 gift card.',
        riskScore: 75,
        riskClassification: 'Suspicious',
        riskFlags: ['Automated behavior', 'Suspicious link in bio']
      });
      await prizeBot.save();
      console.log('Created fake user: prize_winner_bot');
    }

    // 3. Create Notifications for rohit_gupta
    const notifications = [
      {
        recipient: currentUser._id,
        sender: cryptoScammer._id,
        type: 'follow',
        content: 'AI Security Alert: High risk user crypto_king_99 started following you.',
        isRead: false,
        isSecurityAlert: true
      },
      {
        recipient: currentUser._id,
        sender: prizeBot._id,
        type: 'message',
        content: 'AI Security Alert: Suspicious message request from prize_winner_bot.',
        isRead: false,
        isSecurityAlert: true
      }
    ];

    for (const notifData of notifications) {
      const notif = new Notification(notifData);
      await notif.save();
    }

    console.log('Successfully seeded 2 fake users and notifications for rohit_gupta');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedFakeNotifications();
