// import React, { useState, useEffect } from 'react';
// import { threadService } from '../../services/threadService';
// import { useAuth } from '../../context/AuthContext';
// import './Sidebar.css';

// const Sidebar = ({ currentThreadId, onThreadSelect, onNewThread }) => {
//   const [threads, setThreads] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const { isAuthenticated } = useAuth();

//   useEffect(() => {
//     if (isAuthenticated()) {
//       loadThreads();
//     }
//   }, [isAuthenticated]);

//   const loadThreads = async () => {
//     setLoading(true);
//     try {
//       const data = await threadService.getThreads();
//       setThreads(data);
//     } catch (error) {
//       console.error('Failed to load threads:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (threadId, e) => {
//     e.stopPropagation();
//     if (window.confirm('Delete this conversation?')) {
//       try {
//         await threadService.deleteThread(threadId);
//         setThreads(threads.filter((t) => t.id !== threadId));
//         if (currentThreadId === threadId) {
//           onNewThread();
//         }
//       } catch (error) {
//         console.error('Failed to delete thread:', error);
//       }
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diff = now - date;
//     const hours = Math.floor(diff / (1000 * 60 * 60));
    
//     if (hours < 24) {
//       return hours === 0 ? 'Just now' : `${hours}h ago`;
//     }
//     return date.toLocaleDateString();
//   };

//   return (
//     <div className="sidebar">
//       <button className="new-thread-btn" onClick={onNewThread}>
//         ➕ New Conversation
//       </button>

//       <div className="threads-container">
//         {!isAuthenticated() ? (
//           <div className="guest-message">
//             <p>🔒 Login to save your conversations</p>
//           </div>
//         ) : loading ? (
//           <div className="loading">Loading...</div>
//         ) : threads.length === 0 ? (
//           <div className="empty-state">
//             <p>No conversations yet</p>
//             <p className="empty-subtitle">Start a new one!</p>
//           </div>
//         ) : (
//           threads.map((thread) => (
//             <div
//               key={thread.id}
//               className={`thread-item ${currentThreadId === thread.id ? 'active' : ''}`}
//               onClick={() => onThreadSelect(thread.id)}
//             >
//               <div className="thread-content">
//                 <h4 className="thread-title">{thread.title}</h4>
//                 <p className="thread-date">{formatDate(thread.updated_at)}</p>
//               </div>
//               <button
//                 className="delete-btn"
//                 onClick={(e) => handleDelete(thread.id, e)}
//                 title="Delete"
//               >
//                 🗑️
//               </button>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
// new

import React, { useState, useEffect } from 'react';
import { threadService } from '../../services/threadService';
import { useAuth } from '../../context/AuthContext';
import ThreadItem from './ThreadItem';
import './Sidebar.css';

const Sidebar = ({ currentThreadId, onThreadSelect, onNewThread }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated()) {
      loadThreads();
    }
  }, [isAuthenticated]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const data = await threadService.getThreads();
      setThreads(data);
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (threadId) => {
    if (window.confirm('Delete this conversation?')) {
      try {
        await threadService.deleteThread(threadId);
        setThreads(threads.filter((t) => t.id !== threadId));
        if (currentThreadId === threadId) {
          onNewThread();
        }
      } catch (error) {
        console.error('Failed to delete thread:', error);
      }
    }
  };

  // ✨ NEW: Handle thread update
  const handleUpdate = async (threadId, newTitle) => {
    try {
      const updatedThread = await threadService.updateThread(threadId, newTitle);
      setThreads(threads.map((t) => (t.id === threadId ? updatedThread : t)));
    } catch (error) {
      console.error('Failed to update thread:', error);
      alert('Failed to update conversation name');
    }
  };

  return (
    <div className="sidebar">
      <button className="new-thread-btn" onClick={onNewThread}>
        ➕ NEW CONVERSATION
      </button>

      <div className="threads-container">
        {!isAuthenticated() ? (
          <div className="guest-message">
            <p>🔒 Login to save your conversations</p>
          </div>
        ) : loading ? (
          <div className="loading">Loading...</div>
        ) : threads.length === 0 ? (
          <div className="empty-state">
            <p>No conversations yet</p>
            <p className="empty-subtitle">Start a new one!</p>
          </div>
        ) : (
          threads.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              isActive={currentThreadId === thread.id}
              onSelect={onThreadSelect}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
 