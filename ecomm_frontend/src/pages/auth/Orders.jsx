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
  faUndo
} from '@fortawesome/free-solid-svg-icons';

const Orders = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('all');
  const [filteredOrderItems, setFilteredOrderItems] = useState([]);

  useEffect(() => {
    fetchOrderItems();
  }, []);

  useEffect(() => {
    filterOrderItems(activeSection);
  }, [activeSection, orderItems]);

  const fetchOrderItems = async () => {
    try {
      const response = await axiosInstance.get('/api/orders/user-orders/');
      if (response.data.status === 'success') {
        setOrderItems(response.data.data);
        setFilteredOrderItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrderItems = (section) => {
    switch (section) {
      case 'pending':
        setFilteredOrderItems(orderItems.filter(item => item.currentStatus.status === 'Pending'));
        break;
      case 'completed':
        setFilteredOrderItems(orderItems.filter(item => item.currentStatus?.status === 'Delivered'));
        break;
      case 'to-pay':
        setFilteredOrderItems(orderItems.filter(item => !item.paymentDetail.is_paid));
        break;
      case 'returned':
        setFilteredOrderItems(orderItems.filter(item => item.currentStatus?.status === 'Returned'));
        break;
      default:
        setFilteredOrderItems(orderItems);
    }
  };

  const sections = [
    { id: 'all', label: 'All Orders', icon: faBox },
    { id: 'pending', label: 'Pending Orders', icon: faClock },
    { id: 'completed', label: 'Completed Orders', icon: faCheck },
    { id: 'to-pay', label: 'To Pay', icon: faCreditCard },
    { id: 'returned', label: 'Returned Orders', icon: faUndo }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FontAwesomeIcon icon={faSpinner} className="text-indigo-600 text-4xl animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Order Sections */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={section.icon} className="mr-2 h-4 w-4" />
              {section.label}
              {activeSection === section.id && (
                <span className="ml-2 bg-indigo-500 text-white px-2 py-0.5 rounded-full text-xs">
                  {filteredOrderItems.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {sections.find(s => s.id === activeSection)?.label}
      </h1>
      
      <div className="space-y-6">
        {filteredOrderItems.length > 0 ? (
          filteredOrderItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
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
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Quantity: {item.qty}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Order #{item.orderItemId} • {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.currentStatus?.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      item.currentStatus?.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      item.currentStatus?.status === 'Returned' ? 'bg-red-100 text-red-800' :
                      item.currentStatus?.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      item.currentStatus?.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.currentStatus?.status || 'Processing'}
                    </span>
                    {!item.paymentDetail.is_paid && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        Payment Pending
                      </span>
                    )}

                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-end justify-between">
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900">
                      {formatPrice(item.product.base_price * item.qty, 'PKR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(item.product.base_price, 'PKR')} each
                    </p>
                  </div>
                  <Link
                    to={`order-item-detail/${item.orderItemId}`}
                    className="mt-4 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View Details
                    <FontAwesomeIcon icon={faChevronRight} className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FontAwesomeIcon 
              icon={sections.find(s => s.id === activeSection)?.icon} 
              className="h-12 w-12 text-gray-400 mb-4"
            />
            <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeSection === 'all' 
                ? "You haven't placed any orders yet."
                : `You don't have any ${activeSection.replace('-', ' ')} orders.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;