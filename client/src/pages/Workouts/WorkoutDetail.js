import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Target, Users, Play, ArrowLeft, Star } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import './WorkoutDetail.css';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const response = await axios.get(`/api/workouts/${id}`);
      setWorkout(response.data);
    } catch (error) {
      console.error('Error fetching workout:', error);
      setError('Failed to load workout details');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'primary';
    }
  };

  const startWorkout = () => {
    navigate(`/workout-session/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !workout) {
    return (
      <div className="workout-detail-container">
        <div className="error-state">
          <h2>Workout Not Found</h2>
          <p>{error || 'The workout you\'re looking for doesn\'t exist.'}</p>
          <Link to="/workouts" className="btn-primary">
            Back to Workouts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-detail-container">
      <div className="workout-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft className="icon" />
          Back
        </button>
        
        <div className="workout-hero">
          <div className="workout-image">
            {workout.image ? (
              <img src={workout.image} alt={workout.name} />
            ) : (
              <div className="placeholder-image">
                <Target className="placeholder-icon" />
              </div>
            )}
            <div className={`difficulty-badge ${getDifficultyColor(workout.difficulty)}`}>
              {workout.difficulty}
            </div>
          </div>
          
          <div className="workout-info">
            <h1>{workout.name}</h1>
            <p className="workout-description">{workout.description}</p>
            
            <div className="workout-stats">
              <div className="stat-item">
                <Clock className="stat-icon" />
                <span>{workout.duration} minutes</span>
              </div>
              <div className="stat-item">
                <Target className="stat-icon" />
                <span>{workout.exercises?.length || 0} exercises</span>
              </div>
              <div className="stat-item">
                <Users className="stat-icon" />
                <span>{workout.completions || 0} completions</span>
              </div>
              {workout.rating && (
                <div className="stat-item">
                  <Star className="stat-icon" />
                  <span>{workout.rating.toFixed(1)}/5</span>
                </div>
              )}
            </div>
            
            <div className="workout-tags">
              <span className="tag type-tag">{workout.type}</span>
              {workout.equipment && workout.equipment.length > 0 && (
                workout.equipment.map((item, index) => (
                  <span key={index} className="tag equipment-tag">{item}</span>
                ))
              )}
            </div>
            
            <div className="workout-actions">
              <button onClick={startWorkout} className="btn-primary large">
                <Play className="icon" />
                Start Workout
              </button>
              <Link to={`/workouts/${id}/preview`} className="btn-outline">
                Preview Exercises
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="workout-content">
        <div className="exercises-section">
          <h2>Exercises ({workout.exercises?.length || 0})</h2>
          
          {workout.exercises && workout.exercises.length > 0 ? (
            <div className="exercises-list">
              {workout.exercises.map((exercise, index) => (
                <div key={index} className="exercise-card">
                  <div className="exercise-number">
                    {index + 1}
                  </div>
                  
                  <div className="exercise-content">
                    <h3>{exercise.name}</h3>
                    <p className="exercise-description">{exercise.description}</p>
                    
                    <div className="exercise-details">
                      {exercise.sets && (
                        <span className="detail-item">
                          <strong>Sets:</strong> {exercise.sets}
                        </span>
                      )}
                      {exercise.reps && (
                        <span className="detail-item">
                          <strong>Reps:</strong> {exercise.reps}
                        </span>
                      )}
                      {exercise.duration && (
                        <span className="detail-item">
                          <strong>Duration:</strong> {exercise.duration}s
                        </span>
                      )}
                      {exercise.restTime && (
                        <span className="detail-item">
                          <strong>Rest:</strong> {exercise.restTime}s
                        </span>
                      )}
                    </div>
                    
                    {exercise.tips && exercise.tips.length > 0 && (
                      <div className="exercise-tips">
                        <h4>Tips:</h4>
                        <ul>
                          {exercise.tips.map((tip, tipIndex) => (
                            <li key={tipIndex}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {exercise.image && (
                    <div className="exercise-image">
                      <img src={exercise.image} alt={exercise.name} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-exercises">
              <Target className="empty-icon" />
              <p>No exercises found for this workout.</p>
            </div>
          )}
        </div>

        <div className="workout-sidebar">
          <div className="workout-summary">
            <h3>Workout Summary</h3>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="label">Total Time</span>
                <span className="value">{workout.duration} min</span>
              </div>
              <div className="summary-item">
                <span className="label">Exercises</span>
                <span className="value">{workout.exercises?.length || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Difficulty</span>
                <span className="value">{workout.difficulty}</span>
              </div>
              <div className="summary-item">
                <span className="label">Type</span>
                <span className="value">{workout.type}</span>
              </div>
            </div>
          </div>

          {workout.targetMuscles && workout.targetMuscles.length > 0 && (
            <div className="target-muscles">
              <h3>Target Muscles</h3>
              <div className="muscles-list">
                {workout.targetMuscles.map((muscle, index) => (
                  <span key={index} className="muscle-tag">{muscle}</span>
                ))}
              </div>
            </div>
          )}

          {workout.caloriesBurned && (
            <div className="calories-info">
              <h3>Estimated Calories</h3>
              <div className="calories-value">
                {workout.caloriesBurned} cal
              </div>
              <p>Based on average 70kg person</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetail;