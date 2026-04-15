const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const Story = require('../models/Story');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { analyzeInstagramProfile, detectScamMessage } = require('../utils/aiModels');

// Helper to send real-time notification
const sendNotification = async (req, recipientId, senderId, type, postId = null, content = '') => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
      content
    });
    await notification.save();
    
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'username profilePicture');

    const io = req.app.get('io');
    if (io) {
      io.to(recipientId.toString()).emit('notification', populated);
    }
  } catch (err) {
    console.error('Notification error:', err);
  }
};

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// GET /api/instagram/suggestions - Get suggested users
router.get('/suggestions', async (req, res) => {
  try {
    const { userId } = req.query;
    // Suggest users who are not the current user and not already followed
    let query = {};
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        query = { _id: { $ne: userId, $nin: user.following } };
      }
    }
    
    // Mix some high risk and some safe users for demo
    const suggestions = await User.find(query)
      .limit(10)
      .select('username fullName profilePicture isVerified riskScore riskClassification bio');
    
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/instagram/search - Search users
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);
    
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } }
      ]
    }).limit(10).select('username fullName profilePicture isVerified');
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/instagram/notifications/:userId - Get notifications
router.get('/notifications/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.userId })
      .populate('sender', 'username profilePicture')
      .populate('post', 'imageUrl')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/instagram/stories - Fetch active stories
router.get('/stories', async (req, res) => {
  try {
    const stories = await Story.find({ 
      $or: [{ type: 'image' }, { type: 'video' }, { type: { $exists: false } }],
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Ensure only last 24h
    }).populate('user').sort({ createdAt: 1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/instagram/stories/upload - Upload a story
router.post('/stories/upload', upload.single('file'), async (req, res) => {
  try {
    const { username, type } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.content;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Story content (file or URL) is required' });
    }

    // Find or create a demo user
    let user = await User.findOne({ username: username || 'tech_innovator' });
    if (!user) {
      user = await User.findOne({}); // Fallback to first user
    }

    const newStory = new Story({
      user: user._id,
      imageUrl,
      type: type || 'image'
    });
    await newStory.save();
    const populatedStory = await Story.findById(newStory._id).populate('user');
    
    // Real-time: emit story update
    const io = req.app.get('io');
    if (io) io.emit('new_story', populatedStory);

    res.status(201).json(populatedStory);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/instagram/posts - Fetch all posts and reels
router.get('/posts', async (req, res) => {
  try {
    const { type, shuffle } = req.query; // 'post' or 'reel', shuffle=true
    console.log('Fetching posts of type:', type, 'shuffle:', shuffle);
    // If type is 'post', we also include posts without a type field
    const query = type === 'post' ? { $or: [{ type: 'post' }, { type: { $exists: false } }] } : (type ? { type } : {});
    
    // Sort by createdAt descending and ensure unique IDs (handled by MongoDB)
    let posts = await Post.find(query)
      .populate('user')
      .populate('comments.user', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    // Additional deduplication
    const seen = new Set();
    let uniquePosts = posts.filter(p => {
      if (!p || !p._id) return false;
      if (seen.has(p._id.toString())) return false;
      seen.add(p._id.toString());
      return true;
    });

    // Optional shuffle for reels variety
    if (shuffle === 'true') {
      uniquePosts = uniquePosts.sort(() => Math.random() - 0.5);
    }

    console.log(`Found ${uniquePosts.length} unique posts`);
    res.json(uniquePosts);
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/instagram/user/posts/:id - Get posts for a specific user
router.get('/user/posts/:id', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .populate('user')
      .populate('comments.user', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/instagram/upload - Upload a new post or reel
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { username, type, caption } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image || req.body.video;

    if (!fileUrl) {
      return res.status(400).json({ message: 'File (image/video) or URL is required' });
    }
    
    // Find or create a demo user
    let user = await User.findOne({ username: username || 'tech_innovator' });
    if (!user) {
      user = await User.findOne({}); // Fallback to first user
    }

    // Check for potential duplicate post (same user, same caption, same file, within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingPost = await Post.findOne({
      user: user._id,
      caption: caption || '',
      $or: [{ imageUrl: fileUrl }, { videoUrl: fileUrl }],
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (existingPost) {
      console.log('Duplicate post detected, skipping upload');
      return res.status(200).json(existingPost);
    }

    // AI Fake Content Analysis (Simulated advanced detection)
    const aiAnalysis = detectScamMessage(caption || '');
    const isFake = aiAnalysis.classification === 'Scam' || Math.random() > 0.8;
    const fakeConfidence = isFake ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30);

    const newPost = new Post({
      user: user._id,
      type: type || 'post',
      imageUrl: fileUrl,
      videoUrl: type === 'reel' ? fileUrl : null,
      caption: caption || '',
      aiAnalysis: {
        isScam: aiAnalysis.classification === 'Scam',
        riskScore: aiAnalysis.riskScore,
        recommendation: aiAnalysis.recommendation,
        classification: isFake ? 'Fake' : aiAnalysis.classification,
        confidence: 100 - fakeConfidence,
        flags: aiAnalysis.flags
      },
      riskAnalysis: {
        classification: isFake ? 'Fake' : aiAnalysis.classification,
        flags: aiAnalysis.flags,
        score: aiAnalysis.riskScore
      },
      isFake: isFake,
      fakeConfidence: fakeConfidence,
      isSuspicious: isFake || aiAnalysis.classification === 'Scam' || aiAnalysis.classification === 'Suspicious'
    });

    await newPost.save();

    // Trigger Real-time Notification if Fake Post Detected
    if (isFake) {
      const io = req.app.get('io');
      const notification = new Notification({
        recipient: user._id,
        type: 'security',
        content: `Fake Post Detected – AI Analysis Completed: Confidence ${fakeConfidence}%`,
        isRead: false,
        isSecurityAlert: true
      });
      await notification.save();
      
      if (io) {
        io.to(user._id.toString()).emit('notification', notification);
      }
    }
    const populatedPost = await Post.findById(newPost._id).populate('user');
    
    // Real-time: emit new post update
    const io = req.app.get('io');
    if (io) io.emit('new_post', populatedPost);

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/instagram/like/:id - Like/Unlike a post
router.post('/like/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if already liked
    const index = post.likes.indexOf(userId);
    if (index === -1) {
      // Like
      post.likes.push(userId);
      post.likeCount = post.likes.length;
    } else {
      // Unlike
      post.likes.splice(index, 1);
      post.likeCount = post.likes.length;
    }
    
    await post.save();

    // Real-time: emit like update
    const io = req.app.get('io');
    if (io) {
      io.emit('post_update', {
        postId: post._id,
        likeCount: post.likeCount,
        likes: post.likes
      });
    }

    // Send notification if liked (not unliked) and not own post
    if (index === -1 && post.user.toString() !== userId) {
      sendNotification(req, post.user, userId, 'like', post._id);
    }

    res.json({ likeCount: post.likeCount, likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/instagram/comment/:id - Add a comment
router.post('/comment/:id', async (req, res) => {
  try {
    const { userId, text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // AI Scam Analysis for comment
    const aiAnalysis = detectScamMessage(text);

    const newComment = {
      user: userId,
      text,
      createdAt: new Date(),
      aiAnalysis: {
        isScam: aiAnalysis.classification === 'Scam',
        riskScore: aiAnalysis.riskScore,
        recommendation: aiAnalysis.recommendation,
        classification: aiAnalysis.classification,
        flags: aiAnalysis.flags
      }
    };

    post.comments.push(newComment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user')
      .populate('comments.user', 'username profilePicture');

    // Real-time: emit comment update
    const io = req.app.get('io');
    if (io) {
      io.emit('post_update', {
        postId: post._id,
        comments: populatedPost.comments
      });

      // If scam detected in comment, notify post owner
      if (aiAnalysis.classification === 'Scam' || aiAnalysis.classification === 'Suspicious') {
        if (post.user.toString() !== userId) {
          const user = await User.findById(userId);
          sendNotification(req, post.user, userId, 'comment', post._id, `AI Security Alert: Suspicious comment from ${user?.username || 'user'}.`);
        }
      }
    }

    // Send notification if not own post
    if (post.user.toString() !== userId) {
      sendNotification(req, post.user, userId, 'comment', post._id, text);
    }

    res.json(populatedPost.comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/instagram/analyze-profile
router.post('/analyze-profile', (req, res) => {
  try {
    const { profileData } = req.body;
    
    if (!profileData) {
      return res.status(400).json({ message: 'Profile data is required' });
    }

    const analysis = analyzeInstagramProfile(profileData);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/instagram/user/follow/:id - Follow/Unfollow a user
router.post('/user/follow/:id', async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { currentUserId } = req.body;
    console.log(`Follow request: ${currentUserId} -> ${targetUserId}`);

    if (!currentUserId) return res.status(400).json({ message: 'Current user ID is required' });
    if (targetUserId === currentUserId) return res.status(400).json({ message: 'Cannot follow yourself' });

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      console.log('User not found:', { targetUser: !!targetUser, currentUser: !!currentUser });
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);
    console.log('Current following status:', isFollowing);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();
    console.log('Follow status updated successfully');

    // Send notification if followed (not unfollowed)
    if (!isFollowing) {
      sendNotification(req, targetUserId, currentUserId, 'follow');
    }

    // Real-time: notify users about follow update
    const io = req.app.get('io');
    if (io) {
      io.emit('follow_update', {
        followerId: currentUserId,
        followingId: targetUserId,
        isFollowing: !isFollowing,
        targetFollowerCount: targetUser.followers.length,
        currentFollowingCount: currentUser.following.length
      });
    }

    res.json({
      isFollowing: !isFollowing,
      followerCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/instagram/user/profile/:id - Get user profile with follower info
router.get('/user/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username fullName profilePicture isVerified')
      .populate('following', 'username fullName profilePicture isVerified');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/instagram/following/:userId - Get users that a specific user follows
router.get('/following/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'username fullName profilePicture isVerified riskScore riskClassification bio');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;