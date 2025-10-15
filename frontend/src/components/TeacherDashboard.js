import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

import './TeacherDashboard.css';

const TeacherDashboard = ({ username, onLogout }) => {
  const navigate = useNavigate();

  console.log('🚀 MODERN TEACHER DASHBOARD LOADED!');
  console.log('Username:', username);
  console.log('Teacher ID from localStorage:', localStorage.getItem('teacherId'));

  // --- STATE ---
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tests, setTests] = useState([]);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State for Upload Modal & Form
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);


  // State for Video Calling
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [socket, setSocket] = useState(null);
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  const [selectedCamera, setSelectedCamera] = useState('front');
  const [availableCameras, setAvailableCameras] = useState([]);

  const [newMaterialData, setNewMaterialData] = useState({
    title: '',
    description: '',
    courseId: '',
    class: '',

  });
  const [newTestData, setNewTestData] = useState({
    title: '',
    description: '',
    courseId: '',
    questions: [],
    duration: 60
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchTeacherData = useCallback(async () => {
    try {
      const teacherId = localStorage.getItem('teacherId') || username;
      console.log('🔍 Fetching data for teacher ID:', teacherId);

      // Fetch teacher permissions and assigned courses
      const teacherResponse = await fetch(`http://localhost:5001/api/admin/teachers/${teacherId}`);
      if (teacherResponse.ok) {
        const teacher = await teacherResponse.json();
        console.log('👨‍🏫 Teacher data loaded:', teacher);
        console.log('🔐 Teacher permissions:', teacher.permissions);
        setTeacherData(teacher);
      } else {
        console.log('❌ Teacher data not found, response status:', teacherResponse.status);
        console.log('❌ Response:', await teacherResponse.text());

        // Set default permissions if teacher data is not found
        console.log('🔧 Setting default permissions for teacher');
        setTeacherData({
          permissions: {
            canUploadMaterials: true,
            canCreateTests: true,
            canManageStudents: true
          },
          subjects: [],
          assignedClasses: []
        });

      }

      // Fetch courses assigned to this teacher
      const coursesResponse = await fetch(`http://localhost:5001/api/admin/courses?teacherId=${teacherId}`);
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        console.log('📚 Courses loaded:', coursesData.length);
        setCourses(coursesData);
      }

      // Fetch materials uploaded by this teacher
      const materialsResponse = await fetch(`http://localhost:5001/api/materials/teacher/${teacherId}`);
      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json();
        console.log('📄 Materials loaded:', materialsData.length);
        setMaterials(materialsData);
      }

      // Fetch tests created by this teacher
      const testsResponse = await fetch(`http://localhost:5001/api/tests/teacher/${teacherId}`);
      if (testsResponse.ok) {
        const testsData = await testsResponse.json();
        console.log('📝 Tests loaded:', testsData.length);
        setTests(testsData);
      }

    } catch (error) {
      console.error('❌ Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // --- EFFECTS ---
  useEffect(() => {
    fetchTeacherData();

    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('teacherDashboardDarkMode') === 'true';
    setIsDarkMode(savedDarkMode);
  }, [fetchTeacherData]);

  // Apply dark mode class when isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);



  // Handler for timetable changes
  const handleTimetableChange = (day, period, subject) => {
    setTimetable(prev => {
      const newTimetable = { ...prev };
      if (!newTimetable[selectedClass]) newTimetable[selectedClass] = {};
      if (!newTimetable[selectedClass][selectedStream]) newTimetable[selectedClass][selectedStream] = {};
      if (!newTimetable[selectedClass][selectedStream][day]) newTimetable[selectedClass][selectedStream][day] = {};
      newTimetable[selectedClass][selectedStream][day][period] = subject;
      return newTimetable;
    });
  };

  const handleSaveTimetable = async () => {
    try {
      const teacherId = localStorage.getItem('teacherId') || username;
      const response = await fetch('http://localhost:5001/api/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: selectedClass,
          stream: selectedStream,
          timetable,
          teacherId
        }),
      });
      if (response.ok) {
        alert('Timetable saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to save timetable: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      alert('Failed to save timetable');
    }
  };

  // Add a refresh function for manual data refresh
  const refreshData = () => {
    setLoading(true);
    fetchTeacherData();
  };

  // --- HANDLERS ---
  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    // Save preference to localStorage
    localStorage.setItem('teacherDashboardDarkMode', newDarkMode.toString());

    // Apply dark mode class to body and html elements
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    }

  };

  // --- HANDLERS for Upload Form ---
  const handleMaterialChange = (e) => {
    const { name, value } = e.target;
    setNewMaterialData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !newMaterialData.courseId || !newMaterialData.title || !newMaterialData.class) {
      alert('Please fill out all required fields: title, course, class, and choose a file.');

      return;
    }

    // Check permissions
    if (!teacherData?.permissions?.canUploadMaterials) {
      alert('You do not have permission to upload materials.');
      return;
    }

    // FormData is required for sending files
    const formData = new FormData();
    formData.append('title', newMaterialData.title);
    formData.append('description', newMaterialData.description);
    formData.append('courseId', newMaterialData.courseId);
    formData.append('class', newMaterialData.class);
    formData.append('teacherId', localStorage.getItem('teacherId') || username);
    formData.append('materialFile', selectedFile);

    try {
      const response = await fetch('http://localhost:5001/api/materials/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Material uploaded successfully!');
        setShowUploadModal(false);
        setNewMaterialData({ title: '', description: '', courseId: '', class: '' });

        setSelectedFile(null);
        fetchTeacherData(); // Refresh data
      } else {
        throw new Error(result.message || 'Failed to upload material.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.message);
    }
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    console.log('🧪 Test submit triggered');
    console.log('📝 Test data:', newTestData);


    if (!teacherData?.permissions?.canCreateTests) {
      alert('You do not have permission to create tests.');
      return;
    }

    if (!newTestData.title || !newTestData.courseId || newTestData.questions.length === 0) {
      alert('Please fill out the title, select a course, and add at least one question.');
      return;
    }

    console.log('✅ All validations passed, submitting test...');


    const testData = {
      ...newTestData,
      teacherId: localStorage.getItem('teacherId') || username
    };

    try {
      const response = await fetch('http://localhost:5001/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Test created successfully!');
        setShowTestModal(false);
        setNewTestData({ title: '', description: '', courseId: '', questions: [], duration: 60 });
        fetchTeacherData(); // Refresh data
      } else {
        throw new Error(result.message || 'Failed to create test.');
      }
    } catch (error) {
      console.error('Test creation error:', error);
      alert(error.message);
    }
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setNewMaterialData({
      title: material.title,
      description: material.description || '',
      courseId: material.courseId,
      class: material.class || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!teacherData?.permissions?.canUploadMaterials) {
      alert('You do not have permission to edit materials.');
      return;
    }

    const updateData = {
      title: newMaterialData.title,
      description: newMaterialData.description,
      courseId: newMaterialData.courseId,
      class: newMaterialData.class,
    };

    try {
      const response = await fetch(`http://localhost:5001/api/materials/${editingMaterial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Material updated successfully!');
        setShowEditModal(false);
        setEditingMaterial(null)
        setNewMaterialData({ title: '', description: '', courseId: '', class: '' });

        fetchTeacherData(); // Refresh data
      } else {
        throw new Error(result.message || 'Failed to update material.');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert(error.message);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/materials/${materialId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Material deleted successfully!');
        fetchTeacherData(); // Refresh data
      } else {
        throw new Error('Failed to delete material.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message);
    }
  };

  const handleConductTest = async (testId) => {
    if (!teacherData?.permissions?.canCreateTests) {
      alert('You do not have permission to conduct tests.');
      return;
    }

    try {
      // Start the test session
      const response = await fetch(`http://localhost:5001/api/tests/${testId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: localStorage.getItem('teacherId') || username }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Test started successfully! Test ID: ${result.testSessionId}`);
        fetchTeacherData(); // Refresh data
      } else {
        throw new Error(result.message || 'Failed to start test.');
      }
    } catch (error) {
      console.error('Test conduct error:', error);
      alert(error.message);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/tests/${testId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Test deleted successfully!');
        fetchTeacherData(); // Refresh data
      } else {
        throw new Error('Failed to delete test.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message);
    }
  };

  const addQuestion = () => {
    setNewTestData(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setNewTestData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };


  // Video Calling Functions
  const fetchAvailableStudents = async () => {
    try {
      const teacherId = localStorage.getItem('teacherId') || username;
      const response = await fetch(`http://localhost:5001/api/video/available-students/${teacherId}`);

      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      return cameras;
    } catch (error) {
      console.error('Error getting cameras:', error);
      return [];
    }
  };

  const getCameraConstraints = () => {
    const constraints = {
      audio: callType === 'audio' ? true : { echoCancellation: true, noiseSuppression: true },
      video: callType === 'video' ? {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        facingMode: selectedCamera === 'front' ? 'user' : 'environment'
      } : false
    };
    return constraints;
  };

  const startVideoCall = async (student) => {
    try {
      const teacherId = localStorage.getItem('teacherId') || username;
      const response = await fetch('http://localhost:5001/api/video/create-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          teacherId: teacherId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentCall({ roomId: data.roomId, student });
        setShowVideoCallModal(true);
        initializeVideoCall(data.roomId);
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to start video call');
    }
  };

  const initializeVideoCall = async (roomId) => {
    try {
      // Initialize Socket.io connection
      const socketConnection = io('http://localhost:5001');
      setSocket(socketConnection);

      // Get available cameras first
      await getAvailableCameras();

      // Get user media based on call type and camera selection
      const constraints = getCameraConstraints();
      console.log('Media constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // Initialize WebRTC peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketConnection.emit('webrtc-ice-candidate', {
            roomId,
            candidate: event.candidate,
            targetUserId: currentCall.student.id
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          console.log('WebRTC connection established');
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          console.log('WebRTC connection failed or closed');
          endVideoCall();
        }
      };

      setPeerConnection(pc);

      // Set up Socket.IO event listeners for WebRTC signaling
      socketConnection.on('user-joined', (data) => {
        console.log('User joined:', data);
        // When student joins, create and send offer
        createAndSendOffer(pc, socketConnection, roomId);
      });

      socketConnection.on('webrtc-offer', async (data) => {
        console.log('Received WebRTC offer:', data);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socketConnection.emit('webrtc-answer', {
            roomId,
            answer,
            targetUserId: data.fromUserId
          });
        } catch (error) {
          console.error('Error handling WebRTC offer:', error);
        }
      });

      socketConnection.on('webrtc-answer', async (data) => {
        console.log('Received WebRTC answer:', data);
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (error) {
          console.error('Error handling WebRTC answer:', error);
        }
      });

      socketConnection.on('webrtc-ice-candidate', async (data) => {
        console.log('Received ICE candidate:', data);
        try {
          await pc.addIceCandidate(new RTCSessionDescription(data.candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      });

      socketConnection.on('user-left', (data) => {
        console.log('User left:', data);
        endVideoCall();
      });

      // Join call room
      socketConnection.emit('join-call', {
        roomId,
        userId: localStorage.getItem('teacherId') || username,
        userRole: 'teacher'
      });

      setIsInCall(true);

    } catch (error) {
      console.error('Error initializing video call:', error);
      alert('Failed to initialize video call. Please check camera/microphone permissions.');
    }
  };

  const createAndSendOffer = async (pc, socket, roomId) => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('webrtc-offer', {
        roomId,
        offer,
        targetUserId: currentCall.student.id
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const switchCamera = async () => {
    if (!localStream) return;

    try {
      const newCamera = selectedCamera === 'front' ? 'back' : 'front';
      setSelectedCamera(newCamera);

      // Stop current stream
      localStream.getTracks().forEach(track => track.stop());

      // Get new stream with different camera
      const constraints = getCameraConstraints();
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Replace tracks in peer connection
      if (peerConnection) {
        const videoTrack = newStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }

      setLocalStream(newStream);
    } catch (error) {
      console.error('Error switching camera:', error);
      alert('Failed to switch camera');
    }
  };

  const startAudioCall = async (student) => {
    setCallType('audio');
    setCurrentCall({ roomId: null, student });
    setShowVideoCallModal(true);
    await initializeAudioCall(student);
  };

  const initializeAudioCall = async (student) => {
    try {
      const teacherId = localStorage.getItem('teacherId') || username;

      // Create audio-only call room
      const response = await fetch('http://localhost:5001/api/video/create-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          teacherId: teacherId,
          callType: 'audio'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentCall({ roomId: data.roomId, student, type: 'audio' });
        await initializeAudioOnlyCall(data.roomId);
      }
    } catch (error) {
      console.error('Error starting audio call:', error);
      alert('Failed to start audio call');
    }
  };

  const initializeAudioOnlyCall = async (roomId) => {
    try {
      const socketConnection = io('http://localhost:5001');
      setSocket(socketConnection);

      // Get audio-only stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false
      });
      setLocalStream(stream);

      // Initialize WebRTC peer connection for audio only
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add audio track to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote audio stream
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        // Play remote audio automatically
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.play();
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketConnection.emit('webrtc-ice-candidate', {
            roomId,
            candidate: event.candidate,
            targetUserId: currentCall.student.id
          });
        }
      };

      setPeerConnection(pc);

      // Set up Socket.IO event listeners (same as video call)
      socketConnection.on('user-joined', (data) => {
        console.log('User joined audio call:', data);
        createAndSendOffer(pc, socketConnection, roomId);
      });

      socketConnection.on('webrtc-offer', async (data) => {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socketConnection.emit('webrtc-answer', {
            roomId,
            answer,
            targetUserId: data.fromUserId
          });
        } catch (error) {
          console.error('Error handling audio WebRTC offer:', error);
        }
      });

      socketConnection.on('webrtc-answer', async (data) => {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (error) {
          console.error('Error handling audio WebRTC answer:', error);
        }
      });

      socketConnection.on('webrtc-ice-candidate', async (data) => {
        try {
          await pc.addIceCandidate(new RTCSessionDescription(data.candidate));
        } catch (error) {
          console.error('Error adding audio ICE candidate:', error);
        }
      });

      // Join call room
      socketConnection.emit('join-call', {
        roomId,
        userId: localStorage.getItem('teacherId') || username,
        userRole: 'teacher'
      });

      setIsInCall(true);

    } catch (error) {
      console.error('Error initializing audio call:', error);
      alert('Failed to initialize audio call. Please check microphone permissions.');
    }
  };

  const endVideoCall = async () => {
    try {
      if (currentCall) {
        await fetch('http://localhost:5001/api/video/end-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: currentCall.roomId }),
        });
      }

      // Close peer connection and streams
      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        setRemoteStream(null);
      }

      if (socket) {
        socket.emit('leave-call', { roomId: currentCall.roomId });
        socket.disconnect();
        setSocket(null);
      }

      setIsInCall(false);
      setCurrentCall(null);
      setShowVideoCallModal(false);

    } catch (error) {
      console.error('Error ending video call:', error);
    }
  };

  // Call control functions
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  };

  // State for tracking mute/camera status
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Schedule states
  const [selectedClass, setSelectedClass] = useState('8');
  const [selectedStream, setSelectedStream] = useState('general');
  const [timetable, setTimetable] = useState({});

  const fetchTimetable = useCallback(async () => {
    try {
      const teacherId = localStorage.getItem('teacherId') || username;
      const response = await fetch(`http://localhost:5001/api/timetables/${selectedClass}/${selectedStream}`);
      if (response.ok) {
        const data = await response.json();
        setTimetable(data.timetable || {});
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  }, [selectedClass, selectedStream, username]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);




  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="teacher-dashboard-container">
      {/* Floating Video Call Button */}
      <div className="floating-video-btn">
        <button
          onClick={() => {
            setActiveTab('live');
            fetchAvailableStudents();
          }}
          title="Start Video Call"
        >
          📹
        </button>
      </div>


      {/* Dark Mode Toggle */}
      <div className="theme-toggle">
        <button onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <aside className="sidebar">
        <div className="logo-placeholder" onClick={() => navigate('/')}>
          <img
            src={`${process.env.PUBLIC_URL}/images/Shiksa_logo.png`}
            alt="Shiksha Logo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              marginRight: '0.5rem',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              console.log('Logo failed to load, hiding image');
            }}
          />
          <span>Shiksha</span>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            📚 Courses
          </button>
          <button
            className={`nav-link ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            📄 Materials
          </button>
          <button
            className={`nav-link ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            📝 Quiz
          </button>
          <button
            className={`nav-link ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            📋 Assignments
          </button>
          <button
            className={`nav-link ${activeTab === 'announcement' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcement')}
          >
            📢 Announcement
          </button>
          <button
            className={`nav-link ${activeTab === 'upload-video' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload-video')}
          >
            🎥 Upload Video
          </button>
          <button
            className={`nav-link ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('live');
              fetchAvailableStudents();
            }}
          >
            📹 Live
          </button>
          <button
            className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            📅 Schedule
          </button>
          <button
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>
        <button className="logout-button" onClick={onLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>Welcome Back, {teacherData?.name || username}! 👋</h1>
            <p style={{ color: 'var(--secondary-text)', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
              {teacherData?.name === 'Evelyn Johnson' ?
                "Ready to inspire young minds? Let's make today amazing!" :
                "Ready to inspire and educate? Let's make learning amazing today!"
              }
            </p>
          </div>
          <div className="header-actions">
            {/* Video Call Button - Always visible for quick access */}
            <button
              className="action-btn video-call-btn"
              onClick={() => {
                setActiveTab('live');
                fetchAvailableStudents();
              }}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                animation: 'pulse 2s infinite'
              }}
            >
              <span>📹</span> Live
            </button>


            {activeTab === 'materials' && teacherData?.permissions?.canUploadMaterials && (
              <button className="action-btn upload-btn" onClick={() => setShowUploadModal(true)}>
                <span>📤</span> Upload Material
              </button>
            )}
            {activeTab === 'tests' && teacherData?.permissions?.canCreateTests && (
              <button className="action-btn create-btn" onClick={() => setShowTestModal(true)}>
                <span>📝</span> Create Test
              </button>
            )}
            {activeTab === 'courses' && teacherData?.permissions?.canManageStudents && (
              <button className="action-btn manage-btn">
                <span>👥</span> Manage Students
              </button>
            )}
          </div>
        </header>

        <div className="dashboard-content">
            {/* Modern Stats Overview */}
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-number">{courses.length}</div>
                <div className="stat-label">Courses</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{materials.length}</div>
                <div className="stat-label">Materials</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{tests.length}</div>
                <div className="stat-label">Tests</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {courses.reduce((total, course) => total + (course.enrolledStudents?.length || 0), 0)}
                </div>
                <div className="stat-label">Students</div>
              </div>
            </div>

            {activeTab === 'courses' && (
            <div className="courses-container">
              <h2>Your Assigned Courses</h2>
              <div className="courses-grid">
                {courses.map((course) => (
                  <div key={course._id || course.id} className="course-card">
                    <h3>{course.name}</h3>
                    <p>{course.description}</p>
                    <div className="course-info">
                      <span>Students: {course.enrolledStudents?.length || 0}</span>
                      <span>Progress: {course.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
           <div className="materials-container">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h2>📄 Your Materials</h2>
               {teacherData?.permissions?.canUploadMaterials && (
                 <button
                   className="action-btn upload-btn"
                   onClick={() => setShowUploadModal(true)}
                   style={{ fontSize: '0.9rem', padding: '0.75rem 1.25rem' }}
                 >
                   <span>➕</span> Upload New Material
                 </button>
               )}
             </div>
             <div className="materials-list">
               {materials.map((material) => (
                 <div key={material.id} className="material-item">
                   <div className="material-info">
                     <h3>{material.title}</h3>
                     <p>{material.description}</p>
                     <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                       <span style={{
                         display: 'inline-block',
                         background: 'var(--light-blue-bg)',
                         padding: '0.25rem 0.75rem',
                         borderRadius: '12px',
                         fontSize: '0.8rem',
                         fontWeight: '500',
                         color: 'var(--accent-blue)'
                       }}>
                         📚 {courses.find(c => c.id === material.courseId)?.name || 'Unknown Course'}
                       </span>
                       <span style={{
                         display: 'inline-block',
                         background: 'var(--green-status-bg)',
                         padding: '0.25rem 0.75rem',
                         borderRadius: '12px',
                         fontSize: '0.8rem',
                         fontWeight: '500',
                         color: 'var(--green-status)'
                       }}>

                         🏫 Grade {material.class || 'No Class'}

                       </span>
                     </div>
                   </div>
                   <div className="material-actions">
                     <button
                       className="download-btn"
                       onClick={() => window.open(`http://localhost:5001${material.fileUrl}`, '_blank')}
                     >
                       📥 Download
                     </button>
                     <button
                       className="edit-btn"
                       onClick={() => handleEditMaterial(material)}
                     >
                       ✏️ Edit
                     </button>
                     <button
                       className="delete-btn"
                       onClick={() => handleDeleteMaterial(material.id)}
                     >
                       🗑️ Delete
                     </button>
                   </div>
                 </div>
               ))}
               {materials.length === 0 && (
                 <div style={{
                   textAlign: 'center',
                   padding: '3rem',
                   color: 'var(--secondary-text)',
                   fontSize: '1.1rem'
                 }}>
                   📭 No materials uploaded yet. Click "Upload Material" to get started!
                 </div>
               )}
             </div>
           </div>
         )}

          {activeTab === 'quiz' && (
            <div className="tests-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>📝 Your Quizzes</h2>
                {teacherData?.permissions?.canCreateTests && (
                  <button
                    className="action-btn create-btn"
                    onClick={() => setShowTestModal(true)}
                    style={{ fontSize: '0.9rem', padding: '0.75rem 1.25rem' }}
                  >
                    <span>➕</span> Create New Quiz
                  </button>
                )}
              </div>
              <div className="tests-list">
                {tests.map((test) => (
                  <div key={test._id} className="test-item">
                    <div className="test-info">
                      <h3>{test.title}</h3>
                      <p>{test.description}</p>
                      <div className="test-details">
                        <span>❓ {test.questions?.length || 0} Questions</span>
                        <span>⏱️ {test.duration || 60} Minutes</span>
                      </div>
                    </div>
                    <div className="test-actions">
                      <button
                        className="conduct-btn"
                        onClick={() => handleConductTest(test._id)}
                      >
                        ▶️ Conduct Test
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteTest(test._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
                {tests.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--secondary-text)',
                    fontSize: '1.1rem'
                  }}>
                    📭 No quizzes created yet. Click "Create New Quiz" to get started!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'live' && (
            <div className="video-calls-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>📹 Live Sessions</h2>
                <button
                  className="action-btn"
                  onClick={fetchAvailableStudents}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '0.9rem',
                    padding: '0.75rem 1.25rem'
                  }}
                >
                  🔄 Refresh Students
                </button>
              </div>

              {!isInCall ? (
                <div className="students-grid">
                  {availableStudents.map((student) => (
                    <div key={student.id} className="student-card">
                      <div className="student-info">
                        <h3>{student.name}</h3>
                        <p>Email: {student.email}</p>
                        <p>Phone: {student.phone}</p>
                        <p>Class: {student.class}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button
                          className="call-btn video-call-btn"
                          onClick={() => {
                            setCallType('video');
                            startVideoCall(student);
                          }}
                        >
                          📹 Video Call
                        </button>
                        <button
                          className="call-btn audio-call-btn"
                          onClick={() => {
                            setCallType('audio');
                            startAudioCall(student);
                          }}
                        >
                          📞 Audio Call
                        </button>
                      </div>
                    </div>
                  ))}
                  {availableStudents.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem',
                      color: 'var(--secondary-text)',
                      fontSize: '1.1rem',
                      gridColumn: '1 / -1'
                    }}>
                      📭 No students available. Click "Refresh Students" to load student list.
                    </div>
                  )}
                </div>
              ) : (
                <div className="video-call-active">
                  <h3>🎥 Live Session in Progress</h3>
                  <p>Connected with: {currentCall?.student?.name}</p>
                  <button
                    className="end-call-btn"
                    onClick={endVideoCall}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '1rem 2rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      marginTop: '1rem'
                    }}
                  >
                    🔚 End Session
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>⚙️ Account Settings</h2>
                <button
                  onClick={refreshData}
                  style={{
                    background: 'var(--accent-blue)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🔄 Refresh Data
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}>
                <div style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'var(--backdrop-blur)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  padding: '2rem',
                  boxShadow: 'var(--box-shadow)'
                }}>
                  <h3 style={{
                    color: 'var(--primary-text)',
                    margin: '0 0 1.5rem 0',
                    fontSize: '1.25rem'
                  }}>
                    🔐 Your Permissions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--light-blue-bg)',
                      borderRadius: '12px'
                    }}>
                      <span>📤 Upload Materials</span>
                      <span style={{
                        color: teacherData?.permissions?.canUploadMaterials ? 'var(--green-status)' : 'var(--secondary-text)',
                        fontWeight: '600'
                      }}>
                        {teacherData?.permissions?.canUploadMaterials ? '✅ Enabled' : '❌ Disabled'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--light-blue-bg)',
                      borderRadius: '12px'
                    }}>
                      <span>📝 Create Tests</span>
                      <span style={{
                        color: teacherData?.permissions?.canCreateTests ? 'var(--green-status)' : 'var(--secondary-text)',
                        fontWeight: '600'
                      }}>
                        {teacherData?.permissions?.canCreateTests ? '✅ Enabled' : '❌ Disabled'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--light-blue-bg)',
                      borderRadius: '12px'
                    }}>
                      <span>👥 Manage Students</span>
                      <span style={{
                        color: teacherData?.permissions?.canManageStudents ? 'var(--green-status)' : 'var(--secondary-text)',
                        fontWeight: '600'
                      }}>
                        {teacherData?.permissions?.canManageStudents ? '✅ Enabled' : '❌ Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Debug Information */}
                  <div style={{
                    background: 'var(--warning-bg)',
                    border: '1px solid var(--warning-border)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1.5rem'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--warning-text)' }}>
                      🔧 Debug Information
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--warning-text)' }}>
                      <p><strong>Teacher ID:</strong> {localStorage.getItem('teacherId') || username}</p>
                      <p><strong>Username:</strong> {username}</p>
                      <p><strong>Raw Permissions:</strong> {JSON.stringify(teacherData?.permissions)}</p>
                      <p><strong>Upload Materials:</strong> {teacherData?.permissions?.canUploadMaterials ? 'true' : 'false'}</p>
                      <p><strong>Create Tests:</strong> {teacherData?.permissions?.canCreateTests ? 'true' : 'false'}</p>
                      <p><strong>Manage Students:</strong> {teacherData?.permissions?.canManageStudents ? 'true' : 'false'}</p>
                    </div>
                  </div>

                </div>

                <div style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'var(--backdrop-blur)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  padding: '2rem',
                  boxShadow: 'var(--box-shadow)'
                }}>
                  <h3 style={{
                    color: 'var(--primary-text)',
                    margin: '0 0 1.5rem 0',
                    fontSize: '1.25rem'
                  }}>
                    📚 Your Assignments
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary-text)' }}>Classes</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {teacherData?.assignedClasses?.length > 0 ? (
                          teacherData.assignedClasses.map(cls => (
                            <span key={cls} style={{
                              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: '500'
                            }}>
                              {cls}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--secondary-text)', fontStyle: 'italic' }}>
                            No classes assigned
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary-text)' }}>Subjects</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {teacherData?.subjects?.length > 0 ? (
                          teacherData.subjects.map(subject => (
                            <span key={subject} style={{
                              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              fontWeight: '500'
                            }}>
                              {subject}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--secondary-text)', fontStyle: 'italic' }}>
                            No subjects assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="schedule-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>📅 Class Schedule</h2>
                <button
                  onClick={handleSaveTimetable}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  💾 Save Timetable
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ minWidth: '120px' }}>
                  <label htmlFor="classSelect">Class</label>
                  <select
                    id="classSelect"
                    value={selectedClass}
                    onChange={(e) => { setSelectedClass(e.target.value); if (parseInt(e.target.value) < 11) setSelectedStream('general'); }}
                  >
                    {Array.from({ length: 5 }, (_, i) => i + 8).map(cls => (
                      <option key={cls} value={cls.toString()}>{cls}</option>
                    ))}
                  </select>
                </div>

                {parseInt(selectedClass) >= 11 && (
                  <div className="form-group" style={{ minWidth: '120px' }}>
                    <label htmlFor="streamSelect">Stream</label>
                    <select
                      id="streamSelect"
                      value={selectedStream}
                      onChange={(e) => setSelectedStream(e.target.value)}
                    >
                      <option value="general">General</option>
                      <option value="science">Science</option>
                      <option value="commerce">Commerce</option>
                      <option value="arts">Arts</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="timetable-container" style={{ overflowX: 'auto' }}>
                <table className="timetable" style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'var(--backdrop-blur)',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: 'var(--box-shadow)'
                }}>
                  <thead>
                    <tr>
                      <th style={{
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                        background: 'var(--light-blue-bg)',
                        fontWeight: '600',
                        color: 'var(--primary-text)'
                      }}>Day</th>
                      {Array.from({ length: 8 }, (_, i) => i + 1).map(period => (
                        <th key={period} style={{
                          padding: '1rem',
                          border: '1px solid var(--border-color)',
                          background: 'var(--light-blue-bg)',
                          fontWeight: '600',
                          color: 'var(--primary-text)',
                          minWidth: '120px'
                        }}>Period {period}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <tr key={day}>
                        <td style={{
                          padding: '1rem',
                          border: '1px solid var(--border-color)',
                          fontWeight: '600',
                          background: 'var(--light-blue-bg)',
                          color: 'var(--primary-text)'
                        }}>{day}</td>
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(period => (
                          <td key={period} style={{
                            padding: '0.5rem',
                            border: '1px solid var(--border-color)',
                            background: 'var(--card-bg)'
                          }}>
                            <input
                              type="text"
                              value={timetable[selectedClass]?.[selectedStream]?.[day]?.[period.toString()] || ''}
                              onChange={(e) => handleTimetableChange(day, period.toString(), e.target.value)}
                              placeholder="Subject"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                background: 'var(--input-bg)',
                                color: 'var(--primary-text)',
                                fontSize: '0.9rem'
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                borderRadius: '8px',
                color: 'var(--warning-text)',
                fontSize: '0.9rem'
              }}>
                <strong>Note:</strong> Changes are automatically saved to the server. For classes 8-10, only "General" stream is available.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- UPLOAD MODAL --- */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Upload New Material</h2>
            <form onSubmit={handleMaterialSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newMaterialData.title}
                  onChange={handleMaterialChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={newMaterialData.description}
                  onChange={handleMaterialChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="courseId">Course</label>
                <select
                  id="courseId"
                  name="courseId"
                  value={newMaterialData.courseId}
                  onChange={handleMaterialChange}
                  required
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="class">Class</label>
                <select
                  id="class"
                  name="class"
                  value={newMaterialData.class}
                  onChange={handleMaterialChange}
                  required
                >
                  <option value="" disabled>Select a class</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>

                </select>
              </div>
              <div className="form-group">
                <label htmlFor="materialFile">File</label>
                <input
                  type="file"
                  id="materialFile"
                  name="materialFile"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MATERIAL MODAL --- */}
      {showEditModal && editingMaterial && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Material</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="editTitle">Title</label>
                <input
                  type="text"
                  id="editTitle"
                  name="title"
                  value={newMaterialData.title}
                  onChange={handleMaterialChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editDescription">Description (Optional)</label>
                <textarea
                  id="editDescription"
                  name="description"
                  value={newMaterialData.description}
                  onChange={handleMaterialChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editCourseId">Course</label>
                <select
                  id="editCourseId"
                  name="courseId"
                  value={newMaterialData.courseId}
                  onChange={handleMaterialChange}
                  required
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="editClass">Class</label>
                <select
                  id="editClass"
                  name="class"
                  value={newMaterialData.class}
                  onChange={handleMaterialChange}
                  required
                >
                  <option value="" disabled>Select a class</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>

                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setShowEditModal(false);
                  setEditingMaterial(null);
                  setNewMaterialData({ title: '', description: '', courseId: '', class: '' });

                }}>Cancel</button>
                <button type="submit" className="submit-btn">Update Material</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIDEO CALL MODAL --- */}
      {showVideoCallModal && (
        <div className="modal-overlay" onClick={() => !isInCall && setShowVideoCallModal(false)}>
          <div className="modal-content video-modal" onClick={e => e.stopPropagation()}>
            <h2>🎥 Video Call</h2>

            {isInCall ? (
              <div className="video-call-container">
                {callType === 'video' ? (
                  <div className="video-area">
                    {/* Remote video (student) */}
                    <div className="remote-video-container">
                      <video
                        ref={(video) => {
                          if (video && remoteStream) {
                            video.srcObject = remoteStream;
                          }
                        }}
                        autoPlay
                        playsInline
                        className="remote-video"
                      />
                      <div className="video-label">Student: {currentCall?.student?.name}</div>
                    </div>

                    {/* Local video (teacher) - smaller picture-in-picture */}
                    <div className="local-video-container">
                      <video
                        ref={(video) => {
                          if (video && localStream) {
                            video.srcObject = localStream;
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="local-video"
                      />
                      <div className="video-label">You</div>
                      {availableCameras.length > 1 && (
                        <button
                          className="camera-switch-btn"
                          onClick={switchCamera}
                          title="Switch Camera"
                        >
                          🔄
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="audio-call-container">
                    <div className="audio-call-display">
                      <div className="call-avatar">👨‍🏫</div>
                      <h3>Audio Call in Progress</h3>
                      <p>Connected with: {currentCall?.student?.name}</p>
                      <div className="audio-visualizer">
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                        <div className="audio-bar"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="call-controls">
                  <button
                    className={`control-btn mute-btn ${isMuted ? 'muted' : ''}`}
                    onClick={() => {
                      const muted = toggleMute();
                      setIsMuted(!muted);
                    }}
                  >
                    {isMuted ? '🔇 Unmute' : '🎤 Mute'}
                  </button>

                  <button
                    className={`control-btn video-btn ${isCameraOff ? 'camera-off' : ''}`}
                    onClick={() => {
                      const cameraOff = toggleCamera();
                      setIsCameraOff(!cameraOff);
                    }}
                  >
                    {isCameraOff ? '📹 Camera On' : '📷 Camera Off'}
                  </button>

                  <button
                    className="control-btn end-btn"
                    onClick={endVideoCall}
                  >
                    🔚 End Call
                  </button>
                </div>
              </div>
            ) : (
              <div className="call-setup">
                <p>Setting up video call with {currentCall?.student?.name}...</p>
                <div className="loading-spinner">⏳</div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* --- TEST CREATION MODAL --- */}
      {showTestModal && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
            <h2>Create New Test</h2>
            <form onSubmit={handleTestSubmit}>
              <div className="form-group">
                <label htmlFor="testTitle">Test Title</label>
                <input
                  type="text"
                  id="testTitle"
                  value={newTestData.title}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="testDescription">Description (Optional)</label>
                <textarea
                  id="testDescription"
                  value={newTestData.description}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="testCourseId">Course</label>
                <select
                  id="testCourseId"
                  value={newTestData.courseId}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, courseId: e.target.value }))}
                  required
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map(course => (
                    <option key={course._id || course.id} value={course._id || course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  value={newTestData.duration}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="1"
                  required
                />
              </div>

              <div className="questions-section">
                <h3>Questions</h3>
                {newTestData.questions.map((question, index) => (
                  <div key={index} className="question-item">
                    <div className="form-group">
                      <label>Question {index + 1}</label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        placeholder="Enter question"
                        required
                      />
                    </div>
                    <div className="options-group">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="option-item">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={question.correctAnswer === optIndex}
                            onChange={() => updateQuestion(index, 'correctAnswer', optIndex)}
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optIndex] = e.target.value;
                              updateQuestion(index, 'options', newOptions);
                            }}
                            placeholder={`Option ${optIndex + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <div className="form-group">
                      <label>Points</label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                ))}
                <button type="button" className="add-question-btn" onClick={addQuestion}>
                  + Add Question
                </button>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowTestModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Create Test</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
