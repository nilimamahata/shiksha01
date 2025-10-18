const mongoose = require('mongoose');

const recordedVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  teacherId: {
    type: String,
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  stream: {
    type: String,
    default: 'general'
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number // in seconds
  },
  fileSize: {
    type: Number // in bytes
  },
  views: {
    type: Number,
    default: 0
  },
  watchedBy: [{
    studentId: String,
    studentName: String,
    watchedAt: Date,
    progress: Number // percentage watched
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RecordedVideo', recordedVideoSchema);
