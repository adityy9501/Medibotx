// import React, { useState, useEffect, useRef } from 'react';
// import { chatService } from '../../services/chatService';
// import { threadService } from '../../services/threadService';
// import MessageList from './MessageList';
// import MessageInput from './MessageInput';
// import './ChatWindow.css';

// const ChatWindow = ({ threadId, onThreadCreated }) => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [streaming, setStreaming] = useState(false);
//   const [streamingMessage, setStreamingMessage] = useState('');
//   const abortStreamRef = useRef(null);
//   const streamingMessageRef = useRef('');

//   useEffect(() => {
//     if (threadId) {
//       loadMessages();
//     } else {
//       setMessages([]);
//     }
//   }, [threadId]);

//   const loadMessages = async () => {
//     try {
//       const data = await threadService.getThreadMessages(threadId);
//       setMessages(data);
//     } catch (error) {
//       console.error('Failed to load messages:', error);
//     }
//   };

//   const handleSend = async (message) => {
//     if (!message.trim() || loading || streaming) return;

//     let currentThreadId = threadId;

//     // Create thread if it doesn't exist
//     if (!currentThreadId) {
//       try {
//         const newThread = await threadService.createThread('New Conversation', false);
//         currentThreadId = newThread.id;
//         onThreadCreated(newThread.id);
//       } catch (error) {
//         console.error('Failed to create thread:', error);
//         alert('Failed to create conversation. Please check if the backend is running.');
//         return;
//       }
//     }

//     const userMessage = message;
//     setLoading(true);
//     setStreaming(true);
//     setStreamingMessage('');
//     streamingMessageRef.current = '';

//     // Add user message to UI immediately
//     const newUserMessage = {
//       role: 'user',
//       content: userMessage,
//       created_at: new Date().toISOString(),
//     };
//     setMessages((prev) => [...prev, newUserMessage]);

//     // Stream response
//     abortStreamRef.current = chatService.streamChat(
//       currentThreadId,
//       userMessage,
//       // onChunk - called for each piece of streamed data
//       (chunk) => {
//         streamingMessageRef.current += chunk;
//         setStreamingMessage(streamingMessageRef.current);
//       },
//       // onComplete - called when streaming finishes
//       () => {
//         console.log('Stream complete, final message:', streamingMessageRef.current);
        
//         // Add assistant message to the message list
//         const assistantMessage = {
//           role: 'assistant',
//           content: streamingMessageRef.current,
//           created_at: new Date().toISOString(),
//         };
        
//         setMessages((prev) => [...prev, assistantMessage]);
//         setStreamingMessage('');
//         streamingMessageRef.current = '';
//         setStreaming(false);
//         setLoading(false);
        
//         // Reload messages from backend to ensure sync
//         setTimeout(() => loadMessages(), 500);
//       },
//       // onError - called if there's an error
//       (error) => {
//         console.error('Streaming error:', error);
//         setStreaming(false);
//         setLoading(false);
//         setStreamingMessage('');
//         streamingMessageRef.current = '';
        
//         // Show user-friendly error message
//         let errorMessage = 'Failed to get response. ';
//         if (error.includes('NetworkError') || error.includes('Failed to fetch')) {
//           errorMessage += 'Backend server is not responding. Please ensure the backend is running on http://localhost:8000';
//         } else {
//           errorMessage += error;
//         }
        
//         alert(errorMessage);
//       }
//     );
//   };

//   return (
//     <div className="chat-window">
//       <MessageList
//         messages={messages}
//         streamingMessage={streamingMessage}
//         loading={loading}
//       />
//       <MessageInput
//         onSend={handleSend}
//         disabled={loading || streaming}
//       />
//     </div>
//   );
// };

// export default ChatWindow;
import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/chatService';
import { threadService } from '../../services/threadService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const ChatWindow = ({ threadId, onThreadCreated }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const abortStreamRef = useRef(null);
  const streamingMessageRef = useRef('');

  useEffect(() => {
    if (threadId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [threadId]);

  const loadMessages = async () => {
    try {
      const data = await threadService.getThreadMessages(threadId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSend = async (message) => {
    if (!message.trim() || loading || streaming) return;

    let currentThreadId = threadId;

    // Create thread if it doesn't exist
    if (!currentThreadId) {
      try {
        const newThread = await threadService.createThread('New Conversation', false);
        currentThreadId = newThread.id;
        onThreadCreated(newThread.id);
      } catch (error) {
        console.error('Failed to create thread:', error);
        alert('Failed to create conversation. Please check if the backend is running.');
        return;
      }
    }

    const userMessage = message;
    setLoading(true);
    setStreaming(true);
    setStreamingMessage('');
    streamingMessageRef.current = '';

    // Add user message to UI immediately
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Stream response
    abortStreamRef.current = chatService.streamChat(
      currentThreadId,
      userMessage,
      // onChunk - called for each piece of streamed data
      (chunk) => {
        streamingMessageRef.current += chunk;
        setStreamingMessage(streamingMessageRef.current);
      },
      // onComplete - called when streaming finishes
      () => {
        console.log('Stream complete, final message:', streamingMessageRef.current);
        
        // Add assistant message to the message list
        const assistantMessage = {
          role: 'assistant',
          content: streamingMessageRef.current,
          created_at: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingMessage('');
        streamingMessageRef.current = '';
        setStreaming(false);
        setLoading(false);
        
        // ❌ REMOVED: Don't reload messages - they're already in state
        // setTimeout(() => loadMessages(), 500);
      },
      // onError - called if there's an error
      (error) => {
        console.error('Streaming error:', error);
        setStreaming(false);
        setLoading(false);
        setStreamingMessage('');
        streamingMessageRef.current = '';
        
        let errorMessage = 'Failed to get response. ';
        if (error.includes('NetworkError') || error.includes('Failed to fetch')) {
          errorMessage += 'Backend server is not responding. Please ensure the backend is running on http://localhost:8000';
        } else {
          errorMessage += error;
        }
        
        alert(errorMessage);
      }
    );
  };

  return (
    <div className="chat-window">
      <MessageList
        messages={messages}
        streamingMessage={streamingMessage}
        loading={loading}
      />
      <MessageInput
        onSend={handleSend}
        disabled={loading || streaming}
      />
    </div>
  );
};

export default ChatWindow;
