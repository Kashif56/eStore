import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStore,
  faSpinner,
  faBox,
  faClock,
  faCheck,
  faTruck,
  faUndo,
  faExclamationTriangle,
  faCreditCard,
  faMapMarkerAlt,
  faMoneyBill,
  faUser,
  faPhone,
  faShippingFast,
  faBoxOpen,
  faFileInvoice,
  faHandshake,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

function OrderItemDetail() {
  const { orderItemId } = useParams();
  const [orderItem, setOrderItem] = useState(null);
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [error, setError] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [returnRequest, setReturnRequest] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`api/orders/order-item-detail/${orderItemId}/`)
      .then((res) => {
        console.log('Order Item Response:', res.data);
        setOrderItem(res.data.data);
        setPaymentDetail(res.data.payment);
        setReturnRequest(res.data.returnRequest);
       
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load order details. Please try again later.');
        console.error(err);
      });
  }, [orderItemId]);

  const imageUrl = orderItem?.product?.images?.[0]?.image
    ? `http://localhost:8000${orderItem.product.images[0].image}`
    : 'fallback-image-url'; // Replace with an actual fallback image URL.

  // Determine the status of the order
  const currentStatus = orderItem?.allStatus?.[orderItem.allStatus.length - 1]?.status;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500 text-white';
      case 'Shipped':
        return 'bg-blue-500 text-white';
      case 'Delivered':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return faClock;
      case 'Processing':
        return faBoxOpen;
      case 'Processed':
        return faFileInvoice;
      case 'Shipped':
        return faShippingFast;
      case 'Delivered':
        return faHandshake;
      case 'Returned':
        return faUndo;
      case 'Cancelled':
        return faTimesCircle;
      default:
        return faExclamationTriangle;
    }
  };

  const handleReturnRequest = async () => {
    if (!returnReason || !returnDescription) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(`api/orders/request-return/${orderItemId}/`, {
        reason: returnReason,
        description: returnDescription
      });
      
      if (response.data.status === 'success') {
        setShowReturnModal(false);
        // Refresh order item data
        const res = await axiosInstance.get(`api/orders/order-item-detail/${orderItemId}/`);
        setOrderItem(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit return request. Please try again.');
      console.error('Return request error:', err.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReturnEligible = () => {
    const currentStatus = orderItem.allStatus[orderItem.allStatus.length - 1];
    if (currentStatus.status !== 'Delivered') {
      return false;
    }

    const deliveryDate = new Date(currentStatus.created_at);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - deliveryDate) / (1000 * 60 * 60 * 24));
    
    return daysDifference <= 7;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">Order Item Details</h1>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        {orderItem ? (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 space-y-6">
            {/* Section 1: Basic Order Information */}
            <div className="border-b pb-6">
              <h1 className="text-lg font-bold text-gray-800">
                <FontAwesomeIcon icon={faStore} className="text-indigo-600 mr-2" />
                {orderItem?.product?.seller?.business_name}
              </h1>
              <h2>Order ID: {orderItemId}</h2>
              <p className="text-sm text-gray-500">Order Date: {orderItem?.updated_at}</p>

              {/* Move Current Status Badge to the right */}
              <div className="flex justify-end mt-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(currentStatus)}`}
                >
                  {currentStatus}
                </span>
              </div>

              <div className="flex items-center space-x-6 mt-6">
                {orderItem.product?.images?.[0]?.image && (
                  <img
                    src={imageUrl}
                    alt={orderItem.product.name}
                    className="w-28 h-28 object-cover rounded-lg shadow-md"
                  />
                )}
                <div className='flex-grow flex items-center justify-between'>
                  <h3 className="text-gray-900 text-md font-semibold">{orderItem.product?.name}</h3>
                  <p className="text-gray-600 text-sm">Quantity: {orderItem.qty}</p>
                  <p>
                    {orderItem.product.discount_price ? (
                      <span className="text-sm font-medium text-gray-900">
                        <span className="text-sm text-gray-500 mr-2 line-through">
                          Rs. {orderItem.product.base_price}
                        </span>
                        Rs. {orderItem.product.discount_price}
    
                        <span className="ml-3 bg-green-600 text-white text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900">
                          {Math.round(((orderItem.product.base_price - orderItem.product.discount_price) / orderItem.product.base_price) * 100)}% Off
                      </span>
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        Rs. {orderItem.product.base_price}
                      </span>
                    )}</p>

                  <p className='text-lg font-medium'> Total Rs. {orderItem.product.discount_price ? orderItem.product.discount_price * orderItem.qty : orderItem.product.base_price * orderItem.qty}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Order Item Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Order Timeline */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <FontAwesomeIcon icon={faClock} className="mr-2" />
                  Order Timeline
                </h2>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {orderItem.allStatus?.map((status, idx) => (
                      <li key={status.id}>
                        <div className="relative pb-8">
                          {idx !== (orderItem.allStatus?.length || 0) - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${
                                status.status === 'Pending' ? 'bg-yellow-500 dark:bg-yellow-900' :
                                status.status === 'Processing' ? 'bg-indigo-500 dark:bg-indigo-900' :
                                status.status === 'Shipped' ? 'bg-blue-500 dark:bg-blue-900' :
                                status.status === 'Delivered' ? 'bg-green-500 dark:bg-green-900' :
                                status.status === 'Returned' ? 'bg-red-500 dark:bg-red-900' :
                                status.status === 'Cancelled' ? 'bg-gray-500 dark:bg-gray-900' :
                                'bg-gray-400 dark:bg-gray-900'
                              }`}>
                                <FontAwesomeIcon 
                                  icon={getStatusIcon(status.status)} 
                                  className="h-4 w-4 text-white"
                                  aria-hidden="true"
                                />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {status.status}
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(status.created_at).toLocaleString()}
                                </p>
                                {status.status === 'Return Requested' && returnRequest?.reason && (
                                  <div className="mt-2 bg-red-50 dark:bg-red-900/30 rounded-md p-3 space-y-2">
                                    <div className="text-sm">
                                      <p className="font-medium text-red-900 dark:text-red-100 mb-2">Return Request Details:</p>
                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-xs text-red-600 dark:text-red-300">Return Reason</p>
                                          <p className="text-sm text-red-800 dark:text-red-200">{returnRequest?.reason || 'Not specified'}</p>
                                        </div>
                                        {returnRequest?.description && (
                                          <div>
                                            <p className="text-xs text-red-600 dark:text-red-300">Description</p>
                                            <p className="text-sm text-red-800 dark:text-red-200">{returnRequest.description}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}


                                {['Returned', 'Return Approved', 'Approved', 'Rejected', 'Cancelled'].includes(status.status) && 
    returnRequest?.currentStatus?.status === status.status && (
      <div className="mt-2 bg-red-50 dark:bg-red-900/30 rounded-md p-3 space-y-2">
        <div className="text-sm">
          <p className="font-medium text-red-900 dark:text-red-100 mb-2">Return Status Update</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-red-600 dark:text-red-300">Status Reason</p>
              <p className="text-sm text-red-800 dark:text-red-200">
                {returnRequest.currentStatus.reason}
              </p>
            </div>
          </div>
        </div>
      </div>
    )}

    {['Returned', 'Return Rejected', 'Return Approved', 'Approved', 'Rejected', 'Cancelled'].includes(status.status) && 
    returnRequest?.allStatus?.find(s => s.status === status.status)?.reason && (
      <div className="mt-2 bg-red-50 dark:bg-red-900/30 rounded-md p-3 space-y-2">
        <div className="text-sm">
          <p className="font-medium text-red-900 dark:text-red-100 mb-2">Return Status Update</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-red-600 dark:text-red-300">Status Reason</p>
              <p className="text-sm text-red-800 dark:text-red-200">
                {returnRequest.allStatus.find(s => s.status === status.status).reason}
              </p>
            </div>
          </div>
        </div>
      </div>
    )}




                                {status.status === 'Shipped' && (
                                  <div className="mt-2 bg-blue-50 dark:bg-blue-900/30 rounded-md p-3 space-y-2">
                                    <div className="text-sm">
                                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">Shipping Details:</p>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <p className="text-xs text-blue-600 dark:text-blue-300">Shipped From</p>
                                          <p className="text-sm text-blue-800 dark:text-blue-200">{status.shipped_from || 'Not specified'}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-blue-600 dark:text-blue-300">Shipped To</p>
                                          <p className="text-sm text-blue-800 dark:text-blue-200">{status.shipped_to || 'Not specified'}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-blue-600 dark:text-blue-300">Courier Service</p>
                                          <p className="text-sm text-blue-800 dark:text-blue-200">{orderItem.courier || 'Not specified'}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-blue-600 dark:text-blue-300">Tracking ID</p>
                                          <p className="text-sm text-blue-800 dark:text-blue-200">{orderItem.trackingId || 'Not specified'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {status.status === 'Refunded' && orderItem.refund && (
                                  <div className="mt-2 bg-green-50 dark:bg-green-900/30 rounded-md p-3 space-y-2">
                                    <div className="text-sm">
                                      <p className="font-medium text-green-900 dark:text-green-100 mb-2">Refund Details</p>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <p className="text-xs text-green-600 dark:text-green-300">Refund ID</p>
                                          <p className="text-sm text-green-800 dark:text-green-200">{orderItem.refund.refundId}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-green-600 dark:text-green-300">Amount</p>
                                          <p className="text-sm text-green-800 dark:text-green-200">{orderItem.refund.amount}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-green-600 dark:text-green-300">Payment Method</p>
                                          <p className="text-sm text-green-800 dark:text-green-200">{orderItem.refund.paymentMethod}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-green-600 dark:text-green-300">Transaction ID</p>
                                          <p className="text-sm text-green-800 dark:text-green-200">{orderItem.refund.transactionId}</p>
                                        </div>
                                        <div className="col-span-2">
                                          <p className="text-xs text-green-600 dark:text-green-300">Processed On</p>
                                          <p className="text-sm text-green-800 dark:text-green-200">
                                            {new Date(orderItem.refund.created_at).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                { returnRequest?.allStatus?.reason && (
                                  <div className="mt-2 bg-red-50 dark:bg-red-900/30 rounded-md p-3 space-y-2">
                                  <div className="text-sm">
                                    <p className="font-medium text-red-900 dark:text-red-100 mb-2">Return Request Details:</p>
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-xs text-red-600 dark:text-red-300">Return Reason</p>
                                        <p className="text-sm text-red-800 dark:text-red-200">{returnRequest?.currentStatus?.reason || 'Not specified'}</p>
                                      </div>
                                    
                                    </div>
                                  </div>
                                </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-blue-600 mb-4">Payment Status</h3>
                <div className="p-4 rounded-lg shadow-md border bg-white border-gray-200 space-y-4">
                  {/* Payment Method */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h11M9 21H6c-2.21 0-4-1.79-4-4V7c0-2.21 1.79-4 4-4h12c2.21 0 4 1.79 4 4v5.34m-9 6.66h-3m6 0h-3m-2 0h3"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">Payment Method</p>
                      <p className="text-gray-500 text-sm">{paymentDetail.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${
                        paymentDetail.is_paid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {paymentDetail.is_paid ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">Payment Status</p>
                      <p
                        className={`text-sm ${
                          paymentDetail.is_paid ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {paymentDetail.is_paid ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Total Paid */}
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2zm0 4c-2.208 0-4 1.792-4 4h8c0-2.208-1.792-4-4-4z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">Total Amount</p>
                      <p className="text-gray-500 text-sm">
                        Rs. {paymentDetail.amount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            

            {/* Section 3: Buttons */}
            <div className="flex justify-end space-x-4">
              {orderItem.allStatus[orderItem.allStatus.length - 1].status === 'Pending' && (
                <button className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition">
                  Cancel Order
                </button>
              )}
              {isReturnEligible() && (
                <button 
                  onClick={() => setShowReturnModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                >
                  Return Request
                </button>
              )}
            </div>
          </div>
        ) : (
          !error && <p className="text-center text-gray-600">Loading order details...</p>
        )}
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Request Return</h2>
              <button 
                onClick={() => setShowReturnModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a reason</option>
                  <option value="Defective">Defective Product</option>
                  <option value="WrongItem">Wrong Item Received</option>
                  <option value="NotAsDescribed">Not As Described</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows="4"
                  placeholder="Please provide more details about your return request..."
                ></textarea>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnRequest}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderItemDetail;
