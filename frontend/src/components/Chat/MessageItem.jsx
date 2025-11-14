import React from 'react';
import './MessageItem.css';

const MessageItem = ({ message }) => {
  const isUser = message.role === 'user';
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message-item ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      
      <div className="message-bubble">
        <div className="message-text">{message.content}</div>
        {message.created_at && (
          <div className="message-timestamp">
            {formatTime(message.created_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
