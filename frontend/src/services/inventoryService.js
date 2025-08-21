import api from './api';

export const inventoryService = {
  getAllProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  // Remove this line (line 9):
  // getLowStockProducts: () => api.get('/products/low-stock'),
  updateStock: (id, quantity) => api.put(`/products/${id}/stock`, { quantity }),
};