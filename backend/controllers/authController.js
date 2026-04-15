const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

const register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Create user
    const user = new User({ username, email, password, fullName });
    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, fullName: user.fullName } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const io = req.app.get('io');

    // Get client info
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || 'Unknown Device';
    const location = "New York, USA"; // Mock location for demo

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked due to suspicious activity' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    // AI Login Behavior Analysis (Simplified for Demo)
    let isSuspicious = false;
    let riskFlags = [];
    let riskScore = 0;

    // 1. Check for unusual IP/Location (if we had previous login data)
    if (user.lastLogin && user.lastLogin.ip !== ip) {
      isSuspicious = true;
      riskFlags.push('Unusual IP Address Detected');
      riskScore += 30;
    }

    // 2. Check for unusual device
    if (user.lastLogin && user.lastLogin.device !== device) {
      isSuspicious = true;
      riskFlags.push('New Device Login Attempt');
      riskScore += 20;
    }

    // 3. Repeated login attempts
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 3) {
        isSuspicious = true;
        riskFlags.push('Multiple Failed Login Attempts');
        riskScore += 40;
      }
      await user.save();
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    
    // Update login history
    const loginEntry = { ip, device, location, isSuspicious, timestamp: new Date() };
    user.loginHistory.push(loginEntry);
    user.lastLogin = loginEntry;
    
    if (isSuspicious || riskScore > 50) {
      user.riskScore = Math.min(100, (user.riskScore || 0) + riskScore);
      user.riskClassification = user.riskScore > 70 ? 'Scam' : 'Suspicious';
      user.riskFlags = [...new Set([...(user.riskFlags || []), ...riskFlags])];
      
      // Trigger Real-time Notification for Fake/Suspicious Login
      const notification = new Notification({
        recipient: user._id,
        type: 'security',
        content: `Fake User Detected – AI Analysis Completed: Unusual login from ${location} using ${device.split(' ')[0]}. Risk Score: ${user.riskScore}%`,
        isRead: false,
        isSecurityAlert: true
      });
      await notification.save();
      
      if (io) {
        io.to(user._id.toString()).emit('notification', notification);
        console.log(`Security notification sent to user ${user.username}`);
      }
    }

    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        fullName: user.fullName,
        riskScore: user.riskScore,
        riskClassification: user.riskClassification
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login };