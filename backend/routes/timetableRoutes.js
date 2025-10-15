const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

// POST /api/timetables - Post timetable for a class
router.post('/', timetableController.postTimetable);

// GET /api/timetables/:class - Get timetable for a class (stream optional, defaults to 'general')
// GET /api/timetables/:class/:stream - Get timetable for a class and specific stream
router.get('/:class', timetableController.getTimetable);
router.get('/:class/:stream', timetableController.getTimetable);

// GET /api/timetables - Get all timetables
router.get('/', timetableController.getAllTimetables);

module.exports = router;
