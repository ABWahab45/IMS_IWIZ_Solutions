import ApiService from './api';

export const inventoryService = {
  getAllProducts: () => ApiService.get('/products'),
  getProduct: (id) => ApiService.get(`/products/${id}`),
  createProduct: (data) => ApiService.post('/products', data),
  updateProduct: (id, data) => ApiService.put(`/products/${id}`, data),
  deleteProduct: (id) => ApiService.delete(`/products/${id}`),
  // Remove this line (line 9):
  // getLowStockProducts: () => ApiService.get('/products/low-stock'),
  updateStock: (id, quantity) => ApiService.put(`/products/${id}/stock`, { quantity }),
};