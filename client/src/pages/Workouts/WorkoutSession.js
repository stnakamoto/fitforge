import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, X, Clock, Target } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import './WorkoutSession.css';

const WorkoutSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkout();
  }, [sessionId]);

  useEffect(() => {
    let interval = null;
    if (isActive && sessionStarted) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (!isActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, sessionStarted]);

  const fetchWorkout = async () => {
    try {
      const response = await axios.get(`/api/workouts/${sessionId}`);
      setWorkout(response.data);
    } catch (error) {
      console.error('Error fetching workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    setIsActive(true);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const nextExercise = () => {
    if (currentExercise < workout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      completeWorkout();
    }
  };

  const completeWorkout = async () => {
    try {
      await axios.post('/api/workouts/complete', {
        workoutId: workout._id,
        duration: timer,
        completedAt: new Date()
      });
      
      navigate('/dashboard', { 
        state: { message: 'Workout completed successfully!' }
      });
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const exitSession = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
      navigate('/workouts');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!workout || !workout.exercises || workout.exercises.length === 0) {
    return (
      <div className="workout-session-container">
        <div className="error-state">
          <h2>Workout Not Available</h2>
          <p>This workout doesn't have any exercises or couldn't be loaded.</p>
          <button onClick={() => navigate('/workouts')} className="btn-primary">
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  const currentExerciseData = workout.exercises[currentExercise];

  if (!sessionStarted) {
    return (
      <div className="workout-session-container">
        <div className="session-start">
          <div className="workout-preview">
            <h1>{workout.name}</h1>
            <div className="workout-stats">
              <div className="stat">
                <Clock className="stat-icon" />
                <span>{workout.duration} minutes</span>
              </div>
              <div className="stat">
                <Target className="stat-icon" />
                <span>{workout.exercises.length} exercises</span>
              </div>
            </div>
            <p>{workout.description}</p>
          </div>
          
          <div className="start-actions">
            <button onClick={startSession} className="btn-start">
              <Play className="icon" />
              Start Workout
            </button>
            <button onClick={() => navigate('/workouts')} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-session-container active">
      <div className="session-header">
        <div className="session-info">
          <h2>{workout.name}</h2>
          <div className="session-progress">
            Exercise {currentExercise + 1} of {workout.exercises.length}
          </div>
        </div>
        
        <div className="session-controls">
          <div className="timer">
            {formatTime(timer)}
          </div>
          <button onClick={exitSession} className="exit-btn">
            <X className="icon" />
          </button>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${((currentExercise + 1) / workout.exercises.length) * 100}%` }}
        ></div>
      </div>

      <div className="exercise-display">
        <div className="exercise-content">
          <h1>{currentExerciseData.name}</h1>
          <p className="exercise-description">{currentExerciseData.description}</p>
          
          <div className="exercise-details">
            {currentExerciseData.sets && (
              <div className="detail">
                <strong>Sets:</strong> {currentExerciseData.sets}
              </div>
            )}
            {currentExerciseData.reps && (
              <div className="detail">
                <strong>Reps:</strong> {currentExerciseData.reps}
              </div>
            )}
            {currentExerciseData.duration && (
              <div className="detail">
                <strong>Duration:</strong> {currentExerciseData.duration}s
              </div>
            )}
            {currentExerciseData.restTime && (
              <div className="detail">
                <strong>Rest:</strong> {currentExerciseData.restTime}s
              </div>
            )}
          </div>

          {currentExerciseData.tips && currentExerciseData.tips.length > 0 && (
            <div className="exercise-tips">
              <h3>Tips:</h3>
              <ul>
                {currentExerciseData.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {currentExerciseData.image && (
          <div className="exercise-image">
            <img src={currentExerciseData.image} alt={currentExerciseData.name} />
          </div>
        )}
      </div>

      <div className="session-actions">
        <button onClick={toggleTimer} className="btn-timer">
          {isActive ? <Pause className="icon" /> : <Play className="icon" />}
          {isActive ? 'Pause' : 'Resume'}
        </button>
        
        <button onClick={nextExercise} className="btn-next">
          <SkipForward className="icon" />
          {currentExercise === workout.exercises.length - 1 ? 'Finish' : 'Next Exercise'}
        </button>
      </div>
    </div>
  );
};

export default WorkoutSession;