import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faBoxOpen,
  faTruck,
  faCircleCheck,
  faTimesCircle,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

export const OrderStatusIcon = ({ status }) => {
  const getStatusIcon = () => {
    const statusText = status?.status || status || 'pending';
    
    switch (statusText.toLowerCase()) {
      case 'pending':
        return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
      case 'processing':
        return <FontAwesomeIcon icon={faBoxOpen} className="text-blue-500" />;
      case 'shipped':
        return <FontAwesomeIcon icon={faTruck} className="text-indigo-500" />;
      case 'delivered':
        return <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" />;
      case 'cancelled':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    const statusText = status?.status || status || 'pending';
    
    switch (statusText.toLowerCase()) {
      case 'pending': return 'text-yellow-700';
      case 'processing': return 'text-blue-700';
      case 'shipped': return 'text-indigo-700';
      case 'delivered': return 'text-green-700';
      case 'cancelled': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {getStatusIcon()}
      <span className={`text-sm font-medium capitalize ${getStatusColor()}`}>
        {status?.status || status || 'Pending'}
      </span>
    </div>
  );
};

const OrderCard = ({ orderItem }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 hover:shadow-md transition-all duration-200">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order Item #{orderItem.orderItemId}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(orderItem.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <OrderStatusIcon status={orderItem.currentStatus} />
      </div>

      {/* Product Details */}
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          {orderItem.product?.images?.[0]?.image ? (
            <img
              src={`http://localhost:8000/${orderItem.product.images[0].image}`}
              alt={orderItem.product.name}
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-grow">
          <h4 className="text-base font-medium text-gray-900">
            {orderItem.product.name}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {orderItem.product.description?.substring(0, 100)}
            {orderItem.product.description?.length > 100 ? '...' : ''}
          </p>
          
          {/* Price and Quantity */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Quantity: {orderItem.qty}
              </span>
              {orderItem.product.discount_price ? (
                <span className="text-sm font-medium text-gray-900">
                    <span className="text-sm text-gray-500 mr-2 line-through">
                    Rs. {orderItem.product.base_price}
                  </span>
                  Rs. {orderItem.product.discount_price}

             
                  <span className="ml-3 text-white bg-green-100 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900">
                    {Math.round(((orderItem.product.base_price - orderItem.product.discount_price) / orderItem.product.base_price) * 100)}% Off
                </span>


                  
                </span>
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  Rs. {orderItem.product.base_price}
                </span>
              )}
            </div>
            <span className="text-base font-semibold text-gray-900">
              Total: Rs. {orderItem.product.discount_price ? orderItem.product.discount_price * orderItem.qty : orderItem.product.base_price * orderItem.qty}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex space-x-4">
          {/* Add any additional action buttons here */}
        </div>
        <Link
          to={`order-item-detail/${orderItem.orderItemId}`}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          View Details
          <FontAwesomeIcon icon={faChevronRight} className="ml-2 h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;