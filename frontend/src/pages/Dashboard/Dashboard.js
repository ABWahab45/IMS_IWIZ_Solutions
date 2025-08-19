import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/axiosConfig';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const { user, hasPermission, isAdmin } = useAuth();

  const isManagerOrAbove = () => {
    return user?.role === 'admin' || user?.role === 'manager';
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setActivityLoading(true);
      const [statsResponse, activityResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent-activity?limit=10')
      ]);
      
      setDashboardData(statsResponse.data);
      
      const activities = activityResponse.data.activities || [];
      const filteredActivities = activities.filter(activity => {
        if (activity.type === 'user' && !hasPermission('canManageUsers')) {
          return false;
        }
        return true;
      });
      
      setRecentActivity(filteredActivities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setActivityLoading(false);
    }
  }, [hasPermission]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);





  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const statsCards = [
    {
      title: 'Total Products',
      value: dashboardData?.totalProducts || 0,
      icon: 'fas fa-box',
      color: 'primary'
    },
    {
      title: 'Total Stock Value',
      value: `₨${(dashboardData?.totalValue || 0).toLocaleString()}`,
      icon: 'fas fa-rupee-sign',
      color: 'info'
    },
    {
      title: 'Total Users',
      value: dashboardData?.totalUsers || 0,
      icon: 'fas fa-users',
      color: 'success'
    },
    {
      title: 'Recent Activities',
      value: recentActivity.length,
      icon: 'fas fa-history',
      color: 'warning'
    }
  ];

  return (
    <div className="dashboard fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted mb-0">Here's what's happening with your inventory today.</p>
        </div>
        <div className="text-end">
          <small className="text-muted">
            Last updated: {new Date().toLocaleDateString('en-PK')}
          </small>
        </div>
      </div>

      <div className="row mb-4">
        {/* Stats Cards - Conditional Layout based on permissions */}
        <div className={hasPermission('canManageUsers') ? "col-lg-7" : "col-lg-5"}>
          <div className="row">
            {/* For Managers: Vertical stack on left */}
            {!hasPermission('canManageUsers') ? (
              <>
                {/* Total Products Card */}
                <div className="col-md-12 mb-3">
                  <Link to="/inventory" className="text-decoration-none">
                    <div className="card stats-card primary h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="stats-number">{statsCards[0].value.toLocaleString()}</div>
                            <div className="stats-label">{statsCards[0].title}</div>
                          </div>
                          <div className="stats-icon">
                            <i className={`${statsCards[0].icon} fa-2x opacity-75`}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                {/* Recent Activities Card - directly under Total Products */}
                <div className="col-md-12 mb-3">
                  <Link to="/dashboard" className="text-decoration-none">
                    <div className="card stats-card warning h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="stats-number">{statsCards[3].value.toLocaleString()}</div>
                            <div className="stats-label">{statsCards[3].title}</div>
                          </div>
                          <div className="stats-icon">
                            <i className={`${statsCards[3].icon} fa-2x opacity-75`}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* For Admins: 2x2 grid with all 4 cards */}
                {/* First Row */}
                <div className="col-md-6 mb-3">
                  <Link to="/inventory" className="text-decoration-none">
                    <div className="card stats-card primary h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="stats-number">{statsCards[0].value.toLocaleString()}</div>
                            <div className="stats-label">{statsCards[0].title}</div>
                          </div>
                          <div className="stats-icon">
                            <i className={`${statsCards[0].icon} fa-2x opacity-75`}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="col-md-6 mb-3">
                  <Link to="/inventory" className="text-decoration-none">
                    <div className="card stats-card info h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="stats-number">{statsCards[1].value}</div>
                            <div className="stats-label">{statsCards[1].title}</div>
                          </div>
                          <div className="stats-icon">
                            <i className={`${statsCards[1].icon} fa-2x opacity-75`}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                {/* Second Row */}
                <div className="col-md-6 mb-3">
                  <Link to="/users" className="text-decoration-none">
                    <div className="card stats-card success h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="stats-number">{statsCards[2].value.toLocaleString()}</div>
                            <div className="stats-label">{statsCards[2].title}</div>
                          </div>
                          <div className="stats-icon">
                            <i className={`${statsCards[2].icon} fa-2x opacity-75`}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="col-md-6 mb-3">
                  <Link to="/dashboard" className="text-decoration-none">
                    <div className="card stats-card warning h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="stats-number">{statsCards[3].value.toLocaleString()}</div>
                            <div className="stats-label">{statsCards[3].title}</div>
                          </div>
                          <div className="stats-icon">
                            <i className={`${statsCards[3].icon} fa-2x opacity-75`}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions - Next to Stats */}
        <div className={hasPermission('canManageUsers') ? "col-lg-5" : "col-lg-7"}>
          <div className={`card ${!hasPermission('canManageUsers') ? 'quick-actions-manager' : 'h-100'}`}>
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-bolt text-primary me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {hasPermission('canAddProducts') && (
                  <div className="col-6">
                    <Link to="/inventory/new" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                      <i className="fas fa-box fa-2x mb-2"></i>
                      <span>Add Item</span>
                    </Link>
                  </div>
                )}

                {hasPermission('canManageProducts') && (
                  <div className="col-6">
                    <Link to="/inventory/handover" className="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                      <i className="fas fa-hand-holding fa-2x mb-2"></i>
                      <span>Hand Over</span>
                    </Link>
                  </div>
                )}

                {hasPermission('canManageProducts') && (
                  <div className="col-6">
                    <Link to="/inventory/restock" className="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                      <i className="fas fa-plus fa-2x mb-2"></i>
                      <span>Restock</span>
                    </Link>
                  </div>
                )}

                {hasPermission('canManageProducts') && (
                  <div className="col-6">
                    <Link to="/inventory/usage" className="btn btn-outline-warning w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                      <i className="fas fa-minus fa-2x mb-2"></i>
                      <span>Record Usage</span>
                    </Link>
                  </div>
                )}

                {hasPermission('canManageProducts') && (
                  <div className="col-6">
                    <Link to="/inventory/pending-handovers" className="btn btn-outline-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                      <i className="fas fa-clock fa-2x mb-2"></i>
                      <span>Pending Requests</span>
                    </Link>
                  </div>
                )}

                {hasPermission('canRequestHandover') && !isAdmin() && !isManagerOrAbove() && (
                  <div className="col-6">
                    <Link to="/inventory/request-handover" className="btn btn-outline-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                      <i className="fas fa-hand-holding-heart fa-2x mb-2"></i>
                      <span>Request Item</span>
                    </Link>
                  </div>
                )}

                {hasPermission('canReturnHandover') && !isAdmin() && !isManagerOrAbove() && (
                  <div className="col-6">
                    <Link to="/inventory/return-handover" className="btn btn-outline-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                      <i className="fas fa-undo fa-2x mb-2"></i>
                      <span>My Handovers</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Full Width Below */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="fas fa-history text-info me-2"></i>
                Recent Activity
              </h5>
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted">Last 30 days</small>
                <button 
                  className="btn btn-sm btn-outline-secondary activity-refresh-btn"
                  onClick={fetchDashboardData}
                  disabled={activityLoading}
                  title="Refresh activities"
                >
                  <i className={`fas fa-sync-alt ${activityLoading ? 'fa-spin' : ''}`}></i>
                </button>
                {recentActivity.length > 0 && (
                  <Link to="/reports" className="btn btn-sm btn-outline-primary">
                    View All
                  </Link>
                )}
              </div>
            </div>
            <div className="card-body">
              {activityLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="text-muted">Loading recent activities...</span>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center activity-empty-state">
                  <i className="fas fa-clock text-muted fa-3x mb-3"></i>
                  <p className="text-muted">No recent activity</p>
                  <small className="text-muted">Activities will appear here as you add products, users, or perform handovers</small>
                  <div className="mt-3">
                    <Link to="/inventory/new" className="btn btn-sm btn-outline-primary me-2">
                      <i className="fas fa-plus me-1"></i>
                      Add Product
                    </Link>
                    <Link to="/inventory/handover" className="btn btn-sm btn-outline-info">
                      <i className="fas fa-hand-holding me-1"></i>
                      Hand Over Item
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="activity-list">
                  {recentActivity.slice(0, 8).map((activity, index) => (
                    <div key={index} className="activity-item d-flex align-items-start mb-3">
                      <div className={`activity-icon me-2 bg-${activity.color || 'secondary'} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`} style={{width: '35px', height: '35px'}}>
                        <i className={`${activity.icon || 'fas fa-info-circle'} text-${activity.color || 'secondary'}`} style={{fontSize: '0.875rem'}}></i>
                      </div>
                      <div className="activity-content flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1 min-w-0 me-2">
                            <div className="fw-semibold text-dark text-truncate mb-1">{activity.title || 'Activity'}</div>
                            <div className="text-muted small text-truncate mb-1">{activity.description || 'No description available'}</div>
                            {activity.user && activity.user.firstName && activity.user.lastName && (
                              <div className="text-muted small text-truncate">
                                by {activity.user.firstName} {activity.user.lastName}
                              </div>
                            )}
                          </div>
                          <div className="text-end flex-shrink-0">
                            <small className="text-muted d-block">
                              {activity.date ? new Date(activity.date).toLocaleDateString('en-PK') : 'Unknown date'}
                            </small>
                            <small className="text-muted d-block">
                              {activity.date ? new Date(activity.date).toLocaleTimeString('en-PK', {hour: '2-digit', minute: '2-digit'}) : ''}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;