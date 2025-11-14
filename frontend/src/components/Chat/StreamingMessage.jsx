// import React from 'react';
// import './StreamingMessage.css';

// const StreamingMessage = ({ content }) => {
//   return (
//     <div className="message-item assistant streaming">
//       <div className="message-avatar">
//         <div className="avatar-pulse">🤖</div>
//       </div>
      
//       <div className="message-bubble">
//         <div className="message-text">
//           {content}
//           <span className="typing-cursor">▋</span>
//         </div>
//         <div className="streaming-indicator">
//           <span className="dot"></span>
//           <span className="dot"></span>
//           <span className="dot"></span>
//           <span className="streaming-text">AI is typing</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StreamingMessage;
import React from 'react';
import './StreamingMessage.css';

const StreamingMessage = ({ content }) => {
  return (
    <div className="message-item assistant streaming">
      {/* Pencil Avatar */}
      <div className="message-avatar streaming-avatar">
        <div className="pencil-avatar">✏️</div>
      </div>
      
      <div className="message-bubble">
        {/* Header with status */}
        <div className="streaming-header">
          <span className="status-dot"></span>
          <span className="status-text">AI is writing</span>
        </div>
        
        {/* Message content */}
        <div className="message-text">
          {content}
          <span className="typing-cursor">▋</span>
        </div>
        
        {/* Footer with animated dots */}
        <div className="streaming-footer">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default StreamingMessage;
