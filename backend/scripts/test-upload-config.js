const { uploadConfigs } = require('../middleware/upload');

console.log('Testing upload configuration...');
console.log('Avatar config:', uploadConfigs.avatar);
console.log('Product images config:', uploadConfigs.productImages);

// Check if the field names are correct
const avatarField = uploadConfigs.avatar.fields ? 'multiple' : 'single';
const productField = uploadConfigs.productImages.fields ? 'multiple' : 'array';

console.log('\nField configuration:');
console.log('Avatar:', avatarField, 'field');
console.log('Product Images:', productField, 'field');

console.log('\n✅ Upload configuration looks correct!');
console.log('Avatar expects: avatar (single file)');
console.log('Product Images expects: productImages (array of files)');
