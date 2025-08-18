import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/axiosConfig';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const HandOver = () => {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission('canManageProducts')) {
      toast.error('You do not have permission to view handovers');
      return;
    }
    fetchHandovers();
  }, [hasPermission]);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/handovers');
      setHandovers(response.data.handovers || []);
    } catch (error) {
      console.error('Error fetching handovers:', error);
      toast.error('Failed to load handovers');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (handoverId) => {
    try {
      await api.put(`/handovers/${handoverId}/return`);
      toast.success('Item returned successfully');
      fetchHandovers();
    } catch (error) {
      toast.error('Failed to process return');
    }
  };

  const handleDelete = async () => {
    if (!selectedHandover) return;
    
    try {
      setDeleting(true);
      await api.delete(`/handovers/${selectedHandover._id}`);
      toast.success('Handover deleted successfully');
      setShowDeleteModal(false);
      setSelectedHandover(null);
      fetchHandovers();
    } catch (error) {
      console.error('Error deleting handover:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete handover';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const getAllHandovers = () => {
    return handovers;
  };

  if (loading) {
    return <LoadingSpinner text="Loading handovers..." />;
  }

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Hand Over Management</h1>
          <p className="text-muted mb-0">Manage item handovers to employees</p>
      </div>
        <div className="d-flex gap-2">
          {hasPermission('canManageProducts') && (
            <Link to="/inventory/handover/new" className="btn btn-primary">
              <i className="fas fa-hand-holding me-2"></i>
                New Hand Over
            </Link>
          )}
          </div>
        </div>



      {/* All Handovers */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
            <i className="fas fa-list me-2 text-info"></i>
                All Handovers
              </h5>
            </div>
            <div className="card-body">
          {getAllHandovers().length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No handovers recorded yet</p>
              {hasPermission('canManageProducts') && (
                <Link to="/inventory/handover/new" className="btn btn-primary">
                  <i className="fas fa-hand-holding me-2"></i>
                  Create First Hand Over
                </Link>
              )}
                </div>
              ) : (
                <div className="table-responsive">
               <table className="table table-hover mb-0">
                 <thead className="table-light">
                      <tr>
                     <th className="d-none d-lg-table-cell">Date</th>
                        <th>Product</th>
                     <th className="d-none d-md-table-cell">Employee</th>
                        <th>Quantity</th>
                     <th className="d-none d-lg-table-cell">Purpose</th>
                     <th className="d-none d-sm-table-cell">Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                  {getAllHandovers().map(handover => (
                        <tr key={handover._id}>
                      <td className="text-nowrap d-none d-lg-table-cell">
                        {new Date(handover.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-truncate" title={handover.product?.name}>
                        {handover.product?.name}
                      </td>
                      <td className="text-truncate d-none d-md-table-cell" title={`${handover.employee?.firstName} ${handover.employee?.lastName}`}>
                        {handover.employee?.firstName} {handover.employee?.lastName}
                      </td>
                          <td>{handover.quantity}</td>
                      <td className="text-truncate d-none d-lg-table-cell" title={handover.purpose || '-'}>
                        {handover.purpose || '-'}
                      </td>
                                                                                       <td className="d-none d-sm-table-cell">
                            <span className={`badge bg-${
                              handover.status === 'handed_over' ? 'warning' :
                              handover.status === 'returned' ? 'success' :
                              handover.status === 'pending' ? 'info' :
                              handover.status === 'rejected' ? 'danger' : 'secondary'
                            }`}>
                              {handover.status === 'handed_over' ? 'Handed Over' :
                               handover.status === 'returned' ? 'Returned' :
                               handover.status === 'pending' ? 'Pending' :
                               handover.status === 'rejected' ? 'Rejected' : 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                 className="btn btn-outline-primary"
                                 onClick={() => {
                                   // TODO: Implement view functionality
                                   console.log('View handover:', handover);
                                 }}
                                 title="View Details"
                               >
                                 <i className="fas fa-eye"></i>
                               </button>
                               <button
                                 className="btn btn-outline-danger"
                                 onClick={() => {
                                   setSelectedHandover(handover);
                                   setShowDeleteModal(true);
                                 }}
                                 title="Delete Handover"
                               >
                                 <i className="fas fa-trash"></i>
                               </button>
                               <button
                                 className={`btn ${handover.status === 'handed_over' ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                                 onClick={() => {
                                   if (handover.status === 'handed_over') {
                                     handleReturn(handover._id);
                                   }
                                 }}
                                 disabled={handover.status !== 'handed_over'}
                                 title={handover.status === 'handed_over' ? 'Return Item' : 'Already Returned'}
                               >
                                 <i className="fas fa-undo"></i>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHandover && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Confirm Delete
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedHandover(null);
                  }}
                  disabled={deleting}
                ></button>
              </div>
              <div className="modal-body">
                                 <div className="alert alert-warning">
                   <i className="fas fa-exclamation-triangle me-2"></i>
                   <strong>Warning:</strong> This action cannot be undone.
                 </div>
                 <p>Are you sure you want to delete this handover?</p>
                 {selectedHandover.status === 'handed_over' && (
                   <div className="alert alert-info">
                     <i className="fas fa-info-circle me-2"></i>
                     <strong>Note:</strong> Stock will be automatically restored to inventory.
                   </div>
                 )}
                 {(selectedHandover.status === 'pending' || selectedHandover.status === 'rejected') && (
                   <div className="alert alert-info">
                     <i className="fas fa-info-circle me-2"></i>
                     <strong>Note:</strong> No stock will be affected as this handover was never approved.
                   </div>
                 )}
                <div className="card bg-light">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <strong>Product:</strong> {selectedHandover.product?.name}
                      </div>
                      <div className="col-md-6">
                        <strong>Employee:</strong> {selectedHandover.employee?.firstName} {selectedHandover.employee?.lastName}
                      </div>
                      <div className="col-md-6">
                        <strong>Quantity:</strong> {selectedHandover.quantity}
                      </div>
                      <div className="col-md-6">
                        <strong>Status:</strong> 
                        <span className={`badge bg-${
                          selectedHandover.status === 'pending' ? 'warning' :
                          selectedHandover.status === 'rejected' ? 'danger' : 'secondary'
                        } ms-2`}>
                          {selectedHandover.status.charAt(0).toUpperCase() + selectedHandover.status.slice(1)}
                        </span>
                      </div>
                      {selectedHandover.purpose && (
                        <div className="col-12 mt-2">
                          <strong>Purpose:</strong> {selectedHandover.purpose}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedHandover(null);
                  }}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash me-2"></i>
                      Delete Handover
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandOver;