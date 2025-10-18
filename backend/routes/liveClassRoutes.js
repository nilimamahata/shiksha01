const express = require('express');
const {
  createLiveClass,
  getTeacherLiveClasses,
  getStudentLiveClasses,
  updateLiveClassStatus,
  addAttendee,
  removeAttendee,
  deleteLiveClass
} = require('../controllers/liveClassController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Teacher routes
router.post('/create', createLiveClass);
router.get('/teacher/:teacherId', getTeacherLiveClasses);
router.put('/:id/status', updateLiveClassStatus);
router.delete('/:id', deleteLiveClass);

// Student routes
router.get('/student/:class/:stream?', getStudentLiveClasses);

// Attendance routes
router.post('/:id/attendee', addAttendee);
router.delete('/:id/attendee', removeAttendee);

module.exports = router;
