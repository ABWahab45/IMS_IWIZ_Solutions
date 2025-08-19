import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/axiosConfig';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const PendingHandovers = () => {
  const [pendingHandovers, setPendingHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [filters, setFilters] = useState({
    search: '',
    status: 'pending'
  });
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();

  useEffect(() => {
    if (!hasPermission('canManageProducts')) {
      toast.error('You do not have permission to manage handovers');
      navigate('/dashboard');
      return;
    }
    fetchPendingHandovers();
  }, [hasPermission, navigate]);

  const fetchPendingHandovers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/handovers/pending');
      setPendingHandovers(response.data.handovers || []);
    } catch (error) {
      console.error('Error fetching pending handovers:', error);
      toast.error('Failed to load pending handovers');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (handover, type) => {
    setSelectedHandover(handover);
    setActionType(type);
    setApprovalNotes('');
    setRejectionReason('');
  };

  const handleApprove = async () => {
    if (!selectedHandover) return;

    try {
      setApproving(true);
      await api.post(`/handovers/${selectedHandover._id}/approve`, {
        approvalNotes: approvalNotes.trim(),
        approvedBy: user.id
      });

      toast.success('Handover request approved successfully');
      setSelectedHandover(null);
      setActionType('');
      setApprovalNotes('');
      fetchPendingHandovers();
    } catch (error) {
      console.error('Error approving handover:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve handover';
      toast.error(errorMessage);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedHandover) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setRejecting(true);
      await api.post(`/handovers/${selectedHandover._id}/reject`, {
        rejectionReason: rejectionReason.trim(),
        rejectedBy: user.id
      });

      toast.success('Handover request rejected successfully');
      setSelectedHandover(null);
      setActionType('');
      setRejectionReason('');
      fetchPendingHandovers();
    } catch (error) {
      console.error('Error rejecting handover:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject handover';
      toast.error(errorMessage);
    } finally {
      setRejecting(false);
    }
  };



  const filteredHandovers = pendingHandovers.filter(handover => {
    const matchesSearch = 
      handover.employee?.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      handover.employee?.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      handover.product?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      handover.purpose?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch;
  });

  const getStockStatus = (requested, available) => {
    if (available >= requested) {
      return { class: 'success', text: 'In Stock', icon: 'check-circle' };
    } else if (available > 0) {
      return { class: 'warning', text: 'Low Stock', icon: 'exclamation-triangle' };
    } else {
      return { class: 'danger', text: 'Out of Stock', icon: 'times-circle' };
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading pending handovers..." />;
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="fas fa-clock text-warning me-2"></i>
            Pending Handover Requests
          </h1>
          <p className="text-muted mb-0">
            Review and manage employee handover requests ({pendingHandovers.length} pending)
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate('/inventory/handover')}
          >
            <i className="fas fa-plus me-2"></i>
            New Handover
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/inventory')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Inventory
          </button>
        </div>
      </div>



      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by employee, product, or reason..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={fetchPendingHandovers}
                >
                  <i className="fas fa-sync-alt me-2"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Handovers List */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="fas fa-list me-2"></i>
            Pending Requests ({filteredHandovers.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {filteredHandovers.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-check-circle text-success fa-3x mb-3"></i>
              <h5>No pending handover requests</h5>
              <p className="text-muted">All requests have been processed</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Stock Status</th>
                    <th>Reason</th>
                    <th>Request Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHandovers.map((handover) => {
                    const stockStatus = getStockStatus(
                      handover.quantity, 
                      handover.product?.stock?.quantity || 0
                    );
                    
                    return (
                      <tr key={handover._id} className={stockStatus.class === 'danger' ? 'table-danger' : ''}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                 style={{width: '40px', height: '40px', fontSize: '1rem'}}>
                              {handover.employee?.firstName?.charAt(0)}{handover.employee?.lastName?.charAt(0)}
                            </div>
                            <div>
                              <strong>{handover.employee?.firstName} {handover.employee?.lastName}</strong>
                              <div className="small text-muted">{handover.employee?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{handover.product?.name}</strong>
                            <div className="small text-muted">
                              Available: {handover.product?.stock?.quantity || 0} {handover.product?.stock?.unit || 'pcs'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-primary fs-6">{handover.quantity}</span>
                        </td>
                        <td>
                          <span className={`badge bg-${stockStatus.class} d-flex align-items-center gap-1`}>
                            <i className={`fas fa-${stockStatus.icon}`}></i>
                            {stockStatus.text}
                          </span>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '200px' }} title={handover.purpose}>
                            {handover.purpose}
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="small">
                              {new Date(handover.createdAt).toLocaleDateString()}
                            </div>
                            <div className="small text-muted">
                              {new Date(handover.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-success"
                              onClick={() => handleActionClick(handover, 'approve')}
                              title="Approve Request"
                              disabled={stockStatus.class === 'danger'}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleActionClick(handover, 'reject')}
                              title="Reject Request"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                            <Link
                              to={`/inventory/handover/${handover._id}`}
                              className="btn btn-info"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {selectedHandover && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {actionType === 'approve' && <i className="fas fa-check text-success me-2"></i>}
                  {actionType === 'reject' && <i className="fas fa-times text-danger me-2"></i>}
                  {actionType === 'view' && <i className="fas fa-eye text-info me-2"></i>}
                  Review Handover Request
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setSelectedHandover(null);
                    setActionType('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary mb-3">Employee Information</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                               style={{width: '50px', height: '50px', fontSize: '1.2rem'}}>
                            {selectedHandover.employee?.firstName?.charAt(0)}{selectedHandover.employee?.lastName?.charAt(0)}
                          </div>
                          <div>
                            <h6 className="mb-0">{selectedHandover.employee?.firstName} {selectedHandover.employee?.lastName}</h6>
                            <small className="text-muted">{selectedHandover.employee?.email}</small>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-6">
                            <small className="text-muted">Role</small>
                            <div className="fw-bold">{selectedHandover.employee?.role}</div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Department</small>
                            <div className="fw-bold">General</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="text-primary mb-3">Product Information</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="mb-2">{selectedHandover.product?.name}</h6>
                        <div className="row">
                          <div className="col-6">
                            <small className="text-muted">Requested</small>
                            <div className="fw-bold">{selectedHandover.quantity}</div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Available</small>
                            <div className="fw-bold">{selectedHandover.product?.stock?.quantity || 0}</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          {getStockStatus(selectedHandover.quantity, selectedHandover.product?.stock?.quantity || 0).text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-12">
                    <h6 className="text-primary mb-3">Request Details</h6>
                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <small className="text-muted">Purpose/Reason</small>
                            <div className="fw-bold">{selectedHandover.purpose}</div>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">Request Date</small>
                            <div className="fw-bold">
                              {new Date(selectedHandover.createdAt).toLocaleDateString()} at {new Date(selectedHandover.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {actionType === 'approve' && (
                  <div className="mt-3">
                    <label className="form-label">Approval Notes (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Add any notes about the approval..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                    ></textarea>
                  </div>
                )}

                {actionType === 'reject' && (
                  <div className="mt-3">
                    <label className="form-label">Rejection Reason <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Provide a reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    ></textarea>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedHandover(null);
                    setActionType('');
                  }}
                >
                  Cancel
                </button>
                
                {actionType === 'approve' && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleApprove}
                    disabled={approving}
                  >
                    {approving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Approving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Approve Request
                      </>
                    )}
                  </button>
                )}
                
                {actionType === 'reject' && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleReject}
                    disabled={rejecting}
                  >
                    {rejecting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times me-2"></i>
                        Reject Request
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {selectedHandover && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default PendingHandovers;
