const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  uploadMaterial,
  getMaterialsByCourse,
  getMaterialsByTeacher,
  getStudentMaterials,
  updateMaterial,
  deleteMaterial,
  getAllMaterials
} = require('../controllers/materialController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
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
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Student routes (no auth required for viewing materials)
router.get('/student/:class/:subject', getStudentMaterials);
router.get('/student/:class', getStudentMaterials);
router.get('/course/:courseId', getMaterialsByCourse);

// All other routes require authentication
router.use(verifyToken);

// Teacher routes
router.post('/upload', upload.single('materialFile'), uploadMaterial);
router.get('/teacher/:teacherId', getMaterialsByTeacher);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

// Admin routes
router.get('/all', getAllMaterials);

module.exports = router;
