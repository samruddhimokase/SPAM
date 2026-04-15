const express = require('express');
const router = express.Router();
const ReportedNumber = require('../models/ReportedNumber');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { detectScamMessage } = require('../utils/aiModels');
const Notification = require('../models/Notification');

// GET /api/whatsapp/chats - Get all chats for a user
router.get('/chats', async (req, res) => {
  try {
    const { userId } = req.query; // For demo, usually from JWT
    let query = {};
    if (userId) {
      query = { participants: userId };
    }
    
    const chats = await Chat.find(query)
      .populate('participants', 'username fullName profilePicture phoneNumber')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username' }
      })
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/whatsapp/chats - Get or create a chat between participants
router.post('/chats', async (req, res) => {
  try {
    const { participants } = req.body; // Array of 2 IDs
    
    if (!participants || participants.length < 2) {
      return res.status(400).json({ message: 'Participants are required' });
    }

    // Find existing direct chat
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: participants, $size: participants.length }
    });

    if (!chat) {
      chat = new Chat({
        participants,
        isGroupChat: false
      });
      await chat.save();
    }

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'username fullName profilePicture phoneNumber')
      .populate('lastMessage');

    res.json(populatedChat);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/whatsapp/messages/:chatId - Get messages for a chat
router.get('/messages/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username fullName profilePicture')
      .populate({
        path: 'sharedPost',
        populate: { path: 'user', select: 'username profilePicture' }
      })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/whatsapp/messages - Send a message
router.post('/messages', async (req, res) => {
  try {
    const { chatId, senderId, text, mediaUrl, mediaType, sharedPost } = req.body;
    
    // AI Scam Analysis
    const aiAnalysis = detectScamMessage(text || '');
    
    const newMessage = new Message({
      chat: chatId,
      sender: senderId,
      text,
      mediaUrl,
      mediaType: mediaType || 'none',
      sharedPost,
      aiAnalysis: {
        isScam: aiAnalysis.classification === 'Scam',
        riskScore: aiAnalysis.riskScore,
        recommendation: aiAnalysis.recommendation,
        classification: aiAnalysis.classification,
        flags: aiAnalysis.flags
      }
    });
    
    await newMessage.save();
    
    // Update last message in Chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id, updatedAt: Date.now() });
    
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username fullName profilePicture')
      .populate({
        path: 'sharedPost',
        populate: { path: 'user', select: 'username profilePicture' }
      });
    
    // Real-time: emit message update to the room
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('receive_message', populatedMessage);
      // Also notify participants about chat list update
      io.emit('chat_update', { chatId, lastMessage: populatedMessage });

      // 🔥 Auto reply simulation for active feeling
      const chat = await Chat.findById(chatId).populate('participants');
      const recipient = chat.participants.find(p => p._id.toString() !== senderId.toString());

      if (recipient) {
        // Set a small delay for realism
        setTimeout(async () => {
          const replies = ["Hi!", "Okay 👍", "Nice!", "Got it", "Interesting...", "Let me think about it.", "Sure!", "Cool!"];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          
          const aiAnalysisReply = detectScamMessage(randomReply);
          
          const autoReply = new Message({
            chat: chatId,
            sender: recipient._id,
            text: randomReply,
            aiAnalysis: {
              isScam: aiAnalysisReply.classification === 'Scam',
              riskScore: aiAnalysisReply.riskScore,
              recommendation: aiAnalysisReply.recommendation,
              classification: aiAnalysisReply.classification,
              flags: aiAnalysisReply.flags
            }
          });
          
          await autoReply.save();
          
          // Mark the original message as seen when replying
          await Message.findByIdAndUpdate(newMessage._id, { status: 'seen' });
          
          await Chat.findByIdAndUpdate(chatId, { lastMessage: autoReply._id, updatedAt: Date.now() });
          
          const populatedReply = await Message.findById(autoReply._id).populate('sender', 'username fullName profilePicture');
          
          // Emit 'message_seen' event to the original sender
          io.to(chatId).emit('message_seen', { messageId: newMessage._id, chatId });
          
          io.to(chatId).emit('receive_message', populatedReply);
          io.emit('chat_update', { chatId, lastMessage: populatedReply });
        }, 1500);
      }

      // If scam detected, send high-risk notification to recipient
      if (aiAnalysis.classification === 'Scam' || aiAnalysis.classification === 'Suspicious') {
        const chat = await Chat.findById(chatId);
        const recipientId = chat.participants.find(p => p._id.toString() !== senderId.toString());
        
        if (recipientId) {
          const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            type: 'message',
            content: `AI Security Alert: High risk message from ${populatedMessage.sender?.username || 'user'}.`,
            isRead: false
          });
          await notification.save();
          
          const populatedNotif = await Notification.findById(notification._id)
            .populate('sender', 'username profilePicture');
            
          io.to(recipientId.toString()).emit('notification', populatedNotif);
        }
      } else {
        // Regular message notification if not a scam/suspicious (to show message request/notification)
        const chat = await Chat.findById(chatId);
        const recipientId = chat.participants.find(p => p._id.toString() !== senderId.toString());
        
        if (recipientId) {
          const notification = new Notification({
            recipient: recipientId,
            sender: senderId,
            type: 'message',
            content: `New message from ${populatedMessage.sender?.username || 'user'}.`,
            isRead: false
          });
          await notification.save();
          
          const populatedNotif = await Notification.findById(notification._id)
            .populate('sender', 'username profilePicture');
            
          io.to(recipientId.toString()).emit('notification', populatedNotif);
        }
      }
    }

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/whatsapp/check-number/:number
router.get('/check-number/:number', async (req, res) => {
  try {
    const { number } = req.params;
    
    // Find in spam database
    const record = await ReportedNumber.findOne({ number });
    
    if (!record) {
      // If not in DB, perform heuristic check
      // (Simulation of origin tracking)
      const isProxy = Math.random() > 0.7; // Mock proxy detection
      const origin = ['USA', 'Nigeria', 'UK', 'Russia', 'India'][Math.floor(Math.random() * 5)];
      
      return res.json({
        number,
        isSpam: false,
        riskScore: isProxy ? 45 : 10,
        origin,
        isProxy,
        totalReports: 0,
        message: 'Number not found in global spam database.'
      });
    }

    res.json({
      number: record.number,
      isSpam: record.totalReports > 5,
      riskScore: record.riskScore,
      origin: record.origin,
      isProxy: record.isProxy,
      totalReports: record.totalReports,
      message: record.totalReports > 5 ? 'WARNING: This number has multiple spam reports!' : 'Proceed with caution.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/whatsapp/report-number
router.post('/report-number', async (req, res) => {
  try {
    const { number, reason } = req.body;
    
    let record = await ReportedNumber.findOne({ number });
    
    if (!record) {
      record = new ReportedNumber({
        number,
        origin: 'Unknown',
        isProxy: Math.random() > 0.5,
        riskScore: 20
      });
    }

    record.reports.push({ reason });
    record.totalReports = record.reports.length;
    record.riskScore = Math.min(record.riskScore + 10, 100);
    
    await record.save();
    res.json({ message: 'Number reported successfully', record });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;