import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMinus, faPlus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const Cart = ({ cartData: initialCartData }) => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(initialCartData);
  const [loading, setLoading] = useState({});

  const updateQuantity = async (orderItemId, method) => {
    // Prevent multiple clicks while processing
    if (loading[orderItemId]) return;
    
    // Don't allow decrement if quantity is 1
    if (method === 'decrement') {
      const item = cartData.orderItems.find(item => item.orderItemId === orderItemId);
      if (item.qty <= 1) return;
    }

    setLoading(prev => ({ ...prev, [orderItemId]: true }));

    try {
      await axiosInstance.put(`/api/orders/update-order-qty/${orderItemId}/`, {
        method
      });

      // Update cart data locally
      setCartData(prevCart => {
        const updatedItems = prevCart.orderItems.map(item => {
          if (item.orderItemId === orderItemId) {
            const newQty = method === 'increment' ? item.qty + 1 : item.qty - 1;
            return {
              ...item,
              qty: newQty
            };
          }
          return item;
        });

        // Calculate new total
        const newTotal = updatedItems.reduce((total, item) => {
          const price = item.product.discount_price || item.product.base_price;
          return total + (price * item.qty);
        }, 0);

        return {
          ...prevCart,
          orderItems: updatedItems,
          orderTotal: newTotal
        };
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Show error toast or message here
    } finally {
      setLoading(prev => ({ ...prev, [orderItemId]: false }));
    }
  };


  // Remove from Cart
  const removeFromCart = async (orderItemId) => {
    try {
      await axiosInstance.delete(`/api/orders/remove-from-cart/${orderItemId}/`);
      setCartData(prevCart => ({
        ...prevCart,
        orderItems: prevCart.orderItems.filter(item => item.orderItemId !== orderItemId)
      }));
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Show error toast or message here
    } finally {
      setLoading(prev => ({ ...prev, [orderItemId]: false }));
    }
  };

  if (!cartData || !cartData.orderItems || cartData.orderItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8">
        <FontAwesomeIcon icon={faShoppingCart} className="text-gray-300 text-6xl mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-6">Add items to your cart to see them here</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm">
              {cartData.orderItems.map((item) => (
                <div 
                  key={item.orderItemId} 
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 border-b border-gray-200 last:border-b-0"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product?.images && item.product.images.length > 0 ? (
                      <img
                        src={`http://127.0.0.1:8000${item.product.images[0].image}`}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/96';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {item.product?.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Price: Rs. {item.product.discount_price || item.product?.base_price}
                    </p>
                    
                    {/* Variants */}
                    {item.variantDetails && item.variantDetails.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.variantDetails.map((variant) => (
                          <span 
                            key={variant.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                          >
                            {variant.name}: {variant.value}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="mt-4 flex items-center gap-6">
                      <div className="flex items-center">
                        <button 
                          className={`w-8 h-8 flex items-center justify-center rounded-l border border-r-0 border-gray-300 ${
                            item.qty <= 1 ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => updateQuantity(item.orderItemId, 'decrement')}
                          disabled={item.qty <= 1 || loading[item.orderItemId]}
                        >
                          <FontAwesomeIcon 
                            icon={faMinus} 
                            className={item.qty <= 1 ? 'text-gray-400' : 'text-gray-600'} 
                          />
                        </button>
                        <div className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300 bg-white">
                          {loading[item.orderItemId] ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            item.qty
                          )}
                        </div>
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-r border border-l-0 border-gray-300 bg-gray-50 hover:bg-gray-100"
                          onClick={() => updateQuantity(item.orderItemId, 'increment')}
                          disabled={loading[item.orderItemId]}
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-gray-600" />
                        </button>
                      </div>
                      
                      <button 
                        className="text-red-500 hover:text-red-700 transition-colors"
                        disabled={loading[item.orderItemId]}
                        onClick={() => removeFromCart(item.orderItemId)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="sm:ml-4 text-right">
                    <p className="text-lg font-medium text-gray-900">
                      Rs. {((item.product?.discount_price || item.product?.base_price) * item.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {cartData.orderTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <span className="text-xl font-semibold text-gray-900">
                    Rs. {cartData.orderTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Proceed to Checkout
              </button>

              <button 
                onClick={() => navigate('/')}
                className="w-full mt-4 text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;