import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/dashboardService';
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
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    discount_price: '',
    category: '',
    subcategory: '',
    stock: '',
    attributes: [{ name: '', value: '' }],
    variants: [{ name: '', options: [''], price: '', stock: '' }]
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
    } else {
      setSubcategories([]);
    }
  }, [formData.category]);

  useEffect(() => {
    const fetchVariants = async () => {
      if (!formData.category) {
        setAvailableVariants([]);
        return;
      }

      try {
        const response = await api.get(`/variants/?category=${formData.category}`);
        if (response.data.status === 'success') {
          setAvailableVariants(response.data.variants);
        } else {
          console.error('Failed to fetch variants:', response.data);
          setAvailableVariants([]);
        }
      } catch (error) {
        console.error('Error fetching variants:', error.response?.data || error.message);
        setAvailableVariants([]);
      }
    };

    fetchVariants();
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await api.get(`/categories/${categoryId}/subcategories/`);
      setSubcategories(response.data);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

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

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
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

      const response = await api.post('/products/add/', productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API Response:', response.data);
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
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategory *
                </label>
                <select
                  required
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
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
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Product Variants</h3>
            {formData.category && (
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <MdAdd size={20} />
                <span>Add Variant</span>
              </button>
            )}
          </div>

          {!formData.category ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4">
              Please select a category to view available variants
            </div>
          ) : (
            <div className="space-y-4">
              {/* Permanent Variant Form */}
              <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-2 border-blue-200 dark:border-blue-800">
                <select
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select Variant Type</option>
                  {availableVariants.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Option Value (e.g., Small, Red)"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />

                <input
                  type="number"
                  placeholder="Price ±"
                  className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />

                <input
                  type="number"
                  placeholder="Stock"
                  className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Added Variants List */}
              {formData.variants.map((variant, variantIndex) => (
                <div key={variantIndex} className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <select
                    value={variant.name}
                    onChange={(e) => handleVariantChange(variantIndex, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Variant Type</option>
                    {availableVariants.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Option Value (e.g., Small, Red)"
                    value={variant.options[0] || ''}
                    onChange={(e) => handleVariantChange(variantIndex, 'options', [e.target.value])}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />

                  <input
                    type="number"
                    placeholder="Price ±"
                    value={variant.price || ''}
                    onChange={(e) => handleVariantChange(variantIndex, 'price', e.target.value)}
                    className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />

                  <input
                    type="number"
                    placeholder="Stock"
                    value={variant.stock || ''}
                    onChange={(e) => handleVariantChange(variantIndex, 'stock', e.target.value)}
                    className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={() => removeVariant(variantIndex)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
  );
};

export default AddProduct;
