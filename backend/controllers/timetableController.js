const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

const readDb = () => {
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
};

const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Post timetable for a class and stream
exports.postTimetable = (req, res) => {
  try {
    const { class: classNum, stream, timetable, teacherId } = req.body;

    if (!classNum || !timetable || !teacherId) {
      return res.status(400).json({ message: 'Class, timetable, and teacherId are required' });
    }

    const db = readDb();

    // Find existing timetable for this class and stream
    let existingIndex = db.timetables.findIndex(t =>
      t.class === classNum && t.stream === (stream || 'general')
    );

    const timetableEntry = {
      id: Date.now(),
      class: classNum,
      stream: stream || 'general',
      timetable,
      teacherId,
      postedAt: new Date().toISOString()
    };

    if (existingIndex !== -1) {
      // Update existing
      db.timetables[existingIndex] = timetableEntry;
    } else {
      // Add new
      db.timetables.push(timetableEntry);
    }

    writeDb(db);

    res.json({ message: 'Timetable posted successfully', timetable: timetableEntry });
  } catch (error) {
    console.error('Error posting timetable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get timetable for a class and stream
exports.getTimetable = (req, res) => {
  try {
    const { class: classNum, stream } = req.params;

    if (!classNum) {
      return res.status(400).json({ message: 'Class is required' });
    }

    const db = readDb();

    const timetable = db.timetables.find(t =>
      t.class === classNum && t.stream === (stream || 'general')
    );

    if (timetable) {
      res.json(timetable);
    } else {
      res.status(404).json({ message: 'Timetable not found' });
    }
  } catch (error) {
    console.error('Error getting timetable:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all timetables
exports.getAllTimetables = (req, res) => {
  try {
    const db = readDb();
    res.json(db.timetables || []);
  } catch (error) {
    console.error('Error getting timetables:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
