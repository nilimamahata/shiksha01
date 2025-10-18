const RecordedVideo = require('../models/RecordedVideo');
const fs = require('fs');
const path = require('path');

// Upload recorded video
exports.uploadRecordedVideo = async (req, res) => {
  try {
    const { title, description, subject, class: classLevel, stream, videoUrl, duration, tags } = req.body;
    const teacherId = req.user?.teacherId || req.body.teacherId;
    const teacherName = req.user?.firstName + ' ' + req.user?.lastName || req.body.teacherName;

    let finalVideoUrl = videoUrl;
    let fileSize = null;

    // If file is uploaded, use the uploaded file
    if (req.file) {
      finalVideoUrl = `/uploads/videos/${req.file.filename}`;
      const filePath = path.join(__dirname, '../uploads/videos', req.file.filename);
      const stats = fs.statSync(filePath);
      fileSize = stats.size;
    }

    const recordedVideo = new RecordedVideo({
      title,
      description,
      subject,
      teacherId,
      teacherName,
      class: classLevel,
      stream: stream || 'general',
      videoUrl: finalVideoUrl,
      duration: parseInt(duration) || null,
      fileSize,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await recordedVideo.save();

    res.status(201).json({
      success: true,
      message: 'Recorded video uploaded successfully',
      video: recordedVideo
    });
  } catch (error) {
    console.error('Upload recorded video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading video'
    });
  }
};

// Get videos for students (by class and subject)
exports.getStudentVideos = async (req, res) => {
  try {
    const { class: classLevel, stream, subject } = req.params;
    const query = {
      class: classLevel,
      stream: stream || 'general',
      isPublic: true
    };

    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    const videos = await RecordedVideo.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      videos
    });
  } catch (error) {
    console.error('Get student videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching videos'
    });
  }
};

// Get videos uploaded by teacher
exports.getTeacherVideos = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const videos = await RecordedVideo.find({ teacherId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      videos
    });
  } catch (error) {
    console.error('Get teacher videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching videos'
    });
  }
};

// Update video details
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const video = await RecordedVideo.findByIdAndUpdate(id, updateData, { new: true });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating video'
    });
  }
};

// Mark video as watched by student
exports.markVideoWatched = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, studentName, progress } = req.body;

    const video = await RecordedVideo.findById(id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Update or add watch record
    const existingWatch = video.watchedBy.find(w => w.studentId === studentId);
    if (existingWatch) {
      existingWatch.watchedAt = new Date();
      existingWatch.progress = progress;
    } else {
      video.watchedBy.push({
        studentId,
        studentName,
        watchedAt: new Date(),
        progress
      });
      video.views += 1;
    }

    await video.save();

    res.json({
      success: true,
      message: 'Video watch status updated'
    });
  } catch (error) {
    console.error('Mark video watched error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating watch status'
    });
  }
};

// Delete video
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await RecordedVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Delete file if it exists
    if (video.videoUrl && video.videoUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', video.videoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await RecordedVideo.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting video'
    });
  }
};

// Get video statistics
exports.getVideoStats = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await RecordedVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const stats = {
      totalViews: video.views,
      uniqueWatchers: video.watchedBy.length,
      averageProgress: video.watchedBy.length > 0
        ? video.watchedBy.reduce((sum, w) => sum + w.progress, 0) / video.watchedBy.length
        : 0,
      watchHistory: video.watchedBy
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get video stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching stats'
    });
  }
};
