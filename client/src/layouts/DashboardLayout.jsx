import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="app-container">
      {/* Mobile Topbar */}
      <div className="topbar">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle Navigation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
        <div className="logo-text">ExpenseTracker</div>
        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
          {getInitials(user?.name)}
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <div className="logo-icon">ET</div>
          <span className="logo-text">SmartTracker</span>
          <button 
            className="menu-btn" 
            style={{ marginLeft: 'auto', display: isSidebarOpen ? 'block' : 'none' }} 
            onClick={closeSidebar}
            aria-label="Close Navigation"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="nav-links">
          <NavLink to="/" end className="nav-link" onClick={closeSidebar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            Dashboard
          </NavLink>

          <NavLink to="/expenses" className="nav-link" onClick={closeSidebar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Expenses
          </NavLink>

          <NavLink to="/income" className="nav-link" onClick={closeSidebar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
            Income
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'User Profile'}</span>
              <span className="user-email">{user?.email || 'user@example.com'}</span>
            </div>
          </div>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={logout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className="modal-overlay" style={{ zIndex: 9 }} onClick={closeSidebar} />}

      <main className="main-layout">
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
