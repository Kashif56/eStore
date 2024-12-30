import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faShoppingBag,
  faCircleCheck,
  faTruck,
  faBoxOpen,
  faClock,
  faTimesCircle,
  faChevronRight,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../utils/axiosInstance';
import Toast from '../../components/Toast';

const OrderStatusIcon = ({ status }) => {
  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
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
        return <FontAwesomeIcon icon={faShoppingBag} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {getStatusIcon()}
      <span className={`text-sm font-medium capitalize ${
        status.toLowerCase() === 'delivered' ? 'text-green-700' :
        status.toLowerCase() === 'cancelled' ? 'text-red-700' :
        status.toLowerCase() === 'shipped' ? 'text-indigo-700' :
        status.toLowerCase() === 'processing' ? 'text-blue-700' :
        status.toLowerCase() === 'pending' ? 'text-yellow-700' :
        'text-gray-700'
      }`}>
        {status}
      </span>
    </div>
  );
};

const OrderDetail = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Order #{order.order_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Order Status and Date */}
          <div className="flex justify-between items-center">
            <OrderStatusIcon status={order.status} />
            <span className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleString()}
            </span>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shipping Address */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
              {order.shipping_address ? (
                <div className="text-sm text-gray-600">
                  <p>{order.shipping_address.street_address}</p>
                  {order.shipping_address.apartment && (
                    <p>{order.shipping_address.apartment}</p>
                  )}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state}{' '}
                    {order.shipping_address.postal_code}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No shipping address provided</p>
              )}
            </div>

            {/* Billing Address */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Billing Address</h3>
              {order.billing_address ? (
                <div className="text-sm text-gray-600">
                  <p>{order.billing_address.street_address}</p>
                  {order.billing_address.apartment && (
                    <p>{order.billing_address.apartment}</p>
                  )}
                  <p>
                    {order.billing_address.city}, {order.billing_address.state}{' '}
                    {order.billing_address.postal_code}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Same as shipping address</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.product.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${order.total_amount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Information */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-900 capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Status</p>
                <p className="font-medium text-gray-900 capitalize">{order.payment_status}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Order Notes</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/api/orders/orders/');
      if (response.data.status === 'success') {
        setOrders(response.data.data);
      }
    } catch (error) {
      setError('Failed to fetch orders');
      setToast({
        show: true,
        message: 'Failed to fetch orders',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/orders/user/orders/${orderId}/`);
      if (response.data.status === 'success') {
        setSelectedOrder(response.data.data);
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to fetch order details',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faShoppingBag} className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="text-gray-500">When you place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <OrderStatusIcon status={order.status} />
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Items: {order.total_items}</span>
                    <span>Total: ${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-sm text-gray-500">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => fetchOrderDetail(order.id)}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View Details
                    <FontAwesomeIcon icon={faChevronRight} className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default Orders;
