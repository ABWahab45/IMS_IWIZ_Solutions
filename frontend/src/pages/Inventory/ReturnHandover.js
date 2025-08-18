import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/axiosConfig';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ReturnHandover = () => {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState('');
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnNotes, setReturnNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission('canReturnHandover')) {
      toast.error('You do not have permission to return handovers');
      navigate('/dashboard');
      return;
    }
    fetchMyHandovers();
    fetchProducts();
  }, [hasPermission, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.position-relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchMyHandovers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/handovers/my-handovers?status=handed_over`);
      setHandovers(response.data.handovers || []);
    } catch (error) {
      console.error('Error fetching handovers:', error);
      toast.error('Failed to load your handovers');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedHandover || !returnQuantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const handover = handovers.find(h => h._id === selectedHandover);
    if (!handover) {
      toast.error('Selected handover not found');
      return;
    }

    if (parseInt(returnQuantity) > handover.quantity) {
      toast.error('Return quantity cannot exceed borrowed quantity');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(`/handovers/${selectedHandover}/return`, {
        returnQuantity: parseInt(returnQuantity),
        returnNotes: returnNotes.trim(),
        returnedBy: user._id
      });

      toast.success('Handover returned successfully');
      setSelectedHandover('');
      setReturnQuantity(1);
      setReturnNotes('');
      fetchMyHandovers(); // Refresh the list
    } catch (error) {
      console.error('Error returning handover:', error);
      const errorMessage = error.response?.data?.message || 'Failed to return handover';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity || !reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/handovers/request', {
        productId: selectedProduct,
        quantity: parseInt(quantity),
        reason: reason.trim(),
        requestedBy: user._id
      });

      toast.success('Handover request submitted successfully! Waiting for manager approval.');
      setSelectedProduct('');
      setQuantity(1);
      setReason('');
      setShowRequestForm(false);
      fetchMyHandovers(); // Refresh the list
    } catch (error) {
      console.error('Error requesting handover:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit handover request';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHandovers = handovers.filter(handover =>
    handover.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    handover.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSelectedHandover = () => {
    return handovers.find(h => h._id === selectedHandover);
  };

  if (loading) {
    return <LoadingSpinner text="Loading your handovers..." />;
  }

    return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">My Handovers</h1>
          <p className="text-muted mb-0">View and manage your handover requests</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setShowRequestForm(true)}
          >
            <i className="fas fa-hand-holding-heart me-2"></i>
            Request Handover
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

      {!showRequestForm ? (
        // Handovers List View
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-list text-primary me-2"></i>
                  My Handovers
                </h5>
              </div>
              <div className="card-body">
                {handovers.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox text-muted fa-3x mb-3"></i>
                    <p className="text-muted">No handovers found</p>
                    <small className="text-muted">You don't have any handover requests at the moment</small>
                    <div className="mt-3">
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowRequestForm(true)}
                      >
                        <i className="fas fa-hand-holding-heart me-2"></i>
                        Request Your First Handover
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Status</th>
                          <th>Request Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {handovers.map((handover) => (
                          <tr key={handover._id}>
                            <td>
                              <div>
                                <strong>{handover.product?.name}</strong>
                                <div className="small text-muted">{handover.purpose}</div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-primary">{handover.quantity}</span>
                            </td>
                            <td>
                              <span className={`badge bg-${
                                handover.status === 'pending' ? 'warning' :
                                handover.status === 'handed_over' ? 'success' :
                                handover.status === 'returned' ? 'info' :
                                handover.status === 'rejected' ? 'danger' : 'secondary'
                              }`}>
                                {handover.status.charAt(0).toUpperCase() + handover.status.slice(1).replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(handover.createdAt).toLocaleDateString()}
                              </small>
                            </td>
                            <td>
                              {handover.status === 'handed_over' && (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    setSelectedHandover(handover._id);
                                    setReturnQuantity(1);
                                    setReturnNotes('');
                                  }}
                                  title="Return Item"
                                >
                                  <i className="fas fa-undo"></i>
                                </button>
                              )}
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
        </div>
      ) : (
        // Request Handover Form
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-hand-holding-heart text-primary me-2"></i>
                  Request Handover Form
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleRequestSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <i className="fas fa-search text-primary me-1"></i>
                        Search & Select Product *
                      </label>
                      <div className="position-relative">
                        <div className="input-group">
                          <span className="input-group-text bg-light">
                            <i className="fas fa-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search and select a product..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            required
                          />
                        </div>
                        {showDropdown && filteredProducts.length > 0 && (
                          <div className="position-absolute w-100 bg-white border rounded-bottom shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                            {filteredProducts.map((product) => (
                              <div
                                key={product._id}
                                className="p-3 border-bottom cursor-pointer hover-bg-light"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedProduct(product._id);
                                  setSearchTerm(product.name);
                                  setShowDropdown(false);
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                              >
                                <div className="fw-medium text-primary">{product.name}</div>
                                <div className="d-flex justify-content-between align-items-center mt-1">
                                  <small className="text-muted">
                                    Available: <span className="badge bg-success">{product.stock?.quantity || 0}</span>
                                  </small>
                                  <small className="text-muted">
                                    {product.description ? `${product.description.substring(0, 30)}...` : 'No description'}
                                  </small>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <i className="fas fa-layer-group text-primary me-1"></i>
                        Quantity *
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                        />
                        <span className="input-group-text">units</span>
                      </div>
                      <small className="text-muted">
                        Enter the quantity you need
                      </small>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium">
                        <i className="fas fa-comment text-primary me-1"></i>
                        Reason for Request *
                      </label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Please explain why you need this item..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                      ></textarea>
                      <small className="text-muted">
                        <i className="fas fa-lightbulb me-1"></i>
                        Be specific about your needs to help with approval
                      </small>
                    </div>

                    <div className="col-12">
                      <div className="d-flex gap-3 pt-3">
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-2"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Submitting Request...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane me-2"></i>
                              Submit Request
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary px-4 py-2"
                          onClick={() => setShowRequestForm(false)}
                        >
                          <i className="fas fa-times me-2"></i>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-info-circle text-info me-2"></i>
                  Request Guidelines
                </h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Provide a clear reason for your request
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Request only what you need
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    Your request will be reviewed by management
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-check text-success me-2"></i>
                    You'll be notified when your request is approved/denied
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {selectedHandover && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-undo me-2"></i>
                  Return Handover
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedHandover('')}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-info mb-4">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Returning:</strong> {getSelectedHandover()?.product?.name}
                </div>
                
                <form onSubmit={handleReturnSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <i className="fas fa-box text-primary me-1"></i>
                        Product
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={getSelectedHandover()?.product?.name || 'N/A'}
                        readOnly
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <i className="fas fa-layer-group text-primary me-1"></i>
                        Borrowed Quantity
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={getSelectedHandover()?.quantity}
                          readOnly
                        />
                        <span className="input-group-text bg-light">units</span>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <i className="fas fa-undo text-primary me-1"></i>
                        Return Quantity *
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          max={getSelectedHandover()?.quantity}
                          value={returnQuantity}
                          onChange={(e) => setReturnQuantity(e.target.value)}
                          required
                        />
                        <span className="input-group-text">units</span>
                      </div>
                      <small className="text-muted">
                        Maximum: {getSelectedHandover()?.quantity} units
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <i className="fas fa-calendar text-primary me-1"></i>
                        Return Date
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={new Date().toLocaleDateString()}
                        readOnly
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium">
                        <i className="fas fa-sticky-note text-primary me-1"></i>
                        Return Notes
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Any notes about the return (optional)..."
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedHandover('')}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={handleReturnSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Returning...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-undo me-2"></i>
                      Return Item
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

export default ReturnHandover;
