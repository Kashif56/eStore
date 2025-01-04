import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import ReviewSection from '../components/ReviewSection';
import Toast from '../components/Toast';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';

import { useNavigate } from 'react-router-dom';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hasOrdered, setHasOrdered] = useState(false);

  const [reviews, setReviews] = useState([]);

  const {token} = useSelector((state) => state.auth);

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get(`/api/products/get-all-reviews/${productId}/`);
      if (response.data) {
        setReviews(response.data);
      } else {
        setToast({
          type: 'error',
          message: 'Failed to load Reviews'
        });
      }
    } catch (error) {
      console.error('Error fetching Reviews:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Error loading Reviews'
      });
    }
  };

  // Check if user has ordered this product
  useEffect(() => {
    fetchReviews();
    const checkOrderHistory = async () => {
      if (!token) {
        setHasOrdered(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/api/products/product-detail/${productId}/check-ordered/`);
        setHasOrdered(response.data.hasOrdered);
      } catch (error) {
        console.error('Error checking order history:', error);
        setHasOrdered(false);
      }
    };

    checkOrderHistory();
  }, [productId, token]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userRating) {
      setToast({
        type: 'error',
        message: 'Please select a rating'
      });
      return;
    }
    if (!reviewComment.trim()) {
      setToast({
        type: 'error',
        message: 'Please write a review comment'
      });
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/products/add-review/${productId}/`, {
        rating: userRating,
        comment: reviewComment
      });

      const data = await response.data;

      if (response.status === 200) {
        setToast({
          type: 'success',
          message: 'Review submitted successfully!'
        });
        // Reset form
        setUserRating(0);
        setReviewComment('');
        // Refresh product data to show new review
        
        fetchReviews();
      } else {
        setToast({
          type: 'error',
          message: data.message || 'Failed to submit review'
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setToast({
        type: 'error',
        message: 'Failed to submit review. Please try again.'
      });
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/api/products/product-detail/${productId}/`);
        
        if (response.data) {
          setProduct(response.data);
        } else {
          setToast({
            type: 'error',
            message: 'Failed to load product details'
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setToast({
          type: 'error',
          message: error.response?.data?.error || 'Error loading product details'
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
      const response = await axiosInstance.post(`/api/orders/add-to-cart/${productId}/`, {
        qty: parseInt(quantity),
        variant_ids: selectedVariantIds
      });

      if (response.data.status === 'success') {
        setToast({
          type: 'success',
          message: response.data.message || 'Product added to cart successfully!'
        });

        // Navigate to cart after a short delay
        setTimeout(() => {
          navigate('/cart');
        }, 1500);

      } else {
        if (response.data.status === 'error' && response.data.code === 401) {
          setToast({
            type: 'error',
            message: 'Please login to add items to cart'
          });
          navigate('/login');
        } else {
          setToast({
            type: 'error',
            message: response.data.message || 'Failed to add product to cart'
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

        {/* Product Attributes Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Product Attributes</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Detailed specifications and features</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                {product.attributes && product.attributes.map((attr, index) => (
                  <div key={attr.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                    <dt className="text-sm font-medium text-gray-500 capitalize">
                      {attr.attribute.replace(/_/g, ' ')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {attr.value}
                    </dd>
                  </div>
                ))}
                {(!product.attributes || product.attributes.length === 0) && (
                  <div className="px-4 py-5">
                    <p className="text-sm text-gray-500">No attributes available for this product.</p>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Product Reviews</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Customer feedback and ratings</p>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews && reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={review.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                            alt={review.user.username}
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {review.user.username}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                  {(!product.reviews || product.reviews.length === 0) && (
                    <p className="text-gray-500 text-center">No reviews yet. Be the first to review this product!</p>
                  )}
                </div>

                {/* Review Form - Only show if user has ordered the product */}
                {token ? (
                  hasOrdered ? (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h4>
                      <form className="space-y-4" onSubmit={handleSubmitReview}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Rating</label>
                          <div className="flex items-center space-x-1 mt-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                className="focus:outline-none"
                                onClick={() => setUserRating(rating)}
                              >
                                <svg
                                  className={`h-8 w-8 ${rating <= userRating ? 'text-yellow-400' : 'text-gray-300'} cursor-pointer hover:text-yellow-400`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                            Your Review
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="comment"
                              name="comment"
                              rows={4}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Share your thoughts about the product..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Submit Review
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Purchase Required</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          You need to purchase this product before you can write a review.
                        </p>
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() => navigate('/products')}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Continue Shopping
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Login Required</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Please log in to write a review.
                      </p>
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => navigate('/login')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Log In
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
