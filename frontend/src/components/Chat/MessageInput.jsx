import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickPrompts = [
    'What are the symptoms of flu?',
    'How to lower blood pressure naturally?',
    'Tell me about Type 2 diabetes',
    'What causes headaches?',
  ];

  const handleQuickPrompt = (prompt) => {
    if (!disabled) {
      setMessage(prompt);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="message-input-container">
      {message === '' && (
        <div className="quick-prompts">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              className="quick-prompt-btn"
              onClick={() => handleQuickPrompt(prompt)}
              disabled={disabled}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-input-form">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about health and medicine..."
          disabled={disabled}
          rows="1"
          className="message-textarea"
        />
        
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="send-button"
          title="Send message (Enter)"
        >
          {disabled ? (
            <span className="loading-spinner">⏳</span>
          ) : (
            <span className="send-icon">🚀</span>
          )}
        </button>
      </form>

      <div className="input-footer">
        <span className="input-hint">
          Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for new line
        </span>
      </div>
    </div>
  );
};

export default MessageInput;
