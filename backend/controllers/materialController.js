const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');

// Upload a new material
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, description, courseId, teacherId, class: classLevel, subject } = req.body;

    if (!title || !courseId || !teacherId || !classLevel || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Title, courseId, teacherId, class, and subject are required'
      });
    }

    const material = new Material({
      title,
      description,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      courseId,
      teacherId,
      class: classLevel,
      subject
    });

    await material.save();

    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      material
    });
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading material'
    });
  }
};

// Get all materials for a specific course
exports.getMaterialsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const materials = await Material.find({ courseId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      materials
    });
  } catch (error) {
    console.error('Get materials by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching materials'
    });
  }
};

// Get all materials uploaded by a specific teacher
exports.getMaterialsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const materials = await Material.find({ teacherId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      materials
    });
  } catch (error) {
    console.error('Get materials by teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching materials'
    });
  }
};

// Get materials for students (by class and subject)
exports.getStudentMaterials = async (req, res) => {
  try {
    const { class: classLevel, subject } = req.params;
    const query = { class: classLevel };

    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    const materials = await Material.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      materials
    });
  } catch (error) {
    console.error('Get student materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching materials'
    });
  }
};

// Update a material
exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const material = await Material.findByIdAndUpdate(id, updateData, { new: true });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    res.json({
      success: true,
      message: 'Material updated successfully',
      material
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating material'
    });
  }
};

// Delete a material
exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Delete file if it exists
    if (material.fileUrl && material.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Material.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting material'
    });
  }
};

// Get all materials (for admin purposes)
exports.getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      materials
    });
  } catch (error) {
    console.error('Get all materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching materials'
    });
  }
};
