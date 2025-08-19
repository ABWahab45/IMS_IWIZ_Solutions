import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import ThemeToggle from '../Common/ThemeToggle';
import { getAvatarImageUrl } from '../../utils/imageUtils';

const Navbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const { collapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleUserMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle user menu clicked, current state:', showUserMenu);
    setShowUserMenu(!showUserMenu);
  };



  return (
    <nav className="top-navbar d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <button
          className="btn btn-link navbar-icon me-3"
          onClick={toggleSidebar}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <i className="fas fa-bars fs-5"></i>
        </button>
        <h5 className="mb-0 fw-semibold navbar-title">
          Inventory Management System
        </h5>
      </div>

      <div className="d-flex align-items-center gap-3">
        <ThemeToggle className="me-3" />

        <div className="position-relative" ref={userMenuRef}>
          <button
            className="btn btn-link navbar-icon p-0 d-flex align-items-center"
            onClick={toggleUserMenu}
          >
            <div className="d-flex align-items-center">
              {user?.avatar ? (
                <img
                  src={getAvatarImageUrl(user.avatar)}
                  alt={user.firstName}
                  className="rounded-circle me-2"
                  width="32"
                  height="32"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                  <i className="fas fa-user text-white" style={{ fontSize: '0.875rem' }}></i>
                </div>
              )}
              <div className="text-start d-none d-md-block">
                <div className="fw-medium" style={{ fontSize: '0.875rem' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </div>
              </div>
              <i className="fas fa-chevron-down ms-2" style={{ fontSize: '0.75rem' }}></i>
            </div>
          </button>

          {showUserMenu && (
            <div className="dropdown-menu dropdown-menu-end show position-absolute" style={{ top: '100%', right: 0, zIndex: 99999, minWidth: '200px' }}>
              <div className="dropdown-header">
                <div className="fw-semibold">{user?.firstName} {user?.lastName}</div>
                <div className="text-muted small">{user?.email}</div>
              </div>
              <div className="dropdown-divider"></div>
              
              <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                <i className="fas fa-user me-2"></i>
                My Profile
              </Link>
              
              <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                <i className="fas fa-cog me-2"></i>
                Settings
              </Link>
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-2"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
