import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ImageWithFallback from '../../components/Common/ImageWithFallback';

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const { id } = useParams();
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();

  const fetchProduct = useCallback(async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
      navigate('/inventory');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]); 

  useEffect(() => {
    if (!hasPermission('canViewProducts')) {
      toast.error('You do not have permission to view products');
      navigate('/dashboard');
      return;
    }
    
    fetchProduct();
  }, [hasPermission, navigate, fetchProduct]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      navigate('/inventory');
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStockStatus = (quantity, minLevel) => {
    if (quantity === 0) return { text: 'Out of Stock', class: 'danger' };
    return { text: 'In Stock', class: 'success' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  const isEmployee = () => {
    return user?.role === 'employee';
  };

  if (loading) {
    return <LoadingSpinner text="Loading product details..." />;
  }

  if (!product) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          Product not found
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock?.quantity || 0, product.stock?.minStock || 0);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Product Details</h1>
        <div className="d-flex gap-2">
          <Link to="/inventory" className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Inventory
          </Link>
          {hasPermission('canAddProducts') && (
            <Link to={`/inventory/${id}/edit`} className="btn btn-primary">
              <i className="fas fa-edit me-2"></i>
              Edit Product
            </Link>
          )}
          {hasPermission('canDeleteProducts') && (
            <button
              className="btn btn-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <i className="fas fa-trash me-2"></i>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Product Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h4>{product.name}</h4>
                  <p className="text-muted mb-3">{product.description}</p>
                  
                  <div className="mb-3">
                    <strong>Unit:</strong> {product.stock?.unit || 'pcs'}
                  </div>
                  
                  <div className="mb-3">
                    <strong>Location:</strong> {product.stock?.location || 'Not specified'}
                  </div>
                  
                  <div className="mb-3">
                    <strong>Status:</strong>
                    <span className={`badge bg-${product.status === 'active' ? 'success' : product.status === 'inactive' ? 'warning' : 'danger'} ms-2`}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </span>
                  </div>
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="mb-3">
                      <strong>Tags:</strong>
                      <div className="mt-1">
                        {product.tags.map((tag, index) => (
                          <span key={index} className="badge bg-secondary bg-opacity-10 text-dark me-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="col-md-6">
                  <div className="product-images">
                    <ImageWithFallback
                      src={product.images && product.images.length > 0 ? product.images[0] : null}
                      alt={product.name}
                      type="product"
                      className="img-fluid rounded"
                      style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                      placeholderText="No images available"
                    />
                    {product.images && product.images.length > 1 && (
                      <div className="mt-2">
                        <small className="text-muted">
                          +{product.images.length - 1} more image(s)
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">
                {isEmployee() ? 'Stock Information' : 'Pricing & Stock'}
              </h5>
            </div>
            <div className="card-body">
              {!isEmployee() && (
                <>
                  <div className="mb-3">
                    <strong>Cost Price:</strong>
                    <div className="h5 text-primary">{formatCurrency(product.price?.cost || 0)}</div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Selling Price:</strong>
                    <div className="h5 text-success">{formatCurrency(product.price?.selling || 0)}</div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Profit Margin:</strong>
                    <div className="h6">
                      {formatCurrency((product.price?.selling || 0) - (product.price?.cost || 0))}
                      <small className="text-muted ms-1">
                        ({(((product.price?.selling || 0) - (product.price?.cost || 0)) / (product.price?.cost || 1) * 100).toFixed(1)}%)
                      </small>
                    </div>
                  </div>
                  
                  <hr />
                </>
              )}
              
              <div className="mb-3">
                <strong>Current Stock:</strong>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="h5">{product.stock?.quantity || 0} {product.stock?.unit || 'pcs'}</span>
                  <span className={`badge bg-${stockStatus.class}`}>
                    {stockStatus.text}
                  </span>
                </div>
              </div>
              

            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Metadata</h5>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <strong>Created:</strong>
                <div className="small text-muted">
                  {new Date(product.createdAt).toLocaleDateString('en-PK')}
                </div>
              </div>
              
              <div className="mb-2">
                <strong>Last Updated:</strong>
                <div className="small text-muted">
                  {new Date(product.updatedAt).toLocaleDateString('en-PK')}
                </div>
              </div>
              
              {product.createdBy && (
                <div className="mb-2">
                  <strong>Created By:</strong>
                  <div className="small text-muted">
                    {product.createdBy.firstName} {product.createdBy.lastName}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{product.name}</strong>?</p>
                <p className="text-danger small">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
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
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash me-2"></i>
                      Delete Product
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

export default ProductDetail;