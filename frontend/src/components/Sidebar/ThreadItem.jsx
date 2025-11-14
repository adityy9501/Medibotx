// import React from 'react';
// import './ThreadItem.css';

// const ThreadItem = ({ thread, isActive, onSelect, onDelete }) => {
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diff = now - date;
//     const hours = Math.floor(diff / (1000 * 60 * 60));
    
//     if (hours < 1) return 'Just now';
//     if (hours < 24) return `${hours}h ago`;
//     if (hours < 48) return 'Yesterday';
    
//     const days = Math.floor(hours / 24);
//     if (days < 7) return `${days}d ago`;
    
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//   };

//   return (
//     <div
//       className={`thread-item ${isActive ? 'active' : ''}`}
//       onClick={() => onSelect(thread.id)}
//     >
//       <div className="thread-content">
//         <div className="thread-title">{thread.title}</div>
//         <div className="thread-meta">
//           <span className="thread-date">{formatDate(thread.updated_at)}</span>
//           {thread.is_guest && <span className="guest-badge">Guest</span>}
//         </div>
//       </div>
      
//       <button
//         className="thread-delete-btn"
//         onClick={(e) => {
//           e.stopPropagation();
//           onDelete(thread.id);
//         }}
//         title="Delete conversation"
//       >
//         🗑️
//       </button>
//     </div>
//   );
// };

// export default ThreadItem;
import React, { useState, useRef, useEffect } from 'react';
import './ThreadItem.css';

const ThreadItem = ({ thread, isActive, onSelect, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(thread.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editTitle.trim() && editTitle !== thread.title) {
      await onUpdate(thread.id, editTitle.trim());
    } else {
      setEditTitle(thread.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(thread.title);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <div
      className={`thread-item ${isActive ? 'active' : ''}`}
      onClick={() => !isEditing && onSelect(thread.id)}
    >
      <div className="thread-content">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="thread-title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="thread-title">{thread.title}</div>
        )}
        <div className="thread-meta">
          <span className="thread-date">{formatDate(thread.updated_at)}</span>
          {thread.is_guest && <span className="guest-badge">Guest</span>}
        </div>
      </div>
      
      <div className="thread-actions">
        <button
          className="thread-edit-btn"
          onClick={handleEdit}
          title="Edit conversation name"
        >
          ✏️
        </button>
        <button
          className="thread-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(thread.id);
          }}
          title="Delete conversation"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ThreadItem;
