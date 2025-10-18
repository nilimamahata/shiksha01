import React, { useState, useRef, useEffect } from 'react';

const VideoPlayer = ({ video, onClose, onWatchUpdate }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [watchProgress, setWatchProgress] = useState(0);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => {
      setCurrentTime(videoElement.currentTime);
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      setWatchProgress(progress);
    };

    const updateDuration = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = async () => {
      setIsPlaying(false);
      // Mark video as watched
      await markAsWatched(100);
    };

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('ended', handleEnded);

    // Auto-hide controls
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    videoElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const markAsWatched = async (progress) => {
    try {
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem('userId') || localStorage.getItem('username');

      await fetch(`http://localhost:5001/api/recorded-videos/${video._id}/watch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId,
          studentName: localStorage.getItem('firstName') + ' ' + localStorage.getItem('lastName'),
          progress: Math.round(progress)
        })
      });

      onWatchUpdate && onWatchUpdate(video._id, progress);
    } catch (error) {
      console.error('Error marking video as watched:', error);
    }
  };

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const videoElement = videoRef.current;
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    videoElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (isMuted) {
      videoElement.volume = volume;
      setIsMuted(false);
    } else {
      videoElement.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current.parentElement;
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVideoSrc = () => {
    if (video.videoUrl.startsWith('http')) {
      return video.videoUrl;
    }
    return `http://localhost:5001${video.videoUrl}`;
  };

  return (
    <div className="video-player-modal" onClick={onClose}>
      <div className="video-player-container" onClick={e => e.stopPropagation()}>
        <div className="video-header">
          <h3>{video.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="video-wrapper">
          <video
            ref={videoRef}
            src={getVideoSrc()}
            onClick={togglePlay}
            onDoubleClick={toggleFullscreen}
            preload="metadata"
          />

          <div className={`video-controls ${showControls ? 'visible' : ''}`}>
            <div className="progress-bar" onClick={handleSeek}>
              <div
                className="progress-fill"
                style={{ width: `${watchProgress}%` }}
              ></div>
            </div>

            <div className="controls-row">
              <div className="left-controls">
                <button className="control-btn play-btn" onClick={togglePlay}>
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                <span className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="right-controls">
                <div className="volume-control">
                  <button className="control-btn volume-btn" onClick={toggleMute}>
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>

                <button className="control-btn fullscreen-btn" onClick={toggleFullscreen}>
                  {isFullscreen ? '🗗' : '🗖'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="video-info">
          <div className="video-details">
            <p className="subject-tag">{video.subject} - Grade {video.class}</p>
            {video.description && <p className="description">{video.description}</p>}
            <div className="video-stats">
              <span>👁️ {video.views || 0} views</span>
              {video.tags && video.tags.length > 0 && (
                <span>🏷️ {video.tags.join(', ')}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
