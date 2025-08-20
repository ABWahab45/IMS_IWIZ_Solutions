import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import ThemeToggle from '../Common/ThemeToggle';
import ImageWithFallback from '../Common/ImageWithFallback';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav className="top-navbar">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-link text-dark me-3"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars"></i>
          </button>
          <h4 className="mb-0">Inventory Management System</h4>
        </div>

        <div className="d-flex align-items-center">
          <ThemeToggle />
          
          <div className="dropdown ms-3">
            <button
              className="btn btn-link text-dark d-flex align-items-center"
              onClick={toggleUserMenu}
            >
              <ImageWithFallback
                src={user?.avatar}
                alt={user?.firstName}
                type="avatar"
                className="rounded-circle me-2"
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                placeholderText=""
                showPlaceholder={true}
              />
              <span className="d-none d-sm-inline">{user?.firstName}</span>
              <i className="fas fa-chevron-down ms-2"></i>
            </button>

            {showUserMenu && (
              <div className="dropdown-menu show position-absolute end-0 mt-2">
                <div className="dropdown-item-text">
                  <div className="fw-bold">{user?.firstName} {user?.lastName}</div>
                  <div className="small text-muted">{user?.email}</div>
                </div>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="/profile">
                  <i className="fas fa-user me-2"></i>
                  Profile
                </a>
                <a className="dropdown-item" href="/settings">
                  <i className="fas fa-cog me-2"></i>
                  Settings
                </a>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
