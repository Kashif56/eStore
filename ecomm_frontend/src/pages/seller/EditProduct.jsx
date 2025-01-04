import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProduct, updateProduct, deleteProductImage, fetchCategories, fetchSubcategories, fetchVariants } from '../../services/productService';
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
  const [availableVariants, setAvailableVariants] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    discount_price: '',
    category: '',
    subcategory: '',
    stock: '',
    variants: []
  });

  // Load categories and product data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Load categories
        const categoriesData = await fetchCategories();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }

        // Load product details
        const productData = await fetchProduct(productId);
        if (productData?.status === 'success' && productData.product) {
          const product = productData.product;
          
          // Set form data
          setFormData({
            name: product.name || '',
            description: product.description || '',
            base_price: product.base_price || '',
            discount_price: product.discount_price || '',
            category: product.category || '',
            subcategory: product.subcategory || '',
            stock: product.stock || '',
            variants: product.variants || []
          });

          // Set existing images
          setExistingImages(product.images || []);

          // If category is set, load subcategories and variants
          if (product.category) {
            const subcategoriesData = await fetchSubcategories(product.category);
            if (subcategoriesData?.status === 'success') {
              setSubcategories(subcategoriesData.subcategories || []);
            }

            const variantsData = await fetchVariants(product.category);
            if (variantsData?.status === 'success') {
              setAvailableVariants(variantsData.variants || []);
            }
          }
        } else {
          toast.error('Failed to load product details', {
            style: {
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              fontSize: '16px',
              padding: '12px 24px'
            }
          });
          navigate('/seller/products');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load product data', {
          style: {
            backgroundColor: '#f44336',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '16px',
            padding: '12px 24px'
          }
        });
        navigate('/seller/products');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [productId, navigate]);

  // Load subcategories and variants when category changes
  useEffect(() => {
    const loadCategoryData = async () => {
      if (formData.category) {
        try {
          const [subcategoriesData, variantsData] = await Promise.all([
            fetchSubcategories(formData.category),
            fetchVariants(formData.category)
          ]);

          if (subcategoriesData?.status === 'success') {
            setSubcategories(subcategoriesData.subcategories || []);
          }

          if (variantsData?.status === 'success') {
            setAvailableVariants(variantsData.variants || []);
          }
        } catch (error) {
          console.error('Error loading category data:', error);
          toast.error('Failed to load category data', {
            style: {
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              fontSize: '16px',
              padding: '12px 24px'
            }
          });
        }
      } else {
        setSubcategories([]);
        setAvailableVariants([]);
      }
    };

    loadCategoryData();
  }, [formData.category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeExistingImage = async (imageId) => {
    try {
      const response = await deleteProductImage(productId, imageId);
      if (response?.status === 'success') {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        toast.success('Image removed successfully', {
          style: {
            backgroundColor: '#4CAF50',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '16px',
            padding: '12px 24px'
          }
        });
      } else {
        toast.error('Failed to remove image', {
          style: {
            backgroundColor: '#f44336',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '16px',
            padding: '12px 24px'
          }
        });
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image', {
        style: {
          backgroundColor: '#f44336',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          fontSize: '16px',
          padding: '12px 24px'
        }
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const productFormData = new FormData();
      
      // Handle regular form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          if (key === 'variants' && formData[key].length > 0) {
            productFormData.append('variants', JSON.stringify(formData[key]));
          } else {
            productFormData.append(key, formData[key]);
          }
        }
      });

      // Handle images
      if (newImages.length > 0) {
        newImages.forEach(image => {
          productFormData.append('images', image);
        });
      }

      const response = await updateProduct(productId, productFormData);
      if (response?.status === 'success') {
        // Update existing images with the new list from response
        if (response.product?.images) {
          setExistingImages(prevImages => {
            // Filter out any images that were deleted
            const currentImageIds = response.product.images.map(img => img.id);
            const remainingImages = prevImages.filter(img => currentImageIds.includes(img.id));
            
            // Add any new images
            const newImageUrls = response.product.images.filter(img => 
              !remainingImages.some(existing => existing.id === img.id)
            );
            
            return [...remainingImages, ...newImageUrls];
          });
        }
        
        // Clear new images since they've been uploaded
        setNewImages([]);
        
        toast.success('🎉 Product updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            backgroundColor: '#4CAF50',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '16px',
            padding: '12px 24px'
          }
        });
        
        // Refresh the product data
        const refreshedData = await fetchProduct(productId);
        if (refreshedData?.status === 'success' && refreshedData.product) {
          setExistingImages(refreshedData.product.images || []);
        }

        setTimeout(() => {
          navigate('/seller/products');
        }, 1500);
      } else {
        toast.error(response?.message || 'Failed to update product', {
          style: {
            backgroundColor: '#f44336',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '16px',
            padding: '12px 24px'
          }
        });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product', {
        style: {
          backgroundColor: '#f44336',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          fontSize: '16px',
          padding: '12px 24px'
        }
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 ml-64">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-200 dark:bg-gray-700 h-12 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 ml-64">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
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
                  onChange={handleInputChange}
                  name="name"
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
                  onChange={handleInputChange}
                  name="category"
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
                  onChange={handleInputChange}
                  name="subcategory"
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
                  onChange={handleInputChange}
                  name="base_price"
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
                  onChange={handleInputChange}
                  name="discount_price"
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
                  onChange={handleInputChange}
                  name="stock"
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
              onChange={handleInputChange}
              name="description"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
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
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
              {newImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`New Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImagesList = [...newImages];
                      newImagesList.splice(index, 1);
                      setNewImages(newImagesList);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {existingImages.length + newImages.length < 4 && (
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
    </div>
  );
};

export default EditProduct;
