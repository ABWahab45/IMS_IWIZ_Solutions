import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/axiosConfig';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const InventoryRestock = () => {
  const [products, setProducts] = useState([]);
  const [restockItems, setRestockItems] = useState([{ product: '', quantity: 1, cost: 0, notes: '' }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const productsRes = await api.get('/products/all');
      setProducts(productsRes.data.products || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasPermission('canManageProducts')) {
      toast.error('You do not have permission to restock inventory');
      return;
    }
    fetchData();
  }, [hasPermission, fetchData]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...restockItems];
    newItems[index][field] = value;

    if (field === 'product' && value) {
      const product = products.find(p => p._id === value);
      if (product && product.price?.cost) {
        newItems[index].cost = product.price.cost;
      }
    }

    setRestockItems(newItems);
  };

  const addItem = () => {
    setRestockItems([...restockItems, { product: '', quantity: 1, cost: 0, notes: '' }]);
  };

  const removeItem = (index) => {
    if (restockItems.length > 1) {
      setRestockItems(restockItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return restockItems.reduce((total, item) => {
      return total + (item.quantity * item.cost);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validItems = restockItems.filter(item => item.product && item.quantity > 0);

      if (validItems.length === 0) {
        toast.error('Please add at least one item');
        setIsSubmitting(false);
        return;
      }

      for (const item of validItems) {
        const product = products.find(p => p._id === item.product);
        if (product) {
                  await api.put(`/products/${item.product}/stock`, {
          operation: 'add',
          quantity: item.quantity
        });
        }
      }

      toast.success('Inventory restocked successfully!');
      setRestockItems([{ product: '', quantity: 1, cost: 0, notes: '' }]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restock inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading data..." />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Restock Inventory</h1>
          <p className="text-muted mb-0">Add new stock to inventory items</p>
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
              <h5 className="card-title mb-0">Items to Restock</h5>
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
                {restockItems.map((item, index) => {
                  const selectedProduct = products.find(p => p._id === item.product);
                  return (
                    <div key={index} className="row align-items-end mb-3 pb-3 border-bottom">
                      <div className="col-md-3">
                        <label className="form-label">Product *</label>
                        <select
                          className="form-control"
                          value={item.product}
                          onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            // In product selection (around line 140)
                            <option key={product._id} value={product._id}>
                              #{product.productId} - {product.name} (Current: {product.stock?.quantity || 0})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Quantity *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">Unit Cost</label>
                        <input
                          type="number"
                          className="form-control"
                          value={item.cost}
                          onChange={(e) => handleItemChange(index, 'cost', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Total</label>
                        <div className="form-control-plaintext fw-bold">
                          ₨{(item.quantity * item.cost).toFixed(2)}
                        </div>
                      </div>
                      <div className="col-md-1">
                        {restockItems.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeItem(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                      {selectedProduct && (
                        <div className="col-12 mt-2">
                          <small className="text-muted">
                            Current Stock: {selectedProduct.stock?.quantity || 0} |
                            After Restock: {(selectedProduct.stock?.quantity || 0) + item.quantity}
                          </small>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="row mt-4">
                  <div className="col-md-6">
                    <label className="form-label">General Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Additional notes about this restock..."
                      value={restockItems[0]?.notes || ''}
                      onChange={(e) => {
                        const newItems = [...restockItems];
                        newItems[0].notes = e.target.value;
                        setRestockItems(newItems);
                      }}
                    />
                  </div>
                  <div className="col-md-6 d-flex align-items-end">
                    <div className="d-grid gap-2 w-100">
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus me-2"></i>
                            Add to Inventory
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setRestockItems([{ product: '', quantity: 1, cost: 0, notes: '' }])}
                        disabled={isSubmitting}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Restock Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Items:</span>
                <span>{restockItems.length}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Quantity:</span>
                <span>{restockItems.reduce((sum, item) => sum + (item.quantity || 0), 0)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Total Cost:</span>
                <span className="fw-bold text-success">₨{calculateTotal().toFixed(2)}</span>
              </div>
              <hr />
              <div className="alert alert-success">
                <i className="fas fa-info-circle me-2"></i>
                <small>
                  Adding inventory will immediately increase the stock quantities for the selected items.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryRestock;