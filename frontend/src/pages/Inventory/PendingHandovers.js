import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

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

  const handleApprove = async (handoverId) => {
    try {
      setApproving(true);
      await api.post(`/handovers/${handoverId}/approve`, {
        approvalNotes: approvalNotes.trim()
      });

      toast.success('Handover request approved successfully');
      setApprovalNotes('');
      setSelectedHandover(null);
      fetchPendingHandovers();
    } catch (error) {
      console.error('Error approving handover:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve handover';
      toast.error(errorMessage);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (handoverId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setRejecting(true);
      await api.post(`/handovers/${handoverId}/reject`, {
        rejectionReason: rejectionReason.trim()
      });

      toast.success('Handover request rejected successfully');
      setRejectionReason('');
      setSelectedHandover(null);
      fetchPendingHandovers();
    } catch (error) {
      console.error('Error rejecting handover:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject handover';
      toast.error(errorMessage);
    } finally {
      setRejecting(false);
    }
  };



  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'warning', text: 'Pending' },
      approved: { class: 'success', text: 'Approved' },
      rejected: { class: 'danger', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return <LoadingSpinner text="Loading pending handovers..." />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Pending Handover Requests</h1>
          <p className="text-muted mb-0">Review and approve/reject employee handover requests</p>
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/inventory')}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Inventory
        </button>
      </div>

             {/* Request Count */}
       <div className="card mb-4">
         <div className="card-body">
           <div className="text-muted">
             {pendingHandovers.length} pending request{pendingHandovers.length !== 1 ? 's' : ''} found
           </div>
         </div>
       </div>

      {/* Pending Requests List */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="fas fa-clock text-warning me-2"></i>
            Pending Requests
          </h5>
        </div>
        <div className="card-body">
                     {pendingHandovers.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-check-circle text-success fa-3x mb-3"></i>
              <p className="text-muted">No pending handover requests</p>
              <small className="text-muted">All requests have been processed</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>Request Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                                     {pendingHandovers.map((handover) => (
                    <tr key={handover._id}>
                      <td>
                        <div>
                          <strong>{handover.employee?.firstName} {handover.employee?.lastName}</strong>
                          <div className="small text-muted">{handover.employee?.email}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{handover.product?.name}</strong>
                          <div className="small text-muted">
                            Available: {handover.product?.stock?.quantity || 0}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-primary">{handover.quantity}</span>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={handover.purpose}>
                          {handover.purpose}
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(handover.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-success"
                            onClick={() => setSelectedHandover(handover)}
                            title="Approve"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => setSelectedHandover(handover)}
                            title="Reject"
                          >
                            <i className="fas fa-times"></i>
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

      {/* Approval Modal */}
      {selectedHandover && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Review Handover Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedHandover(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Employee:</strong> {selectedHandover.employee?.firstName} {selectedHandover.employee?.lastName}
                </div>
                <div className="mb-3">
                  <strong>Product:</strong> {selectedHandover.product?.name}
                </div>
                <div className="mb-3">
                  <strong>Quantity:</strong> {selectedHandover.quantity}
                </div>
                <div className="mb-3">
                  <strong>Reason:</strong> {selectedHandover.purpose}
                </div>
                <div className="mb-3">
                  <strong>Available Stock:</strong> {selectedHandover.product?.stock?.quantity || 0}
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Approval Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Add any notes about the approval..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Rejection Reason (Required for rejection)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedHandover(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleReject(selectedHandover._id)}
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
                      Reject
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedHandover._id)}
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
                      Approve
                    </>
                  )}
                </button>
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
