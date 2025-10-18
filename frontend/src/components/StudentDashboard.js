import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import StudentSchedule from './StudentSchedule';
import QuizPage from './QuizPage';
import StudentSettings from './StudentSettings';
import LiveClassCard from './LiveClassCard';
import VideoPlayer from './VideoPlayer';
import MaterialCard from './MaterialCard';

const StudentDashboard = ({ username, onLogout }) => {
  const navigate = useNavigate();


  // --- NEW STATE FOR SHIKSHA DASHBOARD ---
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [liveClassesView, setLiveClassesView] = useState([]);
  const [recordedVideosView, setRecordedVideosView] = useState([]);
  const [materialsView, setMaterialsView] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quizData, setQuizData] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizTimeLeft, setQuizTimeLeft] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // New state for Live Classes, Recorded Videos, and Materials
  const [liveClasses, setLiveClasses] = useState([]);
  const [recordedVideos, setRecordedVideos] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Get user's first name from username/email
  const getUserFirstName = (username) => {
    if (!username) return 'Student';
    // If username contains email format, extract name part
    if (username.includes('@')) {
      return username.split('@')[0].split('.')[0];
    }
    // If username has spaces or camelCase, format it
    return username.split(' ')[0].split('.')[0];
  };

  const userDisplayName = getUserFirstName(username);

  // Sample data for stats cards - Subject specific
  const [statsData] = useState([
    {
      id: 1,
      title: 'Chapters in Progress',
      value: '8',
      icon: '📖',
      color: 'orange',
      bgColor: 'rgba(255, 107, 53, 0.1)'
    },
    {
      id: 2,
      title: 'Chapters Completed',
      value: '24',
      icon: '✅',
      color: 'green',
      bgColor: 'rgba(34, 197, 94, 0.1)'
    },
    {
      id: 3,
      title: 'Tests Passed',
      value: '12',
      icon: '🏆',
      color: 'blue',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      id: 4,
      title: 'Study Streak',
      value: '15',
      icon: '🔥',
      color: 'purple',
      bgColor: 'rgba(147, 51, 234, 0.1)'
    }
  ]);

  // Activity Hours data
  const [activityData] = useState([
    { day: 'S', hours: 2 },
    { day: 'M', hours: 4 },
    { day: 'T', hours: 3 },
    { day: 'W', hours: 8 },
    { day: 'T', hours: 6 },
    { day: 'F', hours: 5 },
    { day: 'S', hours: 7 }
  ]);

  // Performance data (mock data for the chart)
  const [performanceData] = useState([
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 78 },
    { month: 'Mar', value: 82 },
    { month: 'Apr', value: 75 },
    { month: 'May', value: 88 },
    { month: 'Jun', value: 92 }
  ]);

  // Subject/Chapter assignments data
  const [assignmentsData] = useState([
    {
      id: 1,
      task: 'English Chapter 1: Parts of Speech',
      grade: '85/100',
      status: 'Completed',
      dueDate: 'Today, 10:30 AM',
      icon: '📝',
      subject: 'English',
      chapter: 'Chapter 1'
    },
    {
      id: 2,
      task: 'Mathematics Chapter 3: Algebra Basics',
      grade: '92/100',
      status: 'Completed',
      dueDate: 'Yesterday, 2:30 PM',
      icon: '🧮',
      subject: 'Mathematics',
      chapter: 'Chapter 3'
    },
    {
      id: 3,
      task: 'Science Chapter 2: Cell Structure',
      grade: '-/100',
      status: 'In Progress',
      dueDate: 'Tomorrow, 9:00 AM',
      icon: '🔬',
      subject: 'Science',
      chapter: 'Chapter 2'
    },
    {
      id: 4,
      task: 'History Chapter 1: Ancient India',
      grade: '78/100',
      status: 'Completed',
      dueDate: '2 days ago',
      icon: '📚',
      subject: 'History',
      chapter: 'Chapter 1'
    }
  ]);

  // Upcoming Events data
  const [eventsData] = useState([
    {
      id: 1,
      title: 'Team Meetup',
      type: 'meeting',
      date: 'Mon',
      time: '10:30'
    },
    {
      id: 2,
      title: 'Illustration',
      type: 'task',
      date: 'Tue',
      time: '11:30'
    },
    {
      id: 3,
      title: 'Research',
      type: 'research',
      date: 'Wed',
      time: '12:30'
    },
    {
      id: 4,
      title: 'Present',
      type: 'presentation',
      date: 'Thu',
      time: '13:30'
    },
    {
      id: 5,
      title: 'Report',
      type: 'report',
      date: 'Sat',
      time: '14:30'
    }
  ]);

  // Enrolled subjects and chapters (what student is actually taking)
  const [enrolledSubjects] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      chapters: [
        { id: 1, name: 'Chapter 1: Linear Equations', completed: true, progress: 100, lastAccessed: '2024-02-15' },
        { id: 2, name: 'Chapter 2: Polynomials', completed: true, progress: 100, lastAccessed: '2024-02-14' },
        { id: 3, name: 'Chapter 3: Algebra Basics', completed: true, progress: 92, lastAccessed: '2024-02-13' },
        { id: 4, name: 'Chapter 4: Quadratic Equations', completed: false, progress: 65, lastAccessed: '2024-02-16' },
        { id: 5, name: 'Chapter 5: Geometry', completed: false, progress: 0, lastAccessed: null }
      ],
      teacher: 'Prof. Sharma',
      overallProgress: 68
    },
    {
      id: 2,
      subject: 'English',
      chapters: [
        { id: 1, name: 'Chapter 1: Parts of Speech', completed: true, progress: 85, lastAccessed: '2024-02-13' },
        { id: 2, name: 'Chapter 2: Tenses', completed: false, progress: 45, lastAccessed: '2024-02-16' },
        { id: 3, name: 'Chapter 3: Sentences', completed: false, progress: 0, lastAccessed: null }
      ],
      teacher: 'Prof. Johnson',
      overallProgress: 43
    },
    {
      id: 3,
      subject: 'Physics',
      chapters: [
        { id: 1, name: 'Chapter 1: Motion', completed: true, progress: 78, lastAccessed: '2024-02-12' },
        { id: 2, name: 'Chapter 2: Forces', completed: false, progress: 30, lastAccessed: '2024-02-15' },
        { id: 3, name: 'Chapter 3: Laws of Motion', completed: false, progress: 0, lastAccessed: null }
      ],
      teacher: 'Prof. Kumar',
      overallProgress: 36
    },
    {
      id: 4,
      subject: 'Chemistry',
      chapters: [
        { id: 1, name: 'Chapter 1: Matter', completed: true, progress: 88, lastAccessed: '2024-02-11' },
        { id: 2, name: 'Chapter 2: Atoms', completed: false, progress: 0, lastAccessed: null }
      ],
      teacher: 'Prof. Singh',
      overallProgress: 44
    }
  ]);

  // Today's subjects assigned by teacher
  const [todaySubjects] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      chapter: 'Chapter 4: Quadratic Equations',
      teacher: 'Prof. Sharma',
      time: '09:00 AM - 10:30 AM',
      status: 'scheduled',
      completed: false
    },
    {
      id: 2,
      subject: 'English',
      chapter: 'Chapter 2: Tenses',
      teacher: 'Prof. Johnson',
      time: '11:00 AM - 12:30 PM',
      status: 'scheduled',
      completed: false
    }
  ]);

  // Completed subjects/chapters
  const [completedSubjects] = useState([
    { subject: 'Mathematics', chapter: 'Chapter 1: Linear Equations', completedDate: '2024-02-15' },
    { subject: 'Mathematics', chapter: 'Chapter 2: Polynomials', completedDate: '2024-02-14' },
    { subject: 'English', chapter: 'Chapter 1: Parts of Speech', completedDate: '2024-02-13' },
    { subject: 'Science', chapter: 'Chapter 1: Matter', completedDate: '2024-02-12' },
    { subject: 'History', chapter: 'Chapter 1: Ancient India', completedDate: '2024-02-11' }
  ]);

  // Test data for demonstration
  const [testResults] = useState([
    { test: 'Math Quiz 1', score: '85%', status: 'passed' },
    { test: 'Science Test', score: '92%', status: 'passed' },
    { test: 'English Exam', score: '78%', status: 'passed' }
  ]);

  // Handle test button click
  const handleTestClick = () => {
    alert('Test functionality - You can integrate with your testing system here!');
  };

  // Handle marking subject as complete
  const markSubjectComplete = (subjectId) => {
    // In a real app, this would make an API call to update the subject status
    alert(`Subject ${subjectId} marked as complete!`);
  };

  // Handle subject/chapter click
  const handleSubjectClick = (subjectName, chapter) => {
    // In a real app, this would navigate to the specific subject content
    alert(`Opening ${subjectName} - ${chapter}. Here you would see the actual lesson content, videos, materials, etc.`);
  };

  // Fetch live classes, recorded videos, and materials
  const fetchLiveClasses = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/live-classes');
      if (response.ok) {
        const data = await response.json();
        setLiveClasses(data.liveClasses || []);
      }
    } catch (error) {
      console.error('Error fetching live classes:', error);
    }
  };

  const fetchRecordedVideos = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/recorded-videos');
      if (response.ok) {
        const data = await response.json();
        setRecordedVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching recorded videos:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/materials/student/10/all');
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  // Handle video selection for playing
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };

  // Handle material download
  const handleMaterialDownload = (material) => {
    // In a real app, this would trigger a download
    alert(`Downloading ${material.title}...`);
  };

  // Handle joining live class
  const handleJoinLiveClass = (liveClass) => {
    // In a real app, this would open the live class in a video conference
    alert(`Joining live class: ${liveClass.title}`);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchLiveClasses();
    fetchRecordedVideos();
    fetchMaterials();
  }, []);


  // --- NEW FUNCTIONS ---
  const handleNavClick = (navItem) => {
    setActiveNavItem(navItem);

    // Navigation routing using React Router
    switch(navItem) {
      case 'courses':
        navigate('/student-courses');
        break;
      case 'chat':
        navigate('/chat');
        break;
      case 'grades':
        // For now, navigate to home - you can create a grades page later
        navigate('/');
        break;
      case 'schedule':
        // Show schedule content in dashboard
        break;
      case 'settings':
        // Show settings content in dashboard
        break;
      case 'quiz':
        // Stay on dashboard and show quiz content
        break;
      default:
        // Stay on dashboard
        break;
    }
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(' ', '-');
  };

  const getEventColor = (type) => {
    const colors = {
      meeting: '#FF6B35',
      task: '#1A202C',
      research: '#4299E1',
      presentation: '#FF6B35',
      report: '#48BB78'
    };
    return colors[type] || '#4299E1';
  };

  return (
    <div className="shiksha-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="shiksha-logo">
            <img
              src="/images/shikhsa_logo.png"
              alt="Shiksha Logo"
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="logo-icon">🎓</div>
            <span className="shiksha-name">Shiksha</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeNavItem === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </div>
          <div
            className={`nav-item ${activeNavItem === 'courses' ? 'active' : ''}`}
            onClick={() => handleNavClick('courses')}
          >
            <span className="nav-icon">📚</span>
            <span className="nav-text">Courses</span>
          </div>
          <div
            className={`nav-item ${activeNavItem === 'chat' ? 'active' : ''}`}
            onClick={() => handleNavClick('chat')}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Chat</span>
          </div>
          <div
            className={`nav-item ${activeNavItem === 'grades' ? 'active' : ''}`}
            onClick={() => handleNavClick('grades')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Grades</span>
          </div>
          <div
            className={`nav-item ${activeNavItem === 'schedule' ? 'active' : ''}`}
            onClick={() => handleNavClick('schedule')}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-text">Schedule</span>
          </div>
          <div
            className={`nav-item ${activeNavItem === 'quiz' ? 'active' : ''}`}
            onClick={() => handleNavClick('quiz')}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">Quiz</span>
          </div>
          <div
            className={`nav-item ${activeNavItem === 'live-classes' ? 'active' : ''}`}
            onClick={() => handleNavClick('live-classes')}
          >
            <span className="nav-icon">🎥</span>
            <span className="nav-text">Live Classes</span>
          </div>
          <div
            className={`nav-item ${activeNavItem === 'recorded-videos' ? 'active' : ''}`}
            onClick={() => handleNavClick('recorded-videos')}
          >
            <span className="nav-icon">📹</span>
            <span className="nav-text">Recorded Videos</span>
          </div>
          <div
            className={`nav-item ${activeNavItem === 'materials' ? 'active' : ''}`}
            onClick={() => handleNavClick('materials')}
          >
            <span className="nav-icon">📄</span>
            <span className="nav-text">Materials</span>
          </div>
          <div
            className={`nav-item ${activeNavItem === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>

      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="greeting-section">
            <h1>Hello {userDisplayName} 👋</h1>
            <p>Let's learn something new today!</p>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <input type="text" placeholder="Search" />
              <button className="search-btn">🔍</button>
            </div>
            <button className="profile-btn">Profile</button>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeNavItem === 'schedule' ? (
          <StudentSchedule studentClass={8} studentStream="general" />
        ) : activeNavItem === 'quiz' ? (
          <QuizPage studentId={username} onBack={() => setActiveNavItem('dashboard')} />
        ) : activeNavItem === 'settings' ? (
          <StudentSettings username={username} onBack={() => setActiveNavItem('dashboard')} />
        ) : activeNavItem === 'live-classes' ? (
          <div className="live-classes-view">
            <h1>Live Classes</h1>
            <div className="live-classes-grid">
              {liveClasses.length > 0 ? (
                liveClasses.map(liveClass => (
                  <LiveClassCard
                    key={liveClass.id}
                    liveClass={liveClass}
                    onJoin={handleJoinLiveClass}
                  />
                ))
              ) : (
                <p>No live classes scheduled.</p>
              )}
            </div>
          </div>
        ) : activeNavItem === 'recorded-videos' ? (
          <div className="recorded-videos-view">
            <h1>Recorded Videos</h1>
            <div className="videos-grid">
              {recordedVideos.length > 0 ? (
                recordedVideos.map(video => (
                  <div key={video.id} className="video-card" onClick={() => handleVideoSelect(video)}>
                    <div className="video-thumbnail">
                      <img src={video.thumbnail || '/images/video-placeholder.png'} alt={video.title} />
                      <div className="play-icon">▶️</div>
                    </div>
                    <div className="video-info">
                      <h3>{video.title}</h3>
                      <p>{video.subject} - {video.chapter}</p>
                      <p>Duration: {video.duration}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recorded videos available.</p>
              )}
            </div>
          </div>
        ) : activeNavItem === 'materials' ? (
          <div className="materials-view">
            <h1>Study Materials</h1>
            <div className="materials-grid">
              {materials.length > 0 ? (
                materials.map(material => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onDownload={handleMaterialDownload}
                  />
                ))
              ) : (
                <p>No study materials available.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-cards">
              {statsData.map(stat => (
                <div key={stat.id} className="stat-card" style={{backgroundColor: stat.bgColor}}>
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-info">
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Chart */}
            <div className="activity-chart">
              <h2>Activity Hours</h2>
              <div className="chart-bars">
                {activityData.map((day, index) => (
                  <div key={index} className="bar-container">
                    <div className="bar" style={{height: `${day.hours * 10}px`}}></div>
                    <span className="day-label">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Chart */}
            <div className="performance-chart">
              <h2>Performance Trend</h2>
              <div className="chart-line">
                {performanceData.map((point, index) => (
                  <div key={index} className="point" style={{left: `${index * 100}px`, bottom: `${point.value}px`}}>
                    {point.value}
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments */}
            <div className="assignments-section">
              <h2>Recent Assignments</h2>
              {assignmentsData.map(assignment => (
                <div key={assignment.id} className="assignment-card">
                  <div className="assignment-icon">{assignment.icon}</div>
                  <div className="assignment-info">
                    <h3>{assignment.task}</h3>
                    <p>Grade: {assignment.grade}</p>
                    <p>Due: {assignment.dueDate}</p>
                  </div>
                  <div className={`assignment-status ${getStatusClass(assignment.status)}`}>
                    {assignment.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming Events */}
            <div className="events-section">
              <h2>Upcoming Events</h2>
              {eventsData.map(event => (
                <div key={event.id} className="event-card" style={{borderLeftColor: getEventColor(event.type)}}>
                  <div className="event-time">
                    <span className="event-date">{event.date}</span>
                    <span className="event-time">{event.time}</span>
                  </div>
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p>{event.type}</p>
                  </div>
                </div>
              ))}
            </div>


          </div>
        )}

        {/* Video Player Modal */}
        {showVideoPlayer && selectedVideo && (
          <div className="video-player-modal">
            <div className="video-player-overlay" onClick={() => setShowVideoPlayer(false)}></div>
            <div className="video-player-content">
              <button className="close-btn" onClick={() => setShowVideoPlayer(false)}>✕</button>
              <VideoPlayer video={selectedVideo} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
