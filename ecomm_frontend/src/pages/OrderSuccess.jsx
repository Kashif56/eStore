import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faBox, faShoppingBag } from '@fortawesome/free-solid-svg-icons';

const OrderSuccess = () => {
  const location = useLocation();
  const { orderDetails } = location.state || {};

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <FontAwesomeIcon icon={faShoppingBag} className="text-gray-400 text-5xl mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">No Order Details Found</h1>
          <p className="text-gray-600 mb-4">Please go back to shopping</p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const { orderId, orderItems, totalAmount, paymentMethod } = orderDetails;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-8 text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-white text-5xl mb-4" />
            <h1 className="text-2xl font-bold text-white">Order Placed Successfully!</h1>
            <p className="text-indigo-100 mt-2">Thank you for shopping with us</p>
          </div>

          {/* Order Details */}
          <div className="px-6 py-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
              <p className="text-gray-600 mt-1">Order ID: {orderId}</p>
              <p className="text-gray-600">Payment Method: {paymentMethod}</p>
              <p className="text-gray-600">
                Ordered At: {new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(new Date(orderItems[0]?.updated_at))}
              </p>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
              {orderItems.map((item) => (
                
                <div key={item.id} className="flex items-center border-b last:border-b-0 pb-4">
                  
                  <div className="h-20 w-20 flex-shrink-0">
                    <img
                      src={`http://localhost:8000${item.product.images[0]?.image}`}
                      alt={item.product.name}
                      className="h-full w-full object-cover rounded"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                    <p className="text-sm text-gray-500">Order ID: {item.orderItemId}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Rs. {(item.qty * (item.product.discount_price || item.product.base_price)).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="mt-6 border-t pt-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Total Amount</p>
                <p>Rs. {totalAmount.toFixed(0)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <Link
                to="/orders"
                className="w-full block text-center bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
              >
                View All Orders
              </Link>
              <Link
                to="/"
                className="w-full block text-center bg-gray-100 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
