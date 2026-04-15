require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialshield')
  .then(() => console.log('DB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io Real-time Communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins their private room for notifications/direct messages
  socket.on('join_user', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined private room: ${userId}`);
  });

  socket.on('join_chat', (data) => {
    socket.join(data.room);
    console.log(`User ${socket.id} joined chat room: ${data.room}`);
  });

  socket.on('typing', (data) => {
    // If room is a userId, it's a private message typing indicator
    if (data.room) {
      socket.to(data.room).emit('user_typing', data);
    } else {
      socket.broadcast.emit('user_typing', data);
    }
  });

  socket.on('send_message', (data) => {
    // data: { room (targetUserId or chatId), senderId, text, ... }
    if (data.room) {
      io.to(data.room).emit('receive_message', data);
      
      // If it's a direct message to a userId (not a room), send notification
      // (This is a simplified check, in production you'd check if room is a Chat ID or User ID)
      if (data.isDirect) {
        // notification logic can be triggered here or in the route
      }
    } else {
      socket.broadcast.emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Pass io to routes
app.set('io', io);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SocialShield API is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/instagram', require('./routes/instagram'));
app.use('/api/telegram', require('./routes/telegram'));
app.use('/api/whatsapp', require('./routes/whatsapp'));
app.use('/api/analyzer', require('./routes/analyzer'));

// Serve frontend static files in production or provide fallback for common routes
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
} else {
  // Helpful redirect for development if hitting backend port
  app.get(['/instagram', '/telegram', '/whatsapp', '/analyzer', '/profile'], (req, res) => {
    res.status(404).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>Oops! You're on the Backend Port (5001)</h1>
        <p>It looks like you're trying to access a frontend route on the backend server.</p>
        <p>Please use the <b>Frontend Port (5173)</b> instead:</p>
        <a href="http://localhost:5173${req.path}" style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Go to http://localhost:5173${req.path}
        </a>
      </div>
    `);
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});