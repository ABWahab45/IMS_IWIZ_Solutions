import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { getAvatarUrl } from '../../utils/imageUtils';

const Sidebar = () => {
  const location = useLocation();
  const { user, hasPermission, isAdmin } = useAuth();
  const { collapsed, toggleSidebar } = useSidebar();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard',
      show: true
    },
    {
      path: '/inventory',
      icon: 'fas fa-warehouse',
      label: 'Inventory',
      show: hasPermission('canViewProducts')
    },
    {
      path: '/inventory/handover',
      icon: 'fas fa-hand-holding',
      label: 'Hand Over',
      show: hasPermission('canManageProducts')
    },
    {
      path: '/inventory/pending-handovers',
      icon: 'fas fa-clock',
      label: 'Pending Handovers',
      show: hasPermission('canManageProducts')
    },
    {
      path: '/inventory/request-handover',
      icon: 'fas fa-hand-holding-heart',
      label: 'Request Handover',
      show: hasPermission('canRequestHandover') && !isAdmin()
    },
    {
      path: '/inventory/return-handover',
      icon: 'fas fa-undo',
      label: 'My Handovers',
      show: hasPermission('canReturnHandover')
    },
    {
      path: '/reports',
      icon: 'fas fa-chart-bar',
      label: 'Reports',
      show: hasPermission('canViewProducts')
    },
    {
      path: '/users',
      icon: 'fas fa-users',
      label: 'Users',
      show: isAdmin()
    },
    {
      path: '/settings',
      icon: 'fas fa-cog',
      label: 'Settings',
      show: true
    }
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Mobile overlay */}
      <div className="sidebar-overlay d-md-none" onClick={toggleSidebar}></div>
      <div className="sidebar-brand">
        <div className="d-flex align-items-center justify-content-between">
                      {!collapsed && (
              <div>
                <img 
                  src="/iwizlogo.png" 
                  alt="IWIZ Solutions" 
                  style={{ 
                    height: '40px', 
                    width: 'auto',
                    filter: 'brightness(0) invert(1)' // Makes the logo white for sidebar
                  }} 
                />
              </div>
            )}
          <button
            className="btn btn-link text-white p-0"
            onClick={toggleSidebar}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>
      </div>

      {!collapsed && user && (
        <div className="px-3 py-2 border-bottom border-light border-opacity-25">
          <div className="d-flex align-items-center">
            <div className="me-2">
              {user.avatar ? (
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt={user.firstName}
                  className="rounded-circle"
                  width="32"
                  height="32"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                  <i className="fas fa-user text-primary"></i>
                </div>
              )}
            </div>
            <div className="flex-grow-1 text-truncate">
              <div className="text-white fw-medium" style={{ fontSize: '0.875rem' }}>
                {user.firstName} {user.lastName}
              </div>
              <div className="text-white opacity-75" style={{ fontSize: '0.75rem' }}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <ul className="nav flex-column">
          {menuItems.map((item) => {
            if (!item.show) return null;

            return (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  title={collapsed ? item.label : ''}
                >
                  <i className={item.icon}></i>
                  {!collapsed && <span className="ms-2">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="mt-auto p-3 border-top border-light border-opacity-25">
          <div className="text-center">
            <small className="text-white opacity-75">
              © 2025 IWIZ Solutions
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;