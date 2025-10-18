import React, { useState } from 'react';

const VideoUploader = ({ onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    stream: 'general',
    videoUrl: '',
    duration: '',
    tags: ''
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const teacherId = localStorage.getItem('teacherId');

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('subject', formData.subject);
      submitData.append('class', formData.class);
      submitData.append('stream', formData.stream);
      submitData.append('duration', formData.duration);
      submitData.append('tags', formData.tags);
      submitData.append('teacherId', teacherId);
      submitData.append('teacherName', localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'));

      if (selectedFile) {
        submitData.append('videoFile', selectedFile);
      } else if (formData.videoUrl) {
        submitData.append('videoUrl', formData.videoUrl);
      } else {
        throw new Error('Please select a file or provide a video URL');
      }

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
          alert('Video uploaded successfully!');
          onUpload && onUpload(result.video);
          onClose();
        } else {
          const error = JSON.parse(xhr.responseText);
          throw new Error(error.message);
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('POST', 'http://localhost:5001/api/recorded-videos/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(submitData);

    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video: ' + error.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
        <h2>Upload Recorded Video</h2>
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
                placeholder="Video title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="e.g., Mathematics, Physics"
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
              placeholder="Brief description of the video content"
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
              <label htmlFor="stream">Stream</label>
              <select
                id="stream"
                name="stream"
                value={formData.stream}
                onChange={handleChange}
              >
                <option value="general">General</option>
                <option value="science">Science</option>
                <option value="commerce">Commerce</option>
                <option value="arts">Arts</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 45"
                min="1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Comma-separated tags"
              />
            </div>
          </div>

          <div className="upload-section">
            <div className="form-group">
              <label htmlFor="videoFile">Upload Video File</label>
              <input
                type="file"
                id="videoFile"
                name="videoFile"
                onChange={handleFileChange}
                accept="video/*"
                disabled={!!formData.videoUrl}
              />
              <small className="form-hint">
                Supported formats: MP4, MOV, AVI (Max 500MB)
              </small>
            </div>

            <div className="or-divider">
              <span>OR</span>
            </div>

            <div className="form-group">
              <label htmlFor="videoUrl">Video URL</label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/... or https://vimeo.com/..."
                disabled={!!selectedFile}
              />
              <small className="form-hint">
                YouTube, Vimeo, or direct video links
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
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUploader;
