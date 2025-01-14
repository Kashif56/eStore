import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, fetchSubcategories, fetchVariants, addProduct, uploadProductImage } from '../../services/productService';
import { MdCloudUpload, MdDelete, MdAdd } from 'react-icons/md';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    discount_price: '',
    category: '',
    subcategory: '',
    stock: '',
    attributes: [{ name: '', value: '' }],
    variants: []
  });

  const fetchCategoriesData = async () => {
    try {
      setLoading(true);
      const response = await fetchCategories();
      if (Array.isArray(response)) {
        setCategories(response);
        setError(null);
      } else {
        setError('No categories available');
        setCategories([]);
      }
    } catch (err) {
      setError('Error fetching categories: ' + err.message);
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategoriesData = async (categoryId) => {
    try {
      setLoading(true);
      const response = await fetchSubcategories(categoryId);
      if (response?.status === 'success' && Array.isArray(response.subcategories)) {
        setSubcategories(response.subcategories);
        setError(null);
      } else {
        setError('No subcategories available');
        setSubcategories([]);
      }
    } catch (err) {
      setError('Error fetching subcategories: ' + err.message);
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariantsData = async (categoryId) => {
    try {
      setLoading(true);
      const response = await fetchVariants(categoryId);
      if (Array.isArray(response?.variants)) {
        setAvailableVariants(response.variants);
      } else {
        setAvailableVariants([]);
      }
    } catch (err) {
      console.error('Error fetching variants:', err);
      setAvailableVariants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategoriesData(formData.category);
      fetchVariantsData(formData.category);
    } else {
      setSubcategories([]);
      setAvailableVariants([]);
    }
  }, [formData.category]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages([...selectedImages, ...files]);

    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  // Handle attribute changes
  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData({ ...formData, attributes: newAttributes });
  };

  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { name: '', value: '' }]
    });
  };

  const removeAttribute = (index) => {
    const newAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData({ ...formData, attributes: newAttributes });
  };

  // Handle variant changes
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value
    };
    setFormData({
      ...formData,
      variants: newVariants
    });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { name: '', options: [''], price: '', stock: '' }
      ]
    });
  };

  const handleVariantOptionChange = (variantIndex, optionIndex, value) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      variants: newVariants
    });
  };

  const addVariantOption = (variantIndex) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].options.push('');
    setFormData({
      ...formData,
      variants: newVariants
    });
  };

  const removeVariantOption = (variantIndex, optionIndex) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex);
    setFormData({
      ...formData,
      variants: newVariants
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Form Data:', formData);
      const productFormData = new FormData();

      // Add basic fields
      const fields = {
        name: formData.name,
        description: formData.description,
        base_price: formData.base_price,
        stock: formData.stock,
        category: formData.category,
        subcategory: formData.subcategory
      };

      // Validate required fields
      const missingFields = Object.entries(fields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Add all fields to FormData
      Object.entries(fields).forEach(([key, value]) => {
        productFormData.append(key, value);
      });

      // Add optional fields
      if (formData.discount_price) {
        productFormData.append('discount_price', formData.discount_price);
      }

      // Add attributes if they have both name and value
      const validAttributes = formData.attributes.filter(attr => attr.name && attr.value);
      if (validAttributes.length > 0) {
        productFormData.append('attributes', JSON.stringify(validAttributes));
      }

      // Add variants if they have name and at least one option
      const validVariants = formData.variants.filter(
        variant => variant.name && variant.options.some(option => option)
      );
      if (validVariants.length > 0) {
        productFormData.append('variants', JSON.stringify(validVariants));
      }

      // Add images
      selectedImages.forEach(image => {
        productFormData.append('images', image);
      });

      // Log the FormData contents
      console.log('FormData contents:');
      for (let pair of productFormData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await addProduct(productFormData);

      console.log('API Response:', response);
      navigate('/seller/products');
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      // Show error message to user
      alert(err.response?.data?.message || err.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setFormData({
      ...formData,
      category: categoryId,
      subcategory: '',  // Reset subcategory
      variants: []      // Reset variants
    });

    if (categoryId) {
      await fetchSubcategoriesData(categoryId);
      await fetchVariantsData(categoryId);
    } else {
      setSubcategories([]);
      setAvailableVariants([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 ml-64">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Add New Product</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="space-y-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {error && error.includes('categories') && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              {formData.category && (
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subcategory
                  </label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                  {error && error.includes('subcategories') && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Base Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discount Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_price}
                  onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Description *</h2>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Product Attributes */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Product Attributes</h2>
              <button
                type="button"
                onClick={addAttribute}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <MdAdd size={20} />
                <span>Add Attribute</span>
              </button>
            </div>
            
            {formData.attributes.map((attribute, index) => (
              <div key={index} className="flex space-x-4 mb-4">
                <input
                  type="text"
                  placeholder="Attribute Name"
                  value={attribute.name}
                  onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Attribute Value"
                  value={attribute.value}
                  onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeAttribute(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Product Variants */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Product Variants</h2>
            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-4">
                    <select
                      value={variant.name}
                      onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Variant Type</option>
                      {availableVariants.map(v => (
                        <option key={v.id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const newVariants = formData.variants.filter((_, i) => i !== index);
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                  <div className="pl-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Options
                    </label>
                    {variant.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-4">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleVariantOptionChange(index, optionIndex, e.target.value)}
                          placeholder="Option Value"
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantOption(index, optionIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addVariantOption(index)}
                      className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                    >
                      <MdAdd size={20} />
                      Add Option
                    </button>
                  </div>
                  <div className="pl-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="pl-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariant}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
              >
                <MdCloudUpload size={20} />
                Add Variant
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Product Images *</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
              {previewImages.length < 4 && (
                <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200">
                  <MdCloudUpload size={24} className="text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    multiple
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
