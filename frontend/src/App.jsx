import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWindow from './components/Chat/ChatWindow';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import './App.css';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);

  const handleNewThread = () => {
    setCurrentThreadId(null);
  };

  const handleThreadSelect = (threadId) => {
    setCurrentThreadId(threadId);
  };

  const handleThreadCreated = (threadId) => {
    setCurrentThreadId(threadId);
  };

  return (
    <AuthProvider>
      <div className="app">
        <Header
          onLoginClick={() => setShowLogin(true)}
          onSignupClick={() => setShowSignup(true)}
        />

        <div className="app-body">
          <Sidebar
            currentThreadId={currentThreadId}
            onThreadSelect={handleThreadSelect}
            onNewThread={handleNewThread}
          />

          <ChatWindow
            threadId={currentThreadId}
            onThreadCreated={handleThreadCreated}
          />
        </div>

        {showLogin && (
          <Login
            onClose={() => setShowLogin(false)}
            onSwitchToSignup={() => {
              setShowLogin(false);
              setShowSignup(true);
            }}
          />
        )}

        {showSignup && (
          <Signup
            onClose={() => setShowSignup(false)}
            onSwitchToLogin={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
          />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
