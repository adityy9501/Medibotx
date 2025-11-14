import React from 'react';
import ThreadItem from './ThreadItem';
import './ThreadList.css';

const ThreadList = ({ threads, currentThreadId, onThreadSelect, onThreadDelete, loading }) => {
  if (loading) {
    return (
      <div className="thread-list-loading">
        <div className="spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="thread-list-empty">
        <div className="empty-icon">💬</div>
        <h3>No conversations yet</h3>
        <p>Start a new conversation to begin!</p>
      </div>
    );
  }

  return (
    <div className="thread-list">
      {threads.map((thread) => (
        <ThreadItem
          key={thread.id}
          thread={thread}
          isActive={currentThreadId === thread.id}
          onSelect={onThreadSelect}
          onDelete={onThreadDelete}
        />
      ))}
    </div>
  );
};

export default ThreadList;
