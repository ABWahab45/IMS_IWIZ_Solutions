import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getProductImageUrl } from '../../utils/imageUtils';
import { debugFormData } from '../../utils/debugFormData';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    minStockLevel: '0',
    unit: 'pcs',
    location: '',
    tags: '',
    status: 'active'
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      if (isEdit) {
        const response = await api.get(`/products/${id}`);
        const product = response.data;
        
        setFormData({
          name: product.name || '',
          description: product.description || '',
          costPrice: product.price?.cost?.toString() || '',
          sellingPrice: product.price?.selling?.toString() || '',
          stockQuantity: product.stock?.quantity?.toString() || '',
          minStockLevel: product.stock?.minStock?.toString() || '0',
          unit: product.stock?.unit || 'pcs',
          location: product.stock?.location || '',
          tags: product.tags ? product.tags.join(', ') : '',
          status: product.status || 'active'
        });
        setExistingImages(product.images || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load form data');
      navigate('/inventory');
    } finally {
      setLoading(false);
    }
  }, [id, isEdit, navigate]);

  useEffect(() => {
    // Check permissions based on whether this is create or edit mode
    if (isEdit) {
      if (!hasPermission('canEditProducts')) {
        toast.error('You do not have permission to edit products');
        navigate('/inventory');
        return;
      }
    } else {
      if (!hasPermission('canAddProducts')) {
        toast.error('You do not have permission to create products');
        navigate('/inventory');
        return;
      }
    }
    
    fetchData();
  }, [id, isEdit, hasPermission, navigate, fetchData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check permissions before submission
    if (isEdit) {
      if (!hasPermission('canEditProducts')) {
        toast.error('You do not have permission to edit products');
        return;
      }
    } else {
      if (!hasPermission('canAddProducts')) {
        toast.error('You do not have permission to create products');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          submitData.append(key, formData[key].split(',').map(tag => tag.trim()).join(','));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      images.forEach(image => {
        submitData.append('productImages', image);
      });
      
      debugFormData(submitData, 'product-upload');
      
      if (isEdit) {
        await api.put(`/products/${id}`, submitData, {
          headers: { 'Content-Type': undefined }
        });
        toast.success('Product updated successfully');
        navigate(`/inventory/${id}`);
      } else {
        const response = await api.post('/products', submitData, {
          headers: { 'Content-Type': undefined }
        });
        toast.success('Product created successfully');
        navigate('/inventory');
      }
    } catch (error) {
      console.error('Product creation error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                      error.response?.data?.errors?.[0]?.msg || 
                      `Failed to ${isEdit ? 'update' : 'create'} product`;
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text={`Loading ${isEdit ? 'product' : 'form'} data...`} />;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate(isEdit ? `/inventory/${id}` : '/inventory')}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back
        </button>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group mb-3">
                      <label htmlFor="name" className="form-label">Product Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter product name"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                  />
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="costPrice" className="form-label">Cost Price (PKR) *</label>
                      <input
                        type="number"
                        id="costPrice"
                        name="costPrice"
                        className="form-control"
                        value={formData.costPrice}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="sellingPrice" className="form-label">Selling Price *</label>
                      <input
                        type="number"
                        id="sellingPrice"
                        name="sellingPrice"
                        className="form-control"
                        value={formData.sellingPrice}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="unit" className="form-label">Unit *</label>
                      <select
                        id="unit"
                        name="unit"
                        className="form-control"
                        value={formData.unit}
                        onChange={handleChange}
                        required
                      >
                        <option value="pieces">Pieces</option>
                        <option value="kg">Kilograms</option>
                        <option value="liters">Liters</option>
                        <option value="meters">Meters</option>
                        <option value="boxes">Boxes</option>
                        <option value="packs">Packs</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="stockQuantity" className="form-label">Stock Quantity *</label>
                      <input
                        type="number"
                        id="stockQuantity"
                        name="stockQuantity"
                        className="form-control"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        required
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="minStockLevel" className="form-label">Min Stock Level</label>
                      <input
                        type="number"
                        id="minStockLevel"
                        name="minStockLevel"
                        className="form-control"
                        value={formData.minStockLevel}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="location" className="form-label">Location</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        className="form-control"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Storage location"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="tags" className="form-label">Tags</label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        className="form-control"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="Enter tags separated by commas"
                      />
                      <small className="form-text text-muted">Separate tags with commas</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select
                        id="status"
                        name="status"
                        className="form-control"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                  </div>
                </div>

                {isEdit && existingImages.length > 0 && (
                  <div className="form-group mb-3">
                    <label className="form-label">Current Images</label>
                    <div className="d-flex flex-wrap gap-2">
                      {existingImages.map((image, index) => (
                        <img
                          key={index}
                          src={getProductImageUrl(image)}
                          alt={`Product ${index + 1}`}
                          className="img-thumbnail"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group mb-4">
                  <label htmlFor="productImages" className="form-label">
                    {isEdit ? 'New Product Images' : 'Product Images'}
                  </label>
                  <input
                    type="file"
                    id="productImages"
                    name="productImages"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <small className="form-text text-muted">
                    {isEdit ? 'Select new images to add (existing images will be kept)' : 'You can select multiple images'}
                  </small>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(isEdit ? `/inventory/${id}` : '/inventory')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'} me-2`}></i>
                        {isEdit ? 'Update Product' : 'Create Product'}
                      </>
                    )}
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

export default ProductForm;