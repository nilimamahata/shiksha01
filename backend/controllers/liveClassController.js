const LiveClass = require('../models/LiveClass');

// Create a new live class
exports.createLiveClass = async (req, res) => {
  try {
    const { title, description, subject, class: classLevel, stream, scheduledDate, duration, meetingLink } = req.body;
    const teacherId = req.user?.teacherId || req.body.teacherId;
    const teacherName = req.user?.firstName + ' ' + req.user?.lastName || req.body.teacherName;

    const liveClass = new LiveClass({
      title,
      description,
      subject,
      teacherId,
      teacherName,
      class: classLevel,
      stream: stream || 'general',
      scheduledDate: new Date(scheduledDate),
      duration,
      meetingLink,
      meetingId: generateMeetingId()
    });

    await liveClass.save();

    res.status(201).json({
      success: true,
      message: 'Live class scheduled successfully',
      liveClass
    });
  } catch (error) {
    console.error('Create live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating live class'
    });
  }
};

// Get all live classes for a teacher
exports.getTeacherLiveClasses = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const liveClasses = await LiveClass.find({ teacherId }).sort({ scheduledDate: -1 });

    res.json({
      success: true,
      liveClasses
    });
  } catch (error) {
    console.error('Get teacher live classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching live classes'
    });
  }
};

// Get live classes for students (by class and subject)
exports.getStudentLiveClasses = async (req, res) => {
  try {
    const { class: classLevel, stream } = req.params;
    const liveClasses = await LiveClass.find({
      class: classLevel,
      stream: stream || 'general',
      status: { $in: ['scheduled', 'live'] }
    }).sort({ scheduledDate: 1 });

    res.json({
      success: true,
      liveClasses
    });
  } catch (error) {
    console.error('Get student live classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching live classes'
    });
  }
};

// Update live class status
exports.updateLiveClassStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, recordingUrl, notes } = req.body;

    const updateData = { status };
    if (recordingUrl) updateData.recordingUrl = recordingUrl;
    if (notes) updateData.notes = notes;

    const liveClass = await LiveClass.findByIdAndUpdate(id, updateData, { new: true });

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    res.json({
      success: true,
      message: 'Live class updated successfully',
      liveClass
    });
  } catch (error) {
    console.error('Update live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating live class'
    });
  }
};

// Add attendee to live class
exports.addAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, studentName } = req.body;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Check if student already attended
    const existingAttendee = liveClass.attendees.find(a => a.studentId === studentId);
    if (existingAttendee) {
      existingAttendee.joinedAt = new Date();
      existingAttendee.leftAt = null;
    } else {
      liveClass.attendees.push({
        studentId,
        studentName,
        joinedAt: new Date()
      });
    }

    await liveClass.save();

    res.json({
      success: true,
      message: 'Attendee added successfully'
    });
  } catch (error) {
    console.error('Add attendee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding attendee'
    });
  }
};

// Remove attendee from live class
exports.removeAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    const attendee = liveClass.attendees.find(a => a.studentId === studentId);
    if (attendee) {
      attendee.leftAt = new Date();
    }

    await liveClass.save();

    res.json({
      success: true,
      message: 'Attendee removed successfully'
    });
  } catch (error) {
    console.error('Remove attendee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing attendee'
    });
  }
};

// Delete live class
exports.deleteLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    await LiveClass.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Live class deleted successfully'
    });
  } catch (error) {
    console.error('Delete live class error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting live class'
    });
  }
};

// Generate unique meeting ID
function generateMeetingId() {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}
