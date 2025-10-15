// backend/server.js

// Load environment variables
require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const path = require('path'); // Add path module
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./data/db');

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3004',
        'http://localhost:3005',
        'http://localhost:5001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5001'
      ];

      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join video call room
  socket.on('join-call', (data) => {
    const { roomId, userId, userRole } = data;
    socket.join(roomId);
    console.log(`User ${userId} (${userRole}) joined call room ${roomId}`);

    // Notify other participants
    socket.to(roomId).emit('user-joined', { userId, userRole });
  });

  // WebRTC signaling
  socket.on('webrtc-offer', (data) => {
    const { roomId, offer, targetUserId } = data;
    socket.to(roomId).emit('webrtc-offer', { offer, fromUserId: socket.userId });
  });

  socket.on('webrtc-answer', (data) => {
    const { roomId, answer, targetUserId } = data;
    socket.to(roomId).emit('webrtc-answer', { answer, fromUserId: socket.userId });
  });

  socket.on('webrtc-ice-candidate', (data) => {
    const { roomId, candidate, targetUserId } = data;
    socket.to(roomId).emit('webrtc-ice-candidate', { candidate, fromUserId: socket.userId });
  });

  // Leave call
  socket.on('leave-call', (data) => {
    const { roomId } = data;
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', { userId: socket.userId });
    console.log(`User ${socket.userId} left call room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


// Connect to MongoDB
connectDB();

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const testRoutes = require('./routes/testRoutes');
const videoRoutes = require('./routes/videoRoutes');
const timetableRoutes = require('./routes/timetableRoutes');

// ... import your other route files here

// --- Middleware ---
// Enable CORS for frontend origins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:5001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5001'
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));
app.use(express.json());

// --- Make the 'uploads' folder static ---
// This allows the frontend to access files via URLs like 'http://localhost:5001/uploads/filename.pdf'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Use API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/timetables', timetableRoutes);
// ... use your other routes here

// Make Socket.IO available to routes
app.set('io', io);

// Serve coursesF/merncourses/public as static files at /courses
app.use('/courses', express.static(path.join(__dirname, '../coursesF/merncourses/public')));

module.exports = { app, server, io };
