import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Bot, 
  TrendingUp, 
  Apple, 
  Crown, 
  Users,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  Target,
  Award
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Coach',
      description: 'Experience the future of fitness with our advanced AI that learns your preferences and adapts to your progress in real-time.',
      highlight: 'AI-Powered'
    },
    {
      icon: Dumbbell,
      title: 'Smart Workouts',
      description: 'Dynamic workout plans that evolve with your strength, targeting your goals with precision and efficiency.',
      highlight: 'Smart'
    },
    {
      icon: Apple,
      title: 'Nutrition Intelligence',
      description: 'Intelligent meal planning that considers your dietary preferences, allergies, and fitness objectives.',
      highlight: 'Intelligence'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Deep insights into your progress with predictive analytics and personalized recommendations.',
      highlight: 'Advanced'
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Basic fitness guidance',
        'Essential nutrition tips',
        'Weight tracking',
        'Limited AI interactions',
        'Community access'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'month',
      features: [
        'Unlimited AI Coach access',
        'Advanced progress analytics',
        'Custom workout & meal plans',
        'Video-guided workouts',
        'Priority support',
        'Exclusive premium content',
        'Advanced goal tracking'
      ],
      cta: 'Go Premium',
      popular: true
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Fitness Enthusiast',
      content: 'The AI coach is like having a personal trainer in my pocket. Lost 15 pounds and gained so much confidence!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Busy Professional',
      content: 'Finally, a fitness app that understands my hectic schedule. The smart workouts are incredibly efficient.',
      rating: 5
    },
    {
      name: 'Emma Davis',
      role: 'Beginner',
      content: 'As a complete beginner, the AI made fitness approachable and fun. I actually look forward to workouts now!',
      rating: 5
    }
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <nav className="landing-nav">
            <div className="nav-brand">
              <img src="/logo.png" alt="FitForge" className="logo" />
              <span className="brand-text">FitForge</span>
            </div>
            <div className="nav-actions">
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-logo-container">
              <img src="/logo.png" alt="FitForge" className="hero-logo" />
            </div>
            <h1 className="hero-title">
              Your <span className="highlight-text">AI-Powered</span> Fitness
              <br />
              <span className="text-gradient">Revolution</span> Starts Here
            </h1>
            <p className="hero-subtitle">
              Transform your health journey with cutting-edge AI technology that delivers 
              personalized workouts, intelligent nutrition guidance, and adaptive coaching 
              that evolves with your progress.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                <Zap size={20} />
                Start Your Transformation
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                <Target size={20} />
                I Have an Account
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <Users size={24} />
                <div>
                  <div className="stat-number">10,000+</div>
                  <div className="stat-label">Active Users</div>
                </div>
              </div>
              <div className="stat">
                <TrendingUp size={24} />
                <div>
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>
              <div className="stat">
                <Award size={24} />
                <div>
                  <div className="stat-number">4.9</div>
                  <div className="stat-label">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>The <span className="highlight-text">Future</span> of Fitness is Here</h2>
            <p>Experience next-generation fitness technology designed for real results</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <Icon size={32} />
                  </div>
                  <h3 className="feature-title">
                    <span className="highlight-text">{feature.highlight}</span> {feature.title.replace(feature.highlight, '').trim()}
                  </h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>Choose Your <span className="highlight-text">Power</span> Level</h2>
            <p>Start your journey today and unlock your full potential</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}>
                {plan.popular && (
                  <div className="popular-badge">
                    <Crown size={16} />
                    <span className="highlight-text">Most Popular</span>
                  </div>
                )}
                <div className="pricing-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">/{plan.period}</span>
                  </div>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="plan-feature">
                      <CheckCircle size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/register" 
                  className={`btn ${plan.popular ? 'btn-highlight' : 'btn-secondary'} btn-lg plan-cta`}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>Real People, <span className="highlight-text">Real</span> Results</h2>
            <p>Join thousands who have transformed their lives with FitForge</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to <span className="highlight-text">Unleash</span> Your Potential?</h2>
            <p>Join the fitness revolution and experience the power of AI-driven personalization.</p>
            <Link to="/register" className="btn btn-highlight btn-lg">
              <Zap size={20} />
              Transform Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img src="/logo.png" alt="FitForge" className="logo" />
              <span className="brand-text">FitForge</span>
            </div>
            <p className="footer-text">
              Empowering your fitness journey with <span className="highlight-text">AI-powered</span> personalization.
            </p>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 FitForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;