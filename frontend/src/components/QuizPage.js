import React, { useState, useEffect } from 'react';
import './QuizPage.css';

const QuizPage = ({ studentId, onBack }) => {
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch available quizzes for the student
  useEffect(() => {
    fetchAvailableQuizzes();
  }, [studentId]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            handleSubmitQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const fetchAvailableQuizzes = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/tests/student/${studentId}`);
      if (response.ok) {
        const quizzes = await response.json();
        setAvailableQuizzes(quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz) => {
    try {
      const response = await fetch(`http://localhost:5001/api/tests/${quiz._id}`);
      if (response.ok) {
        const quizData = await response.json();
        setCurrentQuiz(quizData);
        setTimeLeft(quizData.duration * 60); // Convert minutes to seconds
        setQuizStarted(true);
        setAnswers({});
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const submissionData = {
        studentId,
        testId: currentQuiz._id,
        answers: Object.values(answers),
        timeTaken: currentQuiz.duration * 60 - timeLeft,
        isAutoSubmitted: isAutoSubmit
      };

      const response = await fetch('http://localhost:5001/api/tests/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        setQuizSubmitted(true);
        setQuizStarted(false);
        alert(isAutoSubmit ?
          'Time is up! Quiz has been auto-submitted.' :
          'Quiz submitted successfully!'
        );
      } else {
        throw new Error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setAnswers({});
    setTimeLeft(0);
    setQuizStarted(false);
    setQuizSubmitted(false);
    fetchAvailableQuizzes();
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="loading">Loading quizzes...</div>
      </div>
    );
  }

  if (quizSubmitted) {
    return (
      <div className="quiz-page">
        <div className="quiz-results">
          <h2>Quiz Completed!</h2>
          <p>Your answers have been submitted successfully.</p>
          <div className="results-actions">
            <button onClick={resetQuiz} className="back-btn">Back to Quizzes</button>
            <button onClick={onBack} className="dashboard-btn">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuiz && quizStarted) {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = currentQuiz.questions.length;

    return (
      <div className="quiz-page">
        <div className="quiz-header">
          <h2>{currentQuiz.title}</h2>
          <div className="quiz-info">
            <span className="time-left">Time Left: {formatTime(timeLeft)}</span>
            <span className="progress">Questions: {answeredCount}/{totalQuestions}</span>
          </div>
        </div>

        <div className="quiz-content">
          {currentQuiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="question-card">
              <h3>Question {qIndex + 1}</h3>
              <p className="question-text">{question.question}</p>
              <div className="options">
                {question.options.map((option, oIndex) => (
                  <label key={oIndex} className="option">
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      value={oIndex}
                      checked={answers[qIndex] === oIndex}
                      onChange={() => handleAnswerChange(qIndex, oIndex)}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="quiz-actions">
          <button
            onClick={() => handleSubmitQuiz(false)}
            disabled={submitting}
            className="submit-btn"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h2>Available Quizzes</h2>
        <button onClick={onBack} className="back-btn">Back to Dashboard</button>
      </div>

      <div className="quizzes-list">
        {availableQuizzes.length === 0 ? (
          <div className="no-quizzes">
            <p>No quizzes available at the moment.</p>
            <p>Check back later for new assignments from your teachers.</p>
          </div>
        ) : (
          availableQuizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-info">
                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>
                <div className="quiz-details">
                  <span>📚 {quiz.courseId?.name || 'Course'}</span>
                  <span>❓ {quiz.questions?.length || 0} Questions</span>
                  <span>⏱️ {quiz.duration || 60} Minutes</span>
                  {quiz.deadline && (
                    <span>📅 Due: {new Date(quiz.deadline).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="quiz-actions">
                <button
                  onClick={() => startQuiz(quiz)}
                  className="start-btn"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizPage;
