import React from 'react';
import Header from './Header';
import Sidebar from '../Sidebar/Sidebar';
import './MainLayout.css';

const MainLayout = ({ children, showSidebar = true, sidebarProps, headerProps }) => {
  return (
    <div className="main-layout">
      <Header {...headerProps} />
      
      <div className="layout-body">
        {showSidebar && (
          <aside className="layout-sidebar">
            <Sidebar {...sidebarProps} />
          </aside>
        )}
        
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
