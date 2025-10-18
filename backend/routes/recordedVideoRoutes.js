const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  uploadRecordedVideo,
  getStudentVideos,
  getTeacherVideos,
  updateVideo,
  markVideoWatched,
  deleteVideo,
  getVideoStats
} = require('../controllers/recordedVideoController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/videos/';
    // Ensure directory exists
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is a video
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Teacher routes
router.post('/upload', upload.single('videoFile'), uploadRecordedVideo);
router.get('/teacher/:teacherId', getTeacherVideos);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);
router.get('/:id/stats', getVideoStats);

// Student routes
router.get('/student/:class/:stream?/:subject?', getStudentVideos);
router.post('/:id/watch', markVideoWatched);

module.exports = router;
