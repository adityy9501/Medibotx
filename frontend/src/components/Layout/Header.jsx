import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = ({ onLoginClick, onSignupClick }) => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">🏥 MedBotX</h1>
        <span className="tagline">Your AI Medical Assistant</span>
      </div>

      <div className="header-right">
        {isAuthenticated() ? (
          <>
            <span className="user-email">{user?.email || 'User'}</span>
            <button className="btn-secondary" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={onLoginClick}>
              Login
            </button>
            <button className="btn-primary" onClick={onSignupClick}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
