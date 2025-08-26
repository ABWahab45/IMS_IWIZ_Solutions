import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ImageWithFallback from '../../components/Common/ImageWithFallback';
import { useAuth } from '../../contexts/AuthContext';

const InventoryList = () => {
  const { user, hasPermission } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: ''
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value 
    }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      handleFilterChange('page', page);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        toast.success('Product deleted successfully');
        fetchProducts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/products?${params.toString()}`);

      setProducts(response.data.products || []);
      setPagination({
        total: response.data.pagination?.total || response.data.total || 0,
        pages: response.data.pagination?.pages || response.data.totalPages || 1,
        current: response.data.pagination?.current || response.data.currentPage || 1
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getStockStatus = (product) => {
    const quantity = product.stock?.quantity || 0;
    if (quantity === 0) {
      return { text: 'Out of Stock', class: 'bg-danger' };
    } else {
      return { text: 'In Stock', class: 'bg-success' };
    }
  };

  const renderPagination = () => {
    if (!pagination.pages || pagination.pages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    // Calculate the range of pages to show
    let startPage = Math.max(1, pagination.current - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add ellipsis and first page if needed
    if (startPage > 1) {
      pages.push(
        <li key="1" className="page-item">
          <button className="page-link" onClick={() => handlePageChange(1)}>
            1
          </button>
        </li>
      );
      if (startPage > 2) {
        pages.push(
          <li key="ellipsis1" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
    }

    // Add the main page range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${pagination.current === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    // Add ellipsis and last page if needed
    if (endPage < pagination.pages) {
      if (endPage < pagination.pages - 1) {
        pages.push(
          <li key="ellipsis2" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      pages.push(
        <li key={pagination.pages} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(pagination.pages)}>
            {pagination.pages}
          </button>
        </li>
      );
    }

    return (
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(1)}>
              First
            </button>
          </li>
          <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(pagination.current - 1)}>
              Previous
            </button>
          </li>
          {pages}
          <li className={`page-item ${pagination.current === pagination.pages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(pagination.current + 1)}>
              Next
            </button>
          </li>
          <li className={`page-item ${pagination.current === pagination.pages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(pagination.pages)}>
              Last
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="products-page fade-in">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Inventory Management</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mb-0">Manage your inventory items</p>
        </div>
        <div className="d-flex gap-2">
          {hasPermission('canAddProducts') && (
            <>
              <Link to="/inventory/usage" className="btn btn-warning">
                <i className="fas fa-minus me-2"></i>
                Record Usage
              </Link>
              <Link to="/inventory/restock" className="btn btn-success">
                <i className="fas fa-plus me-2"></i>
                Restock Items
              </Link>
              <Link to="/inventory/new" className="btn btn-primary">
                <i className="fas fa-box me-2"></i>
                Add New Item
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, ID, or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Products List</h5>
          <div className="d-flex align-items-center gap-2">
            <small style={{ color: 'var(--text-muted)' }}>
              Showing {products.length} of {pagination.total || 0} products
            </small>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Loading products..." />
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-box fa-3x text-muted mb-3"></i>
              <h5 style={{ color: 'var(--text-muted)' }}>No products found</h5>
              <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or add a new product.</p>
              {hasPermission('canAddProducts') && (
                <Link to="/inventory/new" className="btn btn-primary">
                  <i className="fas fa-plus me-2"></i>
                  Add First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="d-none d-md-table-cell">ID</th>
                    <th>Product</th>
                    <th>Stock</th>
                    <th className="d-none d-md-table-cell">Price</th>
                    <th className="d-none d-sm-table-cell">Status</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <tr key={product._id}>
                        <td className="d-none d-md-table-cell">
                          <span className="badge bg-primary">#{product.productId}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <ImageWithFallback
                              src={product.images && product.images.length > 0 ? product.images[0] : null}
                              alt={product.name}
                              type="product"
                              className="rounded me-3"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              placeholderText="No image"
                            />
                            <div>
                              <div className="fw-medium">{product.name}</div>
                              {product.description && (
                                <small style={{ color: 'var(--text-muted)' }}>{product.description.substring(0, 50)}...</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span className="fw-medium">{product.stock?.quantity || 0}</span>
                            <small style={{ color: 'var(--text-muted)' }} className="ms-1">{product.stock?.unit || 'pcs'}</small>
                          </div>
                          <span className={`badge ${stockStatus.class} badge-sm`}>
                            {stockStatus.text}
                          </span>
                        </td>
                        <td className="d-none d-md-table-cell">
                          <div className="fw-medium">₨{(product.price?.selling || 0).toFixed(2)}</div>
                          <small style={{ color: 'var(--text-muted)' }}>Cost: ₨{(product.price?.cost || 0).toFixed(2)}</small>
                        </td>
                        <td className="d-none d-sm-table-cell">
                          <span className={`badge ${
                            product.status === 'active' ? 'bg-success' :
                            product.status === 'inactive' ? 'bg-secondary' :
                            product.status === 'discontinued' ? 'bg-danger' :
                            'bg-secondary'
                          }`}>
                            {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm d-flex flex-column flex-sm-row">
                            <Link
                              to={`/inventory/${product._id}`}
                              className="btn btn-outline-primary btn-sm"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                              <span className="d-none d-sm-inline ms-1">View</span>
                            </Link>
                            {hasPermission('canEditProducts') && (
                              <Link
                                to={`/inventory/${product._id}/edit`}
                                className="btn btn-outline-secondary btn-sm"
                                title="Edit Product"
                              >
                                <i className="fas fa-edit"></i>
                                <span className="d-none d-sm-inline ms-1">Edit</span>
                              </Link>
                            )}
                            {hasPermission('canDeleteProducts') && (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(product._id)}
                                title="Delete Product"
                              >
                                <i className="fas fa-trash"></i>
                                <span className="d-none d-sm-inline ms-1">Delete</span>
                              </button>
                            )}
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
        {!loading && products.length > 0 && (
          <div className="card-footer">
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;