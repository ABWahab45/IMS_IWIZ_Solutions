import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/axiosConfig';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getAvatarImageUrl } from '../../utils/imageUtils';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission('canManageUsers')) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    fetchUsers();
  }, [searchTerm, roleFilter, hasPermission]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        ...(roleFilter !== 'all' && { role: roleFilter })
      });
      
      const response = await api.get(`/users?${params}`);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/toggle-status`);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleEdit = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { class: 'danger', text: 'Admin' },
      manager: { class: 'warning', text: 'Manager' },
      employee: { class: 'info', text: 'Employee' }
    };
    
    const config = roleConfig[role] || roleConfig.employee;
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  if (!hasPermission('canManageUsers')) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">User Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/users/new')}
        >
          <i className="fas fa-plus me-2"></i>
          Add User
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-control"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div className="col-md-3 text-end">
              <small className="text-muted">
                {users.length} users found
              </small>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          {users.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No users found</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th className="d-none d-md-table-cell">Email</th>
                    <th>Role</th>
                    <th className="d-none d-sm-table-cell">Status</th>
                    <th className="d-none d-lg-table-cell">Last Login</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm me-3">
                            {user.avatar ? (
                              <img
                                src={getAvatarImageUrl(user.avatar)}
                                alt={user.firstName}
                                className="rounded-circle"
                                width="40"
                                height="40"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <strong>{user.firstName} {user.lastName}</strong>
                            {user.phone && (
                              <div className="small text-muted">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="d-none d-md-table-cell">{user.email}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td className="d-none d-sm-table-cell">
                        <span className={`badge bg-${user.isActive ? 'success' : 'warning'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="d-none d-lg-table-cell">
                        <small className="text-muted">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-PK') : 'Never'}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className={`btn btn-outline-${user.isActive ? 'warning' : 'success'}`}
                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`fas fa-${user.isActive ? 'pause' : 'play'}`}></i>
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            title="Edit"
                            onClick={() => handleEdit(user._id)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Delete"
                            onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;