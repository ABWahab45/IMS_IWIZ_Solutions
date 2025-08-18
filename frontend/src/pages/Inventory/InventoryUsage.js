import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/axiosConfig';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const InventoryUsage = () => {
  const [products, setProducts] = useState([]);
  const [usageItems, setUsageItems] = useState([{ product: '', quantity: 1, reason: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasPermission('canManageProducts')) {
      toast.error('You do not have permission to record inventory usage');
      return;
    }
    fetchProducts();
  }, [hasPermission]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/all');
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...usageItems];
    newItems[index][field] = value;
    setUsageItems(newItems);
  };

  const addItem = () => {
    setUsageItems([...usageItems, { product: '', quantity: 1, reason: '' }]);
  };

  const removeItem = (index) => {
    if (usageItems.length > 1) {
      setUsageItems(usageItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const validItems = usageItems.filter(item => item.product && item.quantity > 0);
      
      if (validItems.length === 0) {
        toast.error('Please add at least one item');
        setIsSubmitting(false);
        return;
      }
      
      for (const item of validItems) {
        const product = products.find(p => p._id === item.product);
        if (product) {
          const newQuantity = Math.max(0, product.stock.quantity - item.quantity);
                  await api.put(`/products/${item.product}/stock`, {
          operation: 'subtract',
          quantity: item.quantity
        });
        }
      }
      
      toast.success('Inventory usage recorded successfully!');
      setUsageItems([{ product: '', quantity: 1, reason: '' }]);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record inventory usage');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading products..." />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Record Inventory Usage</h1>
          <p className="text-muted mb-0">Record items used from inventory</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/inventory')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Inventory
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Items Used</h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={addItem}
              >
                <i className="fas fa-plus me-1"></i>
                Add Item
              </button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {usageItems.map((item, index) => {
                  const selectedProduct = products.find(p => p._id === item.product);
                  return (
                    <div key={index} className="row align-items-end mb-3 pb-3 border-bottom">
                      <div className="col-md-4">
                        <label className="form-label">Product *</label>
                        <select
                          className="form-control"
                          value={item.product}
                          onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            // In product selection (around line 120)
                            <option key={product._id} value={product._id}>
                              #{product.productId} - {product.name} (Stock: {product.stock.quantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Quantity Used *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                          max={selectedProduct ? selectedProduct.stock?.quantity || 999999 : 999999}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Reason/Purpose</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.reason}
                          onChange={(e) => handleItemChange(index, 'reason', e.target.value)}
                          placeholder="e.g., Production, Maintenance, etc."
                        />
                      </div>
                                              <div className="col-md-1">
                        <label className="form-label">Available</label>
                        <div className="form-control-plaintext fw-bold text-success">
                          {selectedProduct ? selectedProduct.stock?.quantity || 0 : 0}
                        </div>
                      </div>
                      <div className="col-md-1">
                        {usageItems.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeItem(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary me-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Recording...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-minus me-2"></i>
                        Record Usage
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setUsageItems([{ product: '', quantity: 1, reason: '' }])}
                    disabled={isSubmitting}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Usage Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Items to record:</span>
                <span>{usageItems.length}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total quantity:</span>
                <span>{usageItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}</span>
              </div>
              <hr />
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <small>
                  Recording usage will immediately reduce the inventory quantities for the selected items.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryUsage;