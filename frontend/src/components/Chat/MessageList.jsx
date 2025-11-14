import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import StreamingMessage from './StreamingMessage';
import './MessageList.css';

const MessageList = ({ messages, streamingMessage, loading }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="message-list">
      {messages.length === 0 && !streamingMessage && !loading && (
        <div className="welcome-screen">
          <div className="welcome-icon">🏥</div>
          <h1>Welcome to MedBotX</h1>
          <p className="welcome-subtitle">Your AI-powered medical assistant</p>
          
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">🩺</div>
              <h3>Symptoms & Conditions</h3>
              <p>Get information about medical symptoms, diseases, and health conditions</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💊</div>
              <h3>Medications & Treatments</h3>
              <p>Learn about medications, treatments, and therapeutic approaches</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏃</div>
              <h3>Health & Wellness</h3>
              <p>Discover preventive care tips and healthy lifestyle recommendations</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Mental Health</h3>
              <p>Access information about psychological well-being and mental health</p>
            </div>
          </div>

          <div className="disclaimer-box">
            <div className="disclaimer-icon">⚠️</div>
            <div className="disclaimer-content">
              <strong>Important Disclaimer:</strong>
              <p>This AI provides general medical information only. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment. In case of emergency, call emergency services immediately.</p>
            </div>
          </div>
        </div>
      )}

      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}

      {streamingMessage && <StreamingMessage content={streamingMessage} />}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
