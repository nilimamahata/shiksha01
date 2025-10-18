import React, { useState, useEffect } from 'react';

const LiveClassCard = ({ liveClass, isTeacher = false, onJoin, onEdit, onDelete }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const classTime = new Date(liveClass.scheduledDate);
      const diff = classTime - now;

      if (diff <= 0) {
        // Class has started or passed
        const endTime = new Date(classTime.getTime() + liveClass.duration * 60000);
        if (now <= endTime) {
          setIsLive(true);
          setTimeLeft('LIVE');
          setCanJoin(true);
        } else {
          setIsLive(false);
          setTimeLeft('ENDED');
          setCanJoin(false);
        }
      } else {
        // Class is upcoming
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
          setTimeLeft(`Starts in ${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`Starts in ${minutes}m`);
        }
        setCanJoin(false);
        setIsLive(false);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [liveClass.scheduledDate, liveClass.duration]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleJoin = () => {
    if (canJoin && liveClass.meetingLink) {
      window.open(liveClass.meetingLink, '_blank');
      onJoin && onJoin(liveClass._id);
    }
  };

  return (
    <div className={`live-class-card ${isLive ? 'live' : ''}`}>
      <div className="class-header">
        <div className="class-status">
          <span className={`status-indicator ${isLive ? 'live' : 'upcoming'}`}></span>
          <span className="status-text">{timeLeft}</span>
        </div>
        {isTeacher && (
          <div className="class-actions">
            <button className="edit-btn" onClick={() => onEdit(liveClass)}>✏️</button>
            <button className="delete-btn" onClick={() => onDelete(liveClass._id)}>🗑️</button>
          </div>
        )}
      </div>

      <div className="class-content">
        <h3 className="class-title">{liveClass.title}</h3>
        <p className="class-description">{liveClass.description}</p>

        <div className="class-details">
          <div className="detail-item">
            <span className="icon">📚</span>
            <span>{liveClass.subject}</span>
          </div>
          <div className="detail-item">
            <span className="icon">🏫</span>
            <span>Grade {liveClass.class} {liveClass.stream !== 'general' ? `(${liveClass.stream})` : ''}</span>
          </div>
          <div className="detail-item">
            <span className="icon">👨‍🏫</span>
            <span>{liveClass.teacherName}</span>
          </div>
          <div className="detail-item">
            <span className="icon">⏰</span>
            <span>{formatDate(liveClass.scheduledDate)}</span>
          </div>
          <div className="detail-item">
            <span className="icon">🕒</span>
            <span>{liveClass.duration} minutes</span>
          </div>
        </div>

        {liveClass.attendees && liveClass.attendees.length > 0 && (
          <div className="attendees-info">
            <span className="icon">👥</span>
            <span>{liveClass.attendees.length} student{liveClass.attendees.length !== 1 ? 's' : ''} joined</span>
          </div>
        )}

        <div className="class-actions">
          {canJoin ? (
            <button
              className="join-btn live"
              onClick={handleJoin}
              disabled={!liveClass.meetingLink}
            >
              🎥 Join Live Class
            </button>
          ) : isLive ? (
            <button className="join-btn waiting" disabled>
              ⏳ Class in Progress
            </button>
          ) : (
            <button className="join-btn upcoming" disabled>
              📅 Upcoming Class
            </button>
          )}

          {!isTeacher && !canJoin && (
            <button className="remind-btn">
              🔔 Remind Me
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveClassCard;
