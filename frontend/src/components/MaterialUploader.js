import React, { useState } from 'react';

const MaterialUploader = ({ onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    class: '',
    fileType: 'document'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    // Auto-fill title if empty
    if (!formData.title && file) {
      const title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setFormData(prev => ({ ...prev, title }));
    }

    // Auto-detect file type
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      let fileType = 'document';
      if (['pdf', 'doc', 'docx'].includes(extension)) {
        fileType = 'document';
      } else if (['ppt', 'pptx'].includes(extension)) {
        fileType = 'presentation';
      } else if (['xls', 'xlsx'].includes(extension)) {
        fileType = 'spreadsheet';
      } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
        fileType = 'image';
      }
      setFormData(prev => ({ ...prev, fileType }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const teacherId = localStorage.getItem('teacherId');

      if (!selectedFile) {
        throw new Error('Please select a file to upload');
      }

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('courseId', formData.courseId);
      submitData.append('class', formData.class);
      submitData.append('fileType', formData.fileType);
      submitData.append('teacherId', teacherId);
      submitData.append('teacherName', localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'));
      submitData.append('materialFile', selectedFile);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 201) {
          const result = JSON.parse(xhr.responseText);
          alert('Material uploaded successfully!');
          onUpload && onUpload(result.material);
          onClose();
        } else {
          const error = JSON.parse(xhr.responseText);
          throw new Error(error.message);
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('POST', 'http://localhost:5001/api/materials/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(submitData);

    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Failed to upload material: ' + error.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
        <h2>Upload Study Material</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Material title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="courseId">Course ID *</label>
              <input
                type="text"
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
                placeholder="e.g., MATH101, PHYSICS"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the material"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="class">Class *</label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
              >
                <option value="">Select Class</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="fileType">File Type</label>
              <select
                id="fileType"
                name="fileType"
                value={formData.fileType}
                onChange={handleChange}
              >
                <option value="document">Document</option>
                <option value="presentation">Presentation</option>
                <option value="spreadsheet">Spreadsheet</option>
                <option value="image">Image</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="upload-section">
            <div className="form-group">
              <label htmlFor="materialFile">Upload Material File *</label>
              <input
                type="file"
                id="materialFile"
                name="materialFile"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                required
              />
              <small className="form-hint">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG, GIF, TXT
              </small>
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{uploadProgress}% uploaded</span>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialUploader;
