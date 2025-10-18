import React from 'react';

const MaterialCard = ({ material, isTeacher = false, onDownload, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return '📄';

    const extension = fileUrl.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📕',
      doc: '📄',
      docx: '📄',
      ppt: '📊',
      pptx: '📊',
      xls: '📈',
      xlsx: '📈',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      zip: '📦',
      rar: '📦'
    };

    return iconMap[extension] || '📄';
  };

  const getFileSize = (fileUrl) => {
    // This would normally come from the backend
    // For now, return a placeholder
    return '2.3 MB';
  };

  const handleDownload = () => {
    if (material.fileUrl) {
      const downloadUrl = material.fileUrl.startsWith('http')
        ? material.fileUrl
        : `http://localhost:5001${material.fileUrl}`;
      window.open(downloadUrl, '_blank');
      onDownload && onDownload(material._id);
    }
  };

  return (
    <div className="material-card">
      <div className="material-header">
        <div className="file-icon">
          {getFileIcon(material.fileUrl)}
        </div>
        {isTeacher && (
          <div className="material-actions">
            <button className="edit-btn" onClick={() => onEdit(material)}>✏️</button>
            <button className="delete-btn" onClick={() => onDelete(material._id)}>🗑️</button>
          </div>
        )}
      </div>

      <div className="material-content">
        <h3 className="material-title">{material.title}</h3>
        {material.description && (
          <p className="material-description">{material.description}</p>
        )}

        <div className="material-details">
          <div className="detail-item">
            <span className="icon">📚</span>
            <span>{material.subject}</span>
          </div>
          <div className="detail-item">
            <span className="icon">🏫</span>
            <span>Grade {material.class}</span>
          </div>
          <div className="detail-item">
            <span className="icon">📅</span>
            <span>{formatDate(material.createdAt)}</span>
          </div>
          {material.fileUrl && (
            <div className="detail-item">
              <span className="icon">💾</span>
              <span>{getFileSize(material.fileUrl)}</span>
            </div>
          )}
        </div>

        <div className="material-footer">
          <button
            className="download-btn"
            onClick={handleDownload}
            disabled={!material.fileUrl}
          >
            📥 Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
