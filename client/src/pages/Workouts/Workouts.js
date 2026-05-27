import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, Target, Zap, Plus } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import './Workouts.css';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const workoutTypes = ['all', 'strength', 'cardio', 'flexibility', 'hiit', 'yoga'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    filterWorkouts();
  }, [workouts, searchTerm, selectedType, selectedDifficulty]);

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get('/api/workouts');
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWorkouts = () => {
    let filtered = workouts;

    if (searchTerm) {
      filtered = filtered.filter(workout =>
        workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(workout => workout.type === selectedType);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(workout => workout.difficulty === selectedDifficulty);
    }

    setFilteredWorkouts(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'primary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'strength': return <Target className="type-icon" />;
      case 'cardio': return <Zap className="type-icon" />;
      case 'hiit': return <Zap className="type-icon" />;
      default: return <Target className="type-icon" />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="workouts-container">
      <div className="workouts-header">
        <div className="header-content">
          <h1>Workouts</h1>
          <p>Choose from our collection of expert-designed workouts</p>
        </div>
        <Link to="/workouts/create" className="btn-primary">
          <Plus className="icon" />
          Create Workout
        </Link>
      </div>

      <div className="workouts-filters">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <Filter className="filter-icon" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {workoutTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="workouts-grid">
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => (
            <div key={workout._id} className="workout-card">
              <div className="workout-image">
                {workout.image ? (
                  <img src={workout.image} alt={workout.name} />
                ) : (
                  <div className="placeholder-image">
                    {getTypeIcon(workout.type)}
                  </div>
                )}
                <div className={`difficulty-badge ${getDifficultyColor(workout.difficulty)}`}>
                  {workout.difficulty}
                </div>
              </div>

              <div className="workout-content">
                <h3>{workout.name}</h3>
                <p className="workout-description">{workout.description}</p>

                <div className="workout-meta">
                  <div className="meta-item">
                    <Clock className="meta-icon" />
                    <span>{workout.duration} min</span>
                  </div>
                  <div className="meta-item">
                    <Target className="meta-icon" />
                    <span>{workout.exercises?.length || 0} exercises</span>
                  </div>
                </div>

                <div className="workout-tags">
                  <span className="tag type-tag">{workout.type}</span>
                  {workout.equipment && workout.equipment.length > 0 && (
                    <span className="tag equipment-tag">
                      {workout.equipment.join(', ')}
                    </span>
                  )}
                </div>

                <div className="workout-actions">
                  <Link to={`/workouts/${workout._id}`} className="btn-outline">
                    View Details
                  </Link>
                  <Link to={`/workout-session/${workout._id}`} className="btn-primary">
                    Start Workout
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Target className="empty-icon" />
            <h3>No workouts found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workouts;