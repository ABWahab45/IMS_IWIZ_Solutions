import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const HandoverDetail = () => {
  const [handover, setHandover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  
  const { id } = useParams();
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();

  const fetchHandover = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/handovers/${id}`);
      setHandover(response.data);
    } catch (error) {
      console.error('Error fetching handover:', error);
      toast.error('Failed to load handover details');
      navigate('/inventory/handover');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!hasPermission('canViewProducts')) {
      toast.error('You do not have permission to view handovers');
      navigate('/dashboard');
      return;
    }
    fetchHandover();
  }, [hasPermission, navigate, fetchHandover]);

  const handleAction = async () => {
    if (!actionNotes.trim() && actionType === 'reject') {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      
      if (actionType === 'approve') {
        await api.post(`/handovers/${id}/approve`, {
          approvalNotes: actionNotes.trim(),
          approvedBy: user.id
        });
        toast.success('Handover request approved successfully');
      } else if (actionType === 'reject') {
        await api.post(`/handovers/${id}/reject`, {
          rejectionReason: actionNotes.trim(),
          rejectedBy: user.id
        });
        toast.success('Handover request rejected successfully');
      } else if (actionType === 'return') {
        await api.put(`/handovers/${id}/return`, {
          returnNotes: actionNotes.trim()
        });
        toast.success('Item returned successfully');
      }
      
      setShowActionModal(false);
      setActionType('');
      setActionNotes('');
      fetchHandover();
    } catch (error) {
      console.error('Error performing action:', error);
      const errorMessage = error.response?.data?.message || 'Failed to perform action';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'warning', text: 'Pending', icon: 'clock' },
      handed_over: { class: 'info', text: 'Handed Over', icon: 'check-circle' },
      returned: { class: 'success', text: 'Returned', icon: 'undo' },
      rejected: { class: 'danger', text: 'Rejected', icon: 'times' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`badge bg-${config.class} d-flex align-items-center gap-1`}>
        <i className={`fas fa-${config.icon}`}></i>
        {config.text}
      </span>
    );
  };

  const getStockStatus = (requested, available) => {
    if (available >= requested) {
      return { class: 'success', text: 'In Stock', icon: 'check-circle' };
    } else if (available > 0) {
      return { class: 'warning', text: 'Low Stock', icon: 'exclamation-triangle' };
    } else {
      return { class: 'danger', text: 'Out of Stock', icon: 'times-circle' };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  if (loading) {
    return <LoadingSpinner text="Loading handover details..." />;
  }

  if (!handover) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          Handover not found
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(
    handover.quantity, 
    handover.product?.stock?.quantity || 0
  );

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="fas fa-hand-holding me-2"></i>
            Handover Details
          </h1>
          <p className="text-muted mb-0">
            {handover.product?.name} - {handover.employee?.firstName} {handover.employee?.lastName}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/inventory/handover" className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Handovers
          </Link>
          {handover.status === 'pending' && hasPermission('canManageProducts') && (
            <>
              <button
                className="btn btn-success"
                onClick={() => {
                  setActionType('approve');
                  setShowActionModal(true);
                }}
              >
                <i className="fas fa-check me-2"></i>
                Approve
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  setActionType('reject');
                  setShowActionModal(true);
                }}
              >
                <i className="fas fa-times me-2"></i>
                Reject
              </button>
            </>
          )}
          {handover.status === 'handed_over' && hasPermission('canManageProducts') && (
            <button
              className="btn btn-info"
              onClick={() => {
                setActionType('return');
                setShowActionModal(true);
              }}
            >
              <i className="fas fa-undo me-2"></i>
              Mark as Returned
            </button>
          )}
        </div>
      </div>

      <div className="row">
        {/* Main Details */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Handover Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted">Status</label>
                    <div>{getStatusBadge(handover.status)}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Quantity</label>
                    <div className="fw-bold fs-5">{handover.quantity}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Purpose</label>
                    <div className="fw-bold">{handover.purpose || 'Not specified'}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted">Request Date</label>
                    <div className="fw-bold">{formatDate(handover.createdAt)}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Expected Return Date</label>
                    <div className="fw-bold">{formatDate(handover.expectedReturnDate)}</div>
                  </div>
                  {handover.actualReturnDate && (
                    <div className="mb-3">
                      <label className="form-label text-muted">Actual Return Date</label>
                      <div className="fw-bold">{formatDate(handover.actualReturnDate)}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {handover.notes && (
                <div className="mb-3">
                  <label className="form-label text-muted">Notes</label>
                  <div className="fw-bold">{handover.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-user me-2"></i>
                Employee Information
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                     style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                  {handover.employee?.firstName?.charAt(0)}{handover.employee?.lastName?.charAt(0)}
                </div>
                <div>
                  <h5 className="mb-1">{handover.employee?.firstName} {handover.employee?.lastName}</h5>
                  <p className="text-muted mb-0">{handover.employee?.email}</p>
                  <small className="text-muted">Role: {handover.employee?.role}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-box me-2"></i>
                Product Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted">Product Name</label>
                    <div className="fw-bold">{handover.product?.name}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Product ID</label>
                    <div className="fw-bold">{handover.product?.productId}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Current Stock</label>
                    <div className="fw-bold">
                      {handover.product?.stock?.quantity || 0} {handover.product?.stock?.unit || 'pcs'}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted">Stock Status</label>
                    <div>
                      <span className={`badge bg-${stockStatus.class} d-flex align-items-center gap-1`}>
                        <i className={`fas fa-${stockStatus.icon}`}></i>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Category</label>
                    <div className="fw-bold">{handover.product?.category || 'Not specified'}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Price</label>
                    <div className="fw-bold">₨{handover.product?.price?.selling?.toLocaleString() || '0'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Action History */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-history me-2"></i>
                Action History
              </h5>
            </div>
            <div className="card-body">
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker bg-primary"></div>
                  <div className="timeline-content">
                    <h6 className="mb-1">Request Created</h6>
                    <small className="text-muted">{formatDate(handover.createdAt)}</small>
                    <p className="mb-0 small">Request submitted by {handover.employee?.firstName} {handover.employee?.lastName}</p>
                  </div>
                </div>

                                 {handover.handedOverBy && (
                   <div className="timeline-item">
                     <div className="timeline-marker bg-success"></div>
                     <div className="timeline-content">
                       <h6 className="mb-1">Handed Over</h6>
                       <small className="text-muted">{formatDate(handover.handOverDate)}</small>
                       <p className="mb-0 small">Handed over by {handover.handedOverBy?.firstName} {handover.handedOverBy?.lastName}</p>
                       {handover.approvalNotes && (
                         <p className="mb-0 small text-muted">Notes: {handover.approvalNotes}</p>
                       )}
                     </div>
                   </div>
                 )}

                {handover.returnedBy && (
                  <div className="timeline-item">
                    <div className="timeline-marker bg-info"></div>
                    <div className="timeline-content">
                      <h6 className="mb-1">Returned</h6>
                      <small className="text-muted">{formatDate(handover.actualReturnDate)}</small>
                      <p className="mb-0 small">Returned by {handover.returnedBy?.firstName} {handover.returnedBy?.lastName}</p>
                      {handover.returnNotes && (
                        <p className="mb-0 small text-muted">Notes: {handover.returnNotes}</p>
                      )}
                    </div>
                  </div>
                )}

                                 {handover.status === 'rejected' && (
                   <div className="timeline-item">
                     <div className="timeline-marker bg-danger"></div>
                     <div className="timeline-content">
                       <h6 className="mb-1">Rejected</h6>
                       <small className="text-muted">{formatDate(handover.updatedAt)}</small>
                       <p className="mb-0 small">Rejected by {handover.rejectedBy?.firstName || 'Unknown'} {handover.rejectedBy?.lastName || ''}</p>
                       {handover.rejectionReason && (
                         <p className="mb-0 small text-muted">Reason: {handover.rejectionReason}</p>
                       )}
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {handover.status === 'pending' && hasPermission('canManageProducts') && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-bolt me-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setActionType('approve');
                      setShowActionModal(true);
                    }}
                    disabled={stockStatus.class === 'danger'}
                  >
                    <i className="fas fa-check me-2"></i>
                    Approve Request
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setActionType('reject');
                      setShowActionModal(true);
                    }}
                  >
                    <i className="fas fa-times me-2"></i>
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {actionType === 'approve' && <i className="fas fa-check text-success me-2"></i>}
                  {actionType === 'reject' && <i className="fas fa-times text-danger me-2"></i>}
                  {actionType === 'return' && <i className="fas fa-undo text-info me-2"></i>}
                  {actionType === 'approve' && 'Approve Request'}
                  {actionType === 'reject' && 'Reject Request'}
                  {actionType === 'return' && 'Mark as Returned'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowActionModal(false);
                    setActionType('');
                    setActionNotes('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    {actionType === 'approve' && 'Approval Notes (Optional)'}
                    {actionType === 'reject' && 'Rejection Reason'}
                    {actionType === 'return' && 'Return Notes (Optional)'}
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder={
                      actionType === 'approve' ? 'Add any notes about the approval...' :
                      actionType === 'reject' ? 'Provide a reason for rejection...' :
                      'Add any notes about the return...'
                    }
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    required={actionType === 'reject'}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowActionModal(false);
                    setActionType('');
                    setActionNotes('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn ${
                    actionType === 'approve' ? 'btn-success' :
                    actionType === 'reject' ? 'btn-danger' :
                    'btn-info'
                  }`}
                  onClick={handleAction}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === 'approve' && <i className="fas fa-check me-2"></i>}
                      {actionType === 'reject' && <i className="fas fa-times me-2"></i>}
                      {actionType === 'return' && <i className="fas fa-undo me-2"></i>}
                      {actionType === 'approve' && 'Approve Request'}
                      {actionType === 'reject' && 'Reject Request'}
                      {actionType === 'return' && 'Mark as Returned'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showActionModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default HandoverDetail;
