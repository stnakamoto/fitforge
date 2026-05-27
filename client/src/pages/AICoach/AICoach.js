import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Zap, Target, TrendingUp } from 'lucide-react';
import axios from 'axios';
import './AICoach.css';

const AICoach = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
    fetchSuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get('/api/ai-coach/history');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // Add welcome message if no history
      setMessages([{
        _id: 'welcome',
        type: 'ai',
        content: "Hi! I'm your AI fitness coach. I'm here to help you with workout plans, nutrition advice, and answer any fitness questions you have. How can I assist you today?",
        timestamp: new Date()
      }]);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get('/api/ai-coach/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Default suggestions
      setSuggestions([
        "Create a workout plan for me",
        "What should I eat after my workout?",
        "How can I improve my form?",
        "Help me set realistic fitness goals"
      ]);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      _id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/ai-coach/chat', {
        message: messageText
      });

      const aiMessage = {
        _id: response.data._id,
        type: 'ai',
        content: response.data.content,
        timestamp: new Date(response.data.timestamp)
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        _id: Date.now().toString() + '_error',
        type: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ai-coach-container">
      <div className="ai-coach-header">
        <div className="header-content">
          <div className="coach-avatar">
            <Bot className="bot-icon" />
          </div>
          <div className="header-text">
            <h1>AI Fitness Coach</h1>
            <p>Your personal trainer, nutritionist, and motivation coach</p>
          </div>
        </div>
        <div className="coach-stats">
          <div className="stat-item">
            <Zap className="stat-icon" />
            <span>24/7 Available</span>
          </div>
          <div className="stat-item">
            <Target className="stat-icon" />
            <span>Personalized</span>
          </div>
          <div className="stat-item">
            <TrendingUp className="stat-icon" />
            <span>Progress Tracking</span>
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message._id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'ai' ? (
                  <Bot className="avatar-icon" />
                ) : (
                  <User className="avatar-icon" />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.content}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message ai">
              <div className="message-avatar">
                <Bot className="avatar-icon" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && suggestions.length > 0 && (
          <div className="suggestions-container">
            <h3>Try asking me about:</h3>
            <div className="suggestions-grid">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-button"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="message-input-form">
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about fitness, nutrition, or workouts..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !inputMessage.trim()}>
              <Send className="send-icon" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AICoach;