import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const NewHandOver = () => {
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productId: '',
    employeeId: '',
    quantity: 1,
    purpose: '',
    notes: '',
    expectedReturnDate: ''
  });

  useEffect(() => {
    if (!hasPermission('canManageProducts')) {
      toast.error('You do not have permission to hand over items');
      navigate('/inventory/handover');
      return;
    }
    fetchData();
  }, [hasPermission, navigate]);

  const fetchData = async () => {
    try {
      const [productsRes, employeesRes] = await Promise.all([
        api.get('/products/all'),
        api.get('/users/for-handover')
      ]);
      
      setProducts(productsRes.data.products || []);
      setEmployees(employeesRes.data.users || []);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.employeeId || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedProduct = products.find(p => p._id === formData.productId);
    if (selectedProduct && formData.quantity > (selectedProduct.stock?.quantity || 0)) {
      toast.error('Insufficient stock available');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/handovers', {
        ...formData,
        quantity: parseInt(formData.quantity),
        handedOverBy: user._id
      });
      
      toast.success('Item handed over successfully');
      navigate('/inventory/handover');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to hand over item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/inventory/handover');
  };

  if (loading) {
    return <LoadingSpinner text="Loading handover data..." />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">New Hand Over</h1>
          <p className="text-muted mb-0">Hand over items to employees</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Handovers
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 col-md-10 mx-auto">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-hand-holding me-2"></i>
                Hand Over Details
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Product *</label>
                    <select
                      className="form-control"
                      value={formData.productId}
                      onChange={(e) => setFormData({...formData, productId: e.target.value})}
                      required
                    >
                      <option value="">Select Product</option>
                      {products.filter(product => (product.stock?.quantity || 0) > 0).map(product => (
                        <option key={product._id} value={product._id}>
                          #{product.productId} - {product.name} (Available: {product.stock?.quantity || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Employee *</label>
                    <select
                      className="form-control"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map(employee => (
                        <option key={employee._id} value={employee._id}>
                          {employee.firstName} {employee.lastName} - {employee.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-3 mt-2">
                  <div className="col-md-6">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Expected Return Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.expectedReturnDate}
                      onChange={(e) => setFormData({...formData, expectedReturnDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label">Purpose</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    placeholder="e.g., Field work, Maintenance, etc."
                  />
                </div>

                <div className="mt-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional notes or instructions..."
                  ></textarea>
                </div>

                <div className="mt-4 d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-hand-holding me-2"></i>
                        Hand Over Item
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHandOver;
