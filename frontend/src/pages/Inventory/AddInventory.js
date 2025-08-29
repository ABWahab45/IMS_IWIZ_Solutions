import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getProductImageUrl } from '../../utils/imageUtils';


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
  const [imagePreview, setImagePreview] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

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
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file count
    const totalImages = existingImages.length + selectedFiles.length;
    if (totalImages > 20) {
      toast.error('Maximum 20 images allowed per product');
      return;
    }
    
    // Validate file types and sizes
    const validFiles = [];
    const previews = [];
    
    selectedFiles.forEach((file, index) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image`);
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
        return;
      }
      
      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[index] = e.target.result;
        setImagePreview([...previews]);
      };
      reader.readAsDataURL(file);
    });
    
    setImages(validFiles);
    
    // Reset primary image index if it's out of bounds
    if (primaryImageIndex >= validFiles.length) {
      setPrimaryImageIndex(0);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreview(newPreviews);
    
    // Adjust primary image index if needed
    if (index === primaryImageIndex) {
      setPrimaryImageIndex(0);
    } else if (index < primaryImageIndex) {
      setPrimaryImageIndex(primaryImageIndex - 1);
    }
  };

  const setAsPrimary = (index) => {
    if (index >= 0 && index < images.length) {
      setPrimaryImageIndex(index);
    }
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

    // Validate images
    if (!isEdit && images.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    // Validate primary image selection
    if (images.length > 0 && (primaryImageIndex < 0 || primaryImageIndex >= images.length)) {
      toast.error('Please select a valid primary image');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🚀 Starting product submission...');
      console.log('📊 Form data:', formData);
      console.log('🖼️ Images count:', images.length);
      console.log('⭐ Primary image index:', primaryImageIndex);
      
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          submitData.append(key, formData[key].split(',').map(tag => tag.trim()).join(','));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add images with primary image handling
      images.forEach((image, index) => {
        console.log(`📎 Adding image ${index + 1}:`, image.name, image.size);
        submitData.append('productImages', image);
      });
      
      // Add primary image index
      if (images.length > 0) {
        submitData.append('primaryImageIndex', primaryImageIndex.toString());
        console.log('⭐ Primary image index set to:', primaryImageIndex);
      }
      
      console.log('📤 Submitting data...');
      const startTime = Date.now();
      
      if (isEdit) {
        console.log('✏️ Updating product...');
        await api.put(`/products/${id}`, submitData, {
          headers: { 'Content-Type': undefined },
          timeout: 60000 // 60 seconds for updates
        });
        toast.success('Product updated successfully');
        navigate(`/inventory/${id}`);
      } else {
        console.log('➕ Creating new product...');
        const response = await api.post('/products', submitData, {
          headers: { 'Content-Type': undefined },
          timeout: 60000 // 60 seconds for creation
        });
        console.log('✅ Product created successfully:', response.data);
        toast.success('Product created successfully');
        navigate('/inventory');
      }
      
      const endTime = Date.now();
      console.log(`⏱️ Request completed in ${endTime - startTime}ms`);
      
    } catch (error) {
      console.error('❌ Product creation error:', error.response?.data);
      console.error('❌ Full error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} product`;
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again with fewer or smaller images.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors?.[0]?.msg) {
        errorMessage = error.response.data.errors[0].msg;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add CSS for image selection effects
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .image-preview-container {
        transition: all 0.2s ease-in-out;
        border-radius: 8px;
        overflow: hidden;
      }
      .image-preview-container:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .primary-image-border {
        border: 3px solid #0d6efd !important;
        box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
      }
      .set-primary-btn {
        transition: all 0.2s ease-in-out;
      }
      .set-primary-btn:hover {
        transform: scale(1.05);
        background-color: #0d6efd !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
                    <label className="form-label">
                      Current Images ({existingImages.length})
                      <small className="text-muted ms-2">Existing images will be kept</small>
                    </label>
                    <div className="row g-2">
                      {existingImages.map((image, index) => (
                        <div key={index} className="col-md-2 col-sm-3 col-4">
                          <div className="position-relative">
                            <img
                              src={getProductImageUrl(image)}
                              alt={`Product ${index + 1}`}
                              className={`img-thumbnail w-100 ${
                                image.isPrimary ? 'border-primary border-3' : ''
                              }`}
                              style={{ 
                                height: '100px', 
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                            />
                            {image.isPrimary && (
                              <span className="position-absolute top-0 start-0 badge bg-primary m-1">
                                <i className="fas fa-star me-1"></i>
                                Primary
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group mb-3">
                  <label htmlFor="productImages" className="form-label">
                    {isEdit ? 'Add New Product Images' : 'Product Images *'}
                  </label>
                  <input
                    type="file"
                    id="productImages"
                    name="productImages"
                    className="form-control"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isEdit && existingImages.length >= 20}
                  />
                  <small className="form-text text-muted">
                    {isEdit 
                      ? `Select new images to add (existing: ${existingImages.length}/20)`
                      : 'Select 1-20 images (minimum 1 required)'
                    }
                  </small>
                </div>

                {/* Image Previews */}
                {imagePreview.length > 0 && (
                  <div className="form-group mb-4">
                    <label className="form-label">
                      Selected Images ({imagePreview.length})
                      <small className="text-muted ms-2">Click on an image or "Set as Primary" to choose the main image</small>
                    </label>
                    {primaryImageIndex < imagePreview.length && (
                      <div className="alert alert-info py-2 mb-3">
                        <i className="fas fa-info-circle me-2"></i>
                        <strong>Primary Image:</strong> Image {primaryImageIndex + 1} is set as the main product image
                      </div>
                    )}
                    <div className="row g-2">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="col-md-3 col-sm-4 col-6">
                          <div className="position-relative image-preview-container">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className={`img-thumbnail w-100 ${
                                index === primaryImageIndex ? 'primary-image-border' : ''
                              }`}
                              style={{ 
                                height: '120px', 
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                              onClick={() => setAsPrimary(index)}
                            />
                            
                            {/* Remove button */}
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                              onClick={() => removeImage(index)}
                              style={{ width: '24px', height: '24px', padding: '0', fontSize: '12px' }}
                              title="Remove image"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                            
                            {/* Primary indicator */}
                            {index === primaryImageIndex && (
                              <span className="position-absolute top-0 start-0 badge bg-primary m-1">
                                <i className="fas fa-star me-1"></i>
                                Primary
                              </span>
                            )}
                            
                            {/* Set as primary button */}
                            {index !== primaryImageIndex && (
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm position-absolute bottom-0 start-0 m-1 set-primary-btn"
                                onClick={() => setAsPrimary(index)}
                                style={{ fontSize: '10px', padding: '2px 6px' }}
                                title="Set as primary image"
                              >
                                <i className="fas fa-star me-1"></i>
                                Set Primary
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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