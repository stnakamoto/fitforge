import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import './Onboarding.css';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const totalSteps = 4;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.put('/api/users/onboarding', {
        ...data,
        onboardingComplete: true
      });
      
      updateUser(response.data.user);
      toast.success('Profile setup complete!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-step">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  {...register('age', {
                    required: 'Age is required',
                    min: { value: 13, message: 'Must be at least 13 years old' },
                    max: { value: 120, message: 'Please enter a valid age' }
                  })}
                />
                {errors.age && <span className="error-message">{errors.age.message}</span>}
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select {...register('gender', { required: 'Gender is required' })}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender.message}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  {...register('height', {
                    required: 'Height is required',
                    min: { value: 100, message: 'Please enter a valid height' },
                    max: { value: 250, message: 'Please enter a valid height' }
                  })}
                />
                {errors.height && <span className="error-message">{errors.height.message}</span>}
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  {...register('weight', {
                    required: 'Weight is required',
                    min: { value: 30, message: 'Please enter a valid weight' },
                    max: { value: 300, message: 'Please enter a valid weight' }
                  })}
                />
                {errors.weight && <span className="error-message">{errors.weight.message}</span>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="onboarding-step">
            <h2>Fitness Goals</h2>
            <div className="form-group">
              <label>Primary Goal</label>
              <select {...register('primaryGoal', { required: 'Primary goal is required' })}>
                <option value="">Select your primary goal</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="strength">Build Strength</option>
                <option value="endurance">Improve Endurance</option>
                <option value="general_fitness">General Fitness</option>
                <option value="athletic_performance">Athletic Performance</option>
              </select>
              {errors.primaryGoal && <span className="error-message">{errors.primaryGoal.message}</span>}
            </div>
            <div className="form-group">
              <label>Target Weight (kg) - Optional</label>
              <input
                type="number"
                {...register('targetWeight', {
                  min: { value: 30, message: 'Please enter a valid weight' },
                  max: { value: 300, message: 'Please enter a valid weight' }
                })}
              />
              {errors.targetWeight && <span className="error-message">{errors.targetWeight.message}</span>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="onboarding-step">
            <h2>Activity Level</h2>
            <div className="form-group">
              <label>Current Activity Level</label>
              <select {...register('activityLevel', { required: 'Activity level is required' })}>
                <option value="">Select your activity level</option>
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
              </select>
              {errors.activityLevel && <span className="error-message">{errors.activityLevel.message}</span>}
            </div>
            <div className="form-group">
              <label>Exercise Experience</label>
              <select {...register('experienceLevel', { required: 'Experience level is required' })}>
                <option value="">Select your experience level</option>
                <option value="beginner">Beginner (0-6 months)</option>
                <option value="intermediate">Intermediate (6 months - 2 years)</option>
                <option value="advanced">Advanced (2+ years)</option>
              </select>
              {errors.experienceLevel && <span className="error-message">{errors.experienceLevel.message}</span>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="onboarding-step">
            <h2>Preferences</h2>
            <div className="form-group">
              <label>Preferred Workout Duration (minutes)</label>
              <select {...register('preferredWorkoutDuration')}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90+ minutes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Workout Frequency (days per week)</label>
              <select {...register('workoutFrequency')}>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
                <option value="7">7 days</option>
              </select>
            </div>
            <div className="form-group">
              <label>Equipment Available</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" {...register('equipment')} value="bodyweight" />
                  Bodyweight Only
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" {...register('equipment')} value="dumbbells" />
                  Dumbbells
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" {...register('equipment')} value="barbell" />
                  Barbell
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" {...register('equipment')} value="gym" />
                  Full Gym Access
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1>Let's Set Up Your Profile</h1>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
          <p>Step {step} of {totalSteps}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStep()}

          <div className="onboarding-actions">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn-secondary">
                Previous
              </button>
            )}
            
            {step < totalSteps ? (
              <button type="button" onClick={nextStep} className="btn-primary">
                Next
              </button>
            ) : (
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Completing...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;