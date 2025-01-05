import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { formatPrice } from '../../utils/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faChevronRight,
  faBox,
  faClock,
  faCheck,
  faCreditCard,
  faUndo,
  faTruck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

const Orders = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('all');
  const [filteredOrderItems, setFilteredOrderItems] = useState([]);
  const [processingOrder, setProcessingOrder] = useState(null);

  useEffect(() => {
    fetchOrderItems();
  }, []);

  useEffect(() => {
    filterOrderItems(activeSection);
  }, [activeSection, orderItems]);

  const fetchOrderItems = async () => {
    try {
      const response = await axiosInstance.get('/api/sellers/orders/');
      if (response.data.status === 'success') {
        setOrderItems(response.data.data);
        setFilteredOrderItems(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching order items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrderItems = (section) => {
    switch (section) {
      case 'pending':
        setFilteredOrderItems(orderItems.filter(item => 
          item.currentStatus?.status === 'Pending' || 
          item.currentStatus?.status === 'Processing'
        ));
        break;
      case 'processing':
        setFilteredOrderItems(orderItems.filter(item => 
          item.currentStatus?.status === 'Processed'
        ));
        break;
      case 'shipping':
        setFilteredOrderItems(orderItems.filter(item => 
          item.currentStatus?.status === 'Shipped'
        ));
        break;
      case 'completed':
        setFilteredOrderItems(orderItems.filter(item => 
          item.currentStatus?.status === 'Delivered'
        ));
        break;
      case 'returned':
        setFilteredOrderItems(orderItems.filter(item => 
          ['Returned', 'Return Rejected', 'Return Approved', 'Return Requested', 'Refunded'].includes(item.currentStatus?.status) ||
          (item.currentStatus?.status === 'Refunded' && item.refund)
        ));
        break;
      case 'cancelled':
        setFilteredOrderItems(orderItems.filter(item => 
          item.currentStatus?.status === 'Cancelled'
        ));
        break;
      default:
        setFilteredOrderItems(orderItems);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
      case 'Return Requested':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      case 'Processing':
      case 'Return Approved':
        return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100';
      case 'Shipped':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      case 'Delivered':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'Returned':
      case 'Return Rejected':
      case 'Cancelled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
      case 'Refunded':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusActions = (item) => {
    const currentStatus = item.currentStatus?.status;
    switch (currentStatus) {
      case 'Pending':
        return [
          { label: 'Process Order', status: 'Processing', color: 'indigo' }
        ];
      case 'Processing':
        return [
          { label: 'Ship Order', status: 'Shipped', color: 'blue' }
        ];
      case 'Shipped':
        return [
          { label: 'Mark Delivered', status: 'Delivered', color: 'green' }
        ];
      case 'Return Requested':
        return [
          { label: 'Approve Return', status: 'Return Approved', color: 'green' },
          { label: 'Reject Return', status: 'Return Rejected', color: 'red' }
        ];
      case 'Return Approved':
        return [
          { label: 'Mark Returned', status: 'Returned', color: 'yellow' },
          { label: 'Process Refund', status: 'Refunded', color: 'purple' }
        ];
      default:
        return [];
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setProcessingOrder(orderId);
    try {
      const response = await axiosInstance.post(`/api/orders/update-status/${orderId}/`, {
        status: newStatus
      });
      if (response.data.status === 'success') {
        fetchOrderItems(); // Refresh the orders list
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setProcessingOrder(null);
    }
  };

  const sections = [
    { id: 'all', label: 'All Orders', icon: faBox },
    { id: 'pending', label: 'New Orders', icon: faClock },
    { id: 'processing', label: 'Processed', icon: faCreditCard },
    { id: 'shipping', label: 'Shipping', icon: faTruck },
    { id: 'completed', label: 'Completed', icon: faCheck },
    { id: 'returned', label: 'Returns', icon: faUndo },
    { id: 'cancelled', label: 'Cancelled', icon: faTimes }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 ml-64">
        <div className="flex justify-center items-center">
          <FontAwesomeIcon icon={faSpinner} className="text-indigo-600 dark:text-indigo-400 text-4xl animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 ml-64">
      <div className="max-w-7xl mx-auto">
        {/* Order Sections */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={section.icon} className="mr-2 h-4 w-4" />
                {section.label}
                {activeSection === section.id && (
                  <span className="ml-2 bg-indigo-500 dark:bg-indigo-400 text-white px-2 py-0.5 rounded-full text-xs">
                    {filteredOrderItems.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          {sections.find(s => s.id === activeSection)?.label}
        </h1>
        
        <div className="space-y-6">
          {filteredOrderItems.length > 0 ? (
            filteredOrderItems.map((item) => (
              <div
                key={item.orderItemId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={`http://localhost:8000/${item.product.images[0]?.image}`} 
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Quantity: {item.qty}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Order #{item.orderItemId} • {new Date(item.created_at).toLocaleDateString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Customer: {item.user.name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(item.currentStatus?.status)}`}>
                        {item.currentStatus?.status || 'Pending'}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {/* View Details Button */}
                      <Link
                        to={`/seller/orders/order-item-detail/${item.orderItemId}`}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/70"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.product.base_price * item.qty, 'PKR')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatPrice(item.product.base_price, 'PKR')} each
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FontAwesomeIcon 
                icon={sections.find(s => s.id === activeSection)?.icon} 
                className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Orders Found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {activeSection === 'all' 
                  ? "You don't have any orders yet."
                  : `You don't have any ${activeSection.replace('-', ' ')} orders.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
