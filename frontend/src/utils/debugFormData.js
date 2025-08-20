// Debug utility for FormData construction
export const debugFormData = (formData, type = 'unknown') => {
  console.log(`=== DEBUG FORMDATA (${type}) ===`);
  
  if (!formData || !(formData instanceof FormData)) {
    console.log('❌ FormData is not valid');
    return;
  }
  
  console.log('✅ FormData is valid');
  console.log('FormData entries:');
  
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: File { name: "${value.name}", size: ${value.size}, type: "${value.type}" }`);
    } else {
      console.log(`  ${key}: "${value}"`);
    }
  }
  
  console.log('=== END DEBUG ===');
};

// Test function to create sample FormData
export const createTestFormData = (type = 'avatar') => {
  const formData = new FormData();
  
  if (type === 'avatar') {
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('phone', '1234567890');
    
    // Create a dummy file for testing
    const dummyFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('avatar', dummyFile);
  } else if (type === 'product') {
    formData.append('name', 'Test Product');
    formData.append('costPrice', '10.00');
    formData.append('sellingPrice', '15.00');
    formData.append('stockQuantity', '100');
    
    // Create dummy files for testing
    const dummyFile1 = new File(['dummy content 1'], 'test1.jpg', { type: 'image/jpeg' });
    const dummyFile2 = new File(['dummy content 2'], 'test2.jpg', { type: 'image/jpeg' });
    formData.append('productImages', dummyFile1);
    formData.append('productImages', dummyFile2);
  }
  
  return formData;
};
