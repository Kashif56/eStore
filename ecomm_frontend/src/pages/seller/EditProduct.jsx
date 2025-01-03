import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/dashboardService';
import { MdCloudUpload, MdDelete } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    discount_price: '',
    category: '',
    subcategory: '',
    stock: '',
    variants: [],
    attributes: []
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
      fetchVariants(formData.category);
    }
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await api.get(`/categories/${categoryId}/subcategories/`);
      if (response.data.status === 'success') {
        setSubcategories(response.data.subcategories);
      } else {
        toast.error(response.data.message || 'Failed to load subcategories');
        setSubcategories([]);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      toast.error(err.response?.data?.message || 'Failed to load subcategories');
      setSubcategories([]);
    }
  };

  const fetchVariants = async (categoryId) => {
    try {
      const response = await api.get(`/variants/?category=${categoryId}`);
      if (response.data.status === 'success') {
        setAvailableVariants(response.data.variants || []);
      }
    } catch (err) {
      console.error('Error fetching variants:', err);
      toast.error('Failed to load variants');
      setAvailableVariants([]);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/product/${productId}/edit/`);
      if (response.data.status === 'success') {
        const product = response.data.product;
       
        // Set form data
        setFormData({
          name: product.name,
          description: product.description,
          base_price: product.base_price,
          discount_price: product.discount_price || '',
          category: product.category,
          subcategory: product.subcategory || '',
          stock: product.stock,
          variants: product.variants || [],
          attributes: product.attributes || []
        });

        // Set existing images
        if (product.images && product.images.length > 0) {
          console.log('Setting images:', product.images); // Add this for debugging
          setExistingImages(product.images);
        }

        // If category is set, fetch subcategories
        if (product.category) {
          fetchSubcategories(product.category);
        }

        // If category is set, fetch variants
        if (product.category) {
          fetchVariants(product.category);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error.response?.data || error.message);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages([...selectedImages, ...files]);

    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);
  };

  const removeNewImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId) => {
    try {
      const response = await api.delete(`/products/${productId}/images/${imageId}/`);
      if (response.data.status === 'success') {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
        toast.success(response.data.message || 'Image removed successfully');
      } else {
        toast.error(response.data.message || 'Failed to remove image');
      }
    } catch (err) {
      console.error('Error deleting image:', err.response?.data || err);
      toast.error(err.response?.data?.message || 'Failed to remove image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const productFormData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'variants' && key !== 'attributes') {
          productFormData.append(key, formData[key]);
        }
      });

      // Append variants as JSON string
      productFormData.append('variants', JSON.stringify(formData.variants));

      // Append attributes as JSON string
      productFormData.append('attributes', JSON.stringify(formData.attributes));

      // Append new images
      selectedImages.forEach(image => {
        productFormData.append('images', image);
      });

      const response = await api.put(`/products/${productId}/update/`, productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        toast.success('Product updated successfully');
        navigate('/seller/products');
      } else {
        toast.error(response.data.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-200 dark:bg-gray-700 h-12 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Edit Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name
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
                Category
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subcategory
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Base Price
              </label>
              <input
                type="number"
                required
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Price (Optional)
              </label>
              <input
                type="number"
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock
              </label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Description</h2>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Attributes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Product Attributes</h2>
          <div className="space-y-4">
            {formData.attributes.map((attr, index) => (
              <div key={index} className="flex gap-4">
                <input
                  type="text"
                  value={attr.name}
                  onChange={(e) => {
                    const newAttributes = [...formData.attributes];
                    newAttributes[index].name = e.target.value;
                    setFormData({ ...formData, attributes: newAttributes });
                  }}
                  placeholder="Attribute Name"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => {
                    const newAttributes = [...formData.attributes];
                    newAttributes[index].value = e.target.value;
                    setFormData({ ...formData, attributes: newAttributes });
                  }}
                  placeholder="Attribute Value"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newAttributes = formData.attributes.filter((_, i) => i !== index);
                    setFormData({ ...formData, attributes: newAttributes });
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  attributes: [...formData.attributes, { name: '', value: '' }]
                });
              }}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              Add Attribute
            </button>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Product Variants</h2>
          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-4">
                  <select
                    value={variant.name}
                    onChange={(e) => {
                      const newVariants = [...formData.variants];
                      newVariants[index].name = e.target.value;
                      setFormData({ ...formData, variants: newVariants });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="">Select Variant Type</option>
                    {Array.isArray(availableVariants) && availableVariants.map(v => (
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
                  {variant.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-4">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].options[optionIndex] = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        placeholder="Option Value"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newVariants = [...formData.variants];
                          newVariants[index].options = variant.options.filter((_, i) => i !== optionIndex);
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newVariants = [...formData.variants];
                      newVariants[index].options.push('');
                      setFormData({ ...formData, variants: newVariants });
                    }}
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    Add Option
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  variants: [...formData.variants, { name: '', options: [''] }]
                });
              }}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              Add Variant
            </button>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Product Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Existing Images */}
            {existingImages.map((image, index) => (
              <div key={image.id} className="relative">
                <img
                  src={`http://localhost:8000${image.url}`}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(image.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                >
                  <MdDelete size={16} />
                </button>
              </div>
            ))}

            {/* New Images */}
            {previewImages.map((preview, index) => (
              <div key={`new-${index}`} className="relative">
                <img
                  src={preview}
                  alt={`New Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                >
                  <MdDelete size={16} />
                </button>
              </div>
            ))}

            {/* Upload Button */}
            {existingImages.length + previewImages.length < 4 && (
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
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
