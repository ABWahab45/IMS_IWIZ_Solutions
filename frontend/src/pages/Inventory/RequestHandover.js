import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const RequestHandover = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission('canRequestHandover')) {
      toast.error('You do not have permission to request handovers');
      navigate('/dashboard');
      return;
    }
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
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
      navigate('/inventory');
    } catch (error) {
      console.error('Error requesting handover:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit handover request';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Loading products..." />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Request Handover</h1>
          <p className="text-muted mb-0">Request to borrow items from inventory (requires manager approval)</p>
        </div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/inventory')}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Inventory
        </button>
      </div>

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
              <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Search & Select Product *</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search and select a product..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        required
                      />
                      {showDropdown && filteredProducts.length > 0 && (
                        <div className="position-absolute w-100 bg-white border rounded-bottom shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                          {filteredProducts.map((product) => (
                            <div
                              key={product._id}
                              className="p-2 border-bottom cursor-pointer hover-bg-light"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedProduct(product._id);
                                setSearchTerm(product.name);
                                setShowDropdown(false);
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                              <div className="fw-medium">{product.name}</div>
                              <small className="text-muted">
                                Available: {product.stock?.quantity || 0} | 
                                {product.description ? ` ${product.description.substring(0, 50)}...` : ' No description'}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <small className="text-muted">
                      {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                    </small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Reason for Request *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Please explain why you need this item..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-primary"
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
    </div>
  );
};

export default RequestHandover;
