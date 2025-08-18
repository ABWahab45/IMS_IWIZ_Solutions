import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/axiosConfig';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Reports = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    dateRange: '30',
    limit: 50
  });
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchActivities();
  }, [filters]);

  // Reset filter if user doesn't have permission to view user activities
  useEffect(() => {
    if (filters.type === 'user' && !hasPermission('canManageUsers')) {
      setFilters(prev => ({ ...prev, type: 'all' }));
    }
  }, [filters.type, hasPermission]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/dashboard/recent-activity?limit=${filters.limit}`);
      // Filter out user activities for managers (only admins can see user activities)
      const activities = response.data.activities || [];
      const filteredActivities = activities.filter(activity => {
        if (activity.type === 'user' && !hasPermission('canManageUsers')) {
          return false;
        }
        // For employees, only show their own handover activities
        if (activity.type === 'handover' && !hasPermission('canManageUsers')) {
          // This will be handled by the backend, but we can add additional frontend filtering if needed
          return true;
        }
        return true;
      });
      
      setActivities(filteredActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'product': return 'Product';
      case 'user': return 'User';
      case 'handover': return 'Handover';
      case 'stock': return 'Stock';
      default: return 'All';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'product': return 'fas fa-box';
      case 'user': return 'fas fa-user';
      case 'handover': return 'fas fa-hand-holding';
      case 'stock': return 'fas fa-warehouse';
      default: return 'fas fa-info-circle';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'product': return 'primary';
      case 'user': return 'success';
      case 'handover': return 'warning';
      case 'stock': return 'secondary';
      default: return 'info';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filters.type !== 'all' && activity.type !== filters.type) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Loading activities..." />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Activity Reports</h1>
          <p className="text-muted mb-0">View all system activities and events</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={fetchActivities}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Activity Type</label>
                             <select
                 className="form-select"
                 value={filters.type}
                 onChange={(e) => setFilters({ ...filters, type: e.target.value })}
               >
                 <option value="all">All Activities</option>
                 <option value="product">Products</option>
                 {hasPermission('canManageUsers') && <option value="user">Users</option>}
                 <option value="handover">Handovers</option>
                 <option value="stock">Stock Updates</option>
               </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Results Limit</label>
              <select
                className="form-select"
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
              >
                <option value="20">20 Results</option>
                <option value="50">50 Results</option>
                <option value="100">100 Results</option>
                <option value="200">200 Results</option>
              </select>
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <div className="text-muted">
                Showing {filteredActivities.length} of {activities.length} activities
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="fas fa-list text-primary me-2"></i>
            Activity History
          </h5>
        </div>
        <div className="card-body">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-search text-muted fa-3x mb-3"></i>
              <p className="text-muted">No activities found</p>
              <small className="text-muted">Try adjusting your filters or check back later</small>
            </div>
          ) : (
                         <div className="reports-activity-list">
                             {filteredActivities.map((activity, index) => (
                 <div key={index} className={`activity-item d-flex align-items-start ${index < filteredActivities.length - 1 ? 'mb-3' : ''}`}>
                   <div className={`activity-icon me-2 bg-${getActivityColor(activity.type)} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`} style={{width: '35px', height: '35px'}}>
                     <i className={`${getActivityIcon(activity.type)} text-${getActivityColor(activity.type)}`} style={{fontSize: '0.875rem'}}></i>
                   </div>
                   <div className="activity-content flex-grow-1 min-w-0">
                     <div className="d-flex justify-content-between align-items-start">
                       <div className="flex-grow-1 min-w-0 me-2">
                         <div className="fw-semibold text-dark text-truncate mb-1">{activity.title || 'Activity'}</div>
                         <div className="text-muted small text-truncate mb-1">{activity.description || 'No description available'}</div>
                         {activity.user && activity.user.firstName && activity.user.lastName && (
                           <div className="text-muted small text-truncate mb-1">
                             by {activity.user.firstName} {activity.user.lastName}
                           </div>
                         )}
                         <div>
                           <span className={`badge bg-${getActivityColor(activity.type)} bg-opacity-10 text-${getActivityColor(activity.type)}`}>
                             {getActivityTypeLabel(activity.type)}
                           </span>
                         </div>
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
  );
};

export default Reports;
