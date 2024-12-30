import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import ReviewSection from '../components/ReviewSection';
import Toast from '../components/Toast';
import { useSelector, useDispatch } from 'react-redux';

import { useNavigate } from 'react-router-dom';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const {token} = useSelector((state) => state.auth);
  const navigate = useNavigate();

  

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/products/product-detail/${productId}/`);
        
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          const errorData = await response.json();
          setToast({
            type: 'error',
            message: errorData.message || 'Failed to load product details'
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setToast({
          type: 'error',
          message: 'Error loading product details'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  const handleVariantSelection = (variantName, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: variant,
    }));
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!token) {
      setToast({
        type: 'error',
        message: 'Please login to add items to cart'
      });
      navigate('/login');
      return;
    }

    // Get unique variant types from product variants
    const variantTypes = [...new Set(product.variants.map(v => v.variant.name))];
    
    // Check if all required variant types are selected
    const missingVariants = variantTypes.filter(type => !selectedVariants[type]);
    
    if (missingVariants.length > 0) {
      setToast({
        type: 'error',
        message: `Please select ${missingVariants.join(', ')} before adding to cart`
      });
      return;
    }

    // Collect all selected variant IDs
    const selectedVariantIds = Object.values(selectedVariants).map(variant => variant.id);

    try {
      const response = await fetch(`http://localhost:8000/api/orders/cart/add/${productId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qty: parseInt(quantity),
          variant_ids: selectedVariantIds
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setToast({
          type: 'success',
          message: data.message || 'Product added to cart successfully!'
        });

        // Navigate to cart after a short delay
        setTimeout(() => {
          navigate('/cart');
        }, 1500);

      } else {
        if (response.status === 401) {
          setToast({
            type: 'error',
            message: 'Please login to add items to cart'
          });
          navigate('/login');
        } else {
          setToast({
            type: 'error',
            message: data.message || 'Failed to add product to cart'
          });
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToast({
        type: 'error',
        message: 'Error while adding to cart'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Product Image */}
          <div>
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
              {product.images?.[activeImage] ? (
                <img
                  src={`http://127.0.0.1:8000${product.images[activeImage].image}`}
                  alt={product.name}
                  className="w-full h-full object-center object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400';
                  }}
                />
              ) : (
                <div className="w-full h-full flex justify-center items-center text-gray-500">
                  No Image Available
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                    activeImage === index ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <img
                    src={`http://127.0.0.1:8000${img.image}`}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-center object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-3 text-3xl text-gray-900">Rs. {product.base_price}</p>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <p className="mt-4 prose prose-sm text-gray-500">{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Options</h3>
                {Object.entries(
                  product.variants.reduce((acc, variant) => {
                    if (!acc[variant.variant.name]) {
                      acc[variant.variant.name] = [];
                    }
                    acc[variant.variant.name].push(variant);
                    return acc;
                  }, {})
                ).map(([variantName, variants]) => (
                  <div key={variantName} className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700">{variantName}</h4>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantSelection(variantName, variant)}
                          className={`px-4 py-2 border rounded-md ${
                            selectedVariants[variantName]?.id === variant.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {variant.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
              <div className="mt-2 flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 border rounded-md hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faMinus} className="h-4 w-4" />
                </button>
                <span className="text-gray-900 text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 border rounded-md hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart and Wishlist */}
            <div className="mt-8 flex space-x-4">
              <button
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                onClick={handleAddToCart}
              >
                <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5" />
                <span>Add {quantity} to Cart</span>
              </button>
              <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200">
                <FontAwesomeIcon icon={faHeart} className="h-6 w-6 text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection reviews={product.reviews || []} productId={productId} />
      </div>
    </>
  );
};

export default ProductDetail;
