import React, { useState, useEffect, memo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { formatPrice } from '../../utils/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faArrowLeft,
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StatusUpdateModal = memo(({ 
  showModal, 
  onClose, 
  onUpdate, 
  currentStatus, 
  processing,
  getNextStatuses 
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [shippingDetails, setShippingDetails] = useState({
    shippedFrom: '',
    shippedTo: '',
    courier: '',
    trackingId: ''
  });

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    if (newStatus !== 'Shipped') {
      setShippingDetails({
        shippedFrom: '',
        shippedTo: '',
        courier: '',
        trackingId: ''
      });
    }
  };

  const handleSubmit = () => {
    onUpdate(selectedStatus, selectedStatus === 'Shipped' ? shippingDetails : null);
  };

  const handleClose = () => {
    setSelectedStatus('');
    setShippingDetails({
      shippedFrom: '',
      shippedTo: '',
      courier: '',
      trackingId: ''
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full ${showModal ? '' : 'hidden'}`}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
          <div className="mt-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Status</option>
                {getNextStatuses(currentStatus || 'Pending').map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {selectedStatus === 'Shipped' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipped From
                  </label>
                  <input
                    type="text"
                    value={shippingDetails.shippedFrom}
                    onChange={(e) => setShippingDetails(prev => ({
                      ...prev,
                      shippedFrom: e.target.value
                    }))}
                    placeholder="Enter shipping origin"
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipped To
                  </label>
                  <input
                    type="text"
                    value={shippingDetails.shippedTo}
                    onChange={(e) => setShippingDetails(prev => ({
                      ...prev,
                      shippedTo: e.target.value
                    }))}
                    placeholder="Enter shipping destination"
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Courier Service
                  </label>
                  <input
                    type="text"
                    value={shippingDetails.courier}
                    onChange={(e) => setShippingDetails(prev => ({
                      ...prev,
                      courier: e.target.value
                    }))}
                    placeholder="Enter courier service name"
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking ID
                  </label>
                  <input
                    type="text"
                    value={shippingDetails.trackingId}
                    onChange={(e) => setShippingDetails(prev => ({
                      ...prev,
                      trackingId: e.target.value
                    }))}
                    placeholder="Enter tracking number"
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedStatus || processing || 
                  (selectedStatus === 'Shipped' && 
                    (!shippingDetails.shippedFrom || !shippingDetails.shippedTo || 
                     !shippingDetails.courier || !shippingDetails.trackingId)
                  )}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                ) : null}
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const ReturnRequestModal = memo(({ 
  showModal, 
  onClose, 
  onUpdate, 
  currentStatus, 
  processing,
  returnRequest 
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [returnReason, setReturnReason] = useState('');

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSubmit = () => {
    onUpdate(selectedStatus, returnReason);
  };

  const handleClose = () => {
    setSelectedStatus('');
    setReturnReason('');
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full ${showModal ? '' : 'hidden'}`}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Update Return Request</h3>
          <div className="mt-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Status
              </label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Status</option>
                {['Approved', 'Rejected', 'Cancelled', 'Returned'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Enter reason for status change"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedStatus || processing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                ) : null}
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const RefundModal = memo(({ 
  showModal, 
  onClose, 
  onProcess,
  processing,
  orderItem,
  returnRequest 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const handleSubmit = () => {
    onProcess({
      paymentMethod,
      transactionId,
      amount: orderItem.orderItemTotal
    });
  };

  const handleClose = () => {
    setPaymentMethod('');
    setTransactionId('');
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full ${showModal ? '' : 'hidden'}`}>
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Process Refund</h3>
          <div className="mt-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Item ID
              </label>
              <input
                type="text"
                value={orderItem?.orderItemId || ''}
                readOnly
                className="w-full rounded-md border border-gray-300 p-2 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <input
                type="text"
                value={orderItem?.product?.name || ''}
                readOnly
                className="w-full rounded-md border border-gray-300 p-2 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="text"
                value={formatPrice(orderItem?.orderItemTotal || 0, 'PKR')}
                readOnly
                className="w-full rounded-md border border-gray-300 p-2 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Enter payment method"
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!paymentMethod || !transactionId || processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                ) : null}
                Process Refund
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

function OrderItemDetail() {
  const { orderItemId } = useParams();
  const [orderItem, setOrderItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [returnRequest, setReturnRequest] = useState(null);
  const [isReturnRequest, setIsReturnRequest] = useState();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderItemId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axiosInstance.get(`/api/sellers/orders/order-item-detail/${orderItemId}/`);
      if (response.data.status === 'success') {
        setOrderItem(response.data.data);
        setReturnRequest(response.data.returnRequest);
        setIsReturnRequest(response.data.isReturnRequest);
        console.log('Return Request:', response.data.returnRequest);
        console.log('Is Return Request:', response.data.isReturnRequest);

      }
    } catch (err) {
      setError('Failed to load order details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getNextStatuses = (currentStatus) => {
    const statusFlow = {
      'Pending': ['Processing', 'Processed', 'Shipped', 'Delivered'],
      'Processing': ['Processed', 'Shipped', 'Delivered'],
      'Processed': ['Shipped', 'Delivered'],
      'Shipped': ['Delivered'],
    };
    return statusFlow[currentStatus] || [];
  };

  const handleUpdateStatus = async (newStatus, shippingDetails) => {
    setProcessingStatus(true);
    try {
      const response = await axiosInstance.post(
        `/api/sellers/orders/update-status/${orderItemId}/`,
        { 
          status: newStatus,
          ...(shippingDetails && { shippingDetails })
        }
      );
      if (response.data.status === 'success') {
        setShowStatusModal(false);
        fetchOrderDetails();
        toast.success(`Order status updated to ${newStatus} successfully!`);
      }
    } catch (err) {
      setError('Failed to update order status. Please try again later.');
      toast.error('Failed to update order status. Please try again later.');
      console.error(err);
    } finally {
      setProcessingStatus(false);
    }
  };

  const handleUpdateReturnStatus = async (newStatus, reason) => {
    setProcessingStatus(true);
    try {
      const response = await axiosInstance.post(
        `/api/sellers/returns/update-return-status/${orderItemId}/`,
        { 
          status: newStatus,
          reason: reason 
        }
      );
      if (response.data.status === 'success') {
        setShowReturnModal(false);
        fetchOrderDetails();
        toast.success(`Return status updated to ${newStatus} successfully!`);
      }
    } catch (err) {
      setError('Failed to update return status. Please try again later.');
      toast.error('Failed to update return status. Please try again later.');
      console.error(err);
    } finally {
      setProcessingStatus(false);
    }
  };

  const handleProcessRefund = async (refundData) => {
    setProcessingStatus(true);
    try {
      const response = await axiosInstance.post(
        `/api/sellers/process-refund/${orderItemId}/`,
        refundData
      );
      if (response.data.status === 'success') {
        setShowRefundModal(false);
        fetchOrderDetails();
        toast.success('Refund processed successfully!');
      }
    } catch (err) {
      setError('Failed to process refund. Please try again later.');
      toast.error('Failed to process refund. Please try again later.');
      console.error(err);
    } finally {
      setProcessingStatus(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Returned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getNextAction = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending':
        return { label: 'Process Order', status: 'Processing', color: 'indigo' };
      case 'Processing':
        return { label: 'Ship Order', status: 'Shipped', color: 'blue' };
      case 'Shipped':
        return { label: 'Mark Delivered', status: 'Delivered', color: 'green' };
      default:
        return null;
    }
  };

  const handleCancelOrder = () => {
    // Implement cancel order logic here
  };

  const ActionButtons = () => (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setShowStatusModal(true)}
          disabled={['Cancelled', 'Refunded', 'Delivered'].includes(orderItem?.currentStatus?.status)}
          className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${!['Cancelled', 'Refunded', 'Delivered'].includes(orderItem?.currentStatus?.status)
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          Update Order Status
        </button>
        
          <button
          onClick={() => setShowReturnModal(true)}
          disabled={orderItem?.currentStatus?.status == 'Returned' || orderItem?.currentStatus?.status == 'Refunded' || !isReturnRequest}
          className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${orderItem.currentStatus?.status !== 'Returned' && orderItem.currentStatus?.status !== 'Refunded' && isReturnRequest
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          {processingStatus ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
          ) : null}
          Update Return Status
        </button>

        <button
          onClick={() => setShowRefundModal(true)}
          disabled={!['Returned'].includes(orderItem?.currentStatus?.status) || processingStatus}
          className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${['Returned'].includes(orderItem?.currentStatus?.status)
              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          {processingStatus ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
          ) : null}
          Process Refund
        </button>

        <button
          onClick={() => handleUpdateStatus('Cancelled', null)}
          disabled={!['Pending'].includes(orderItem?.currentStatus?.status)}
          className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${['Pending'].includes(orderItem?.currentStatus?.status)
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          Cancel Order
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 ml-64">
        <div className="flex justify-center items-center">
          <FontAwesomeIcon icon={faSpinner} className="text-indigo-600 text-4xl animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 ml-64">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-red-600">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-4" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orderItem) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 ml-64">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center text-gray-600">
            <p>Order not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 ml-64">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/seller/orders"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Orders
        </Link>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{orderItem.orderItemId}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {new Date(orderItem.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <FontAwesomeIcon 
                icon={getStatusIcon(orderItem?.currentStatus?.status)} 
                className={`text-xl ${
                  orderItem?.currentStatus?.status === 'Pending' ? 'text-yellow-500' :
                  orderItem?.currentStatus?.status === 'Processing' ? 'text-indigo-500' :
                  orderItem?.currentStatus?.status === 'Shipped' ? 'text-blue-500' :
                  orderItem?.currentStatus?.status === 'Delivered' ? 'text-green-500' :
                  orderItem?.currentStatus?.status === 'Returned' ? 'text-red-500' :
                  'text-gray-500'
                }`}
              />
              <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(orderItem?.currentStatus?.status)}`}>
                {orderItem?.currentStatus?.status}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{orderItem.user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{orderItem.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <FontAwesomeIcon icon={faBox} className="mr-2" />
              Product Information
            </h2>
            <div className="flex items-start space-x-4">
              <img
                src={`http://localhost:8000${orderItem.product?.images[0]?.image}`}
                alt={orderItem.product?.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{orderItem.product?.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Quantity: {orderItem.qty}</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  Price: {formatPrice(orderItem.product?.base_price * orderItem.qty, 'PKR')}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
              Payment Information <br></br>
              <span className="text-sm text-gray-500">{orderItem.paymentDetail.paymentId}</span>
            </h2>
            {orderItem.paymentDetail ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <div className="flex items-center mt-1">
                      <FontAwesomeIcon icon={faMoneyBill} className="mr-2 text-gray-400" />
                      <p className="font-medium">{orderItem.paymentDetail.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-medium">{formatPrice(orderItem.paymentDetail.amount, 'PKR')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className={`font-medium ${orderItem.paymentDetail.is_paid ? 'text-green-600' : 'text-red-600'}`}>
                      {orderItem.paymentDetail.is_paid ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p className="font-medium">
                      {new Date(orderItem.paymentDetail.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No payment information available</p>
            )}
          </div>

          {/* Shipping Information */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
              Shipping Information
            </h2>
            {orderItem.shipping_address ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-col space-y-4">
                  {/* Shipping Status */}
                  {orderItem.currentStatus?.status === 'Shipped' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-3">
                        <FontAwesomeIcon icon={faShippingFast} className="text-blue-500 mr-2" />
                        <h3 className="text-sm font-medium text-blue-900">Shipping Details</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-blue-600">Courier Service</span>
                          <p className="text-sm font-medium text-blue-900">{orderItem.courier || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-blue-600">Tracking ID</span>
                          <p className="text-sm font-medium text-blue-900">{orderItem.trackingId || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Address */}
                  <div className="flex items-start space-x-3">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-indigo-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">Delivery Address</h3>
                      <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-800">
                          {orderItem.shipping_address.street_address}
                          {orderItem.shipping_address.apartment && (
                            <span className="block mt-1 text-gray-600">
                              {orderItem.shipping_address.apartment}
                            </span>
                          )}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <span className="text-xs text-gray-500">City</span>
                            <p className="text-sm text-gray-800">{orderItem.shipping_address.city}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">State</span>
                            <p className="text-sm text-gray-800">{orderItem.shipping_address.state}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Postal Code</span>
                            <p className="text-sm text-gray-800">{orderItem.shipping_address.postal_code}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Country</span>
                            <p className="text-sm text-gray-800">{orderItem.shipping_address.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No shipping information available</p>
            )}
          </div>

          {/* Order Timeline */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            status.status === 'Pending' ? 'bg-yellow-500' :
                            status.status === 'Processing' ? 'bg-indigo-500' :
                            status.status === 'Shipped' ? 'bg-blue-500' :
                            status.status === 'Delivered' ? 'bg-green-500' :
                            status.status === 'Returned' ? 'bg-red-500' :
                            status.status === 'Cancelled' ? 'bg-gray-500' :
                            'bg-gray-400'
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
                            <p className="text-sm font-medium text-gray-900">
                              {status.status}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {new Date(status.created_at).toLocaleString()}
                            </p>
                            {status.status === 'Return Requested' && returnRequest?.reason && (
                              <div className="mt-2 bg-red-50 rounded-md p-3 space-y-2">
                                <div className="text-sm">
                                  <p className="font-medium text-red-900 mb-2">Return Request Details:</p>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-red-600">Return Reason</p>
                                      <p className="text-sm text-red-800">{returnRequest?.reason || 'Not specified'}</p>
                                    </div>
                                    {returnRequest?.description && (
                                      <div>
                                        <p className="text-xs text-red-600">Description</p>
                                        <p className="text-sm text-red-800">{returnRequest.description}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            {['Returned', 'Rejected', 'Refunded', 'Cancelled'].includes(status.status) && 
                             returnRequest?.currentStatus?.status === status.status && 
                             returnRequest?.currentStatus?.reason && (
                              <div className="mt-2 bg-red-50 rounded-md p-3 space-y-2">
                                <div className="text-sm">
                                  <p className="font-medium text-red-900 mb-2">Return Status Update</p>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-red-600">Status Reason</p>
                                      <p className="text-sm text-red-800">
                                        {returnRequest.currentStatus.reason}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {['Returned', 'Rejected', 'Refunded', 'Cancelled'].includes(status.status) && 
                             returnRequest?.allStatus?.find(s => s.status === status.status)?.reason && (
                              <div className="mt-2 bg-red-50 rounded-md p-3 space-y-2">
                                <div className="text-sm">
                                  <p className="font-medium text-red-900 mb-2">Return Status Update</p>
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-xs text-red-600">Status Reason</p>
                                      <p className="text-sm text-red-800">
                                        {returnRequest?.allStatus?.find(s => s.status === status.status)?.reason}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {status.status === 'Shipped' && (
                              <div className="mt-2 bg-blue-50 rounded-md p-3 space-y-2">
                                <div className="text-sm">
                                  <p className="font-medium text-blue-900 mb-2">Shipping Details:</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-xs text-blue-600">Shipped From</p>
                                      <p className="text-sm text-blue-800">{status.shipped_from || 'Not specified'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-blue-600">Shipped To</p>
                                      <p className="text-sm text-blue-800">{status.shipped_to || 'Not specified'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-blue-600">Courier Service</p>
                                      <p className="text-sm text-blue-800">{orderItem.courier || 'Not specified'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-blue-600">Tracking ID</p>
                                      <p className="text-sm text-blue-800">{orderItem.trackingId || 'Not specified'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {status.status === 'Refunded' && orderItem.refund && (
                              <div className="mt-2 bg-green-50 rounded-md p-3 space-y-2">
                                <div className="text-sm">
                                  <p className="font-medium text-green-900 mb-2">Refund Details</p>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-xs text-green-600">Refund ID</p>
                                      <p className="text-sm text-green-800">{orderItem.refund.refundId}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-green-600">Amount</p>
                                      <p className="text-sm text-green-800">{formatPrice(orderItem.refund.amount, 'PKR')}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-green-600">Payment Method</p>
                                      <p className="text-sm text-green-800">{orderItem.refund.paymentMethod}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-green-600">Transaction ID</p>
                                      <p className="text-sm text-green-800">{orderItem.refund.transactionId}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-xs text-green-600">Processed On</p>
                                      <p className="text-sm text-green-800">
                                        {new Date(orderItem.refund.created_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            { returnRequest?.allStatus?.reason && (
                              <div className="mt-2 bg-red-50 rounded-md p-3 space-y-2">
                              <div className="text-sm">
                                <p className="font-medium text-red-900 mb-2">Return Request Details:</p>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-red-600">Return Reason</p>
                                    <p className="text-sm text-red-800">{returnRequest?.currentStatus?.reason || 'Not specified'}</p>
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

          <ActionButtons />
        </div>
      </div>
      <StatusUpdateModal
        showModal={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onUpdate={handleUpdateStatus}
        currentStatus={orderItem?.currentStatus?.status}
        processing={processingStatus}
        getNextStatuses={getNextStatuses}
      />
      <ReturnRequestModal
        showModal={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onUpdate={handleUpdateReturnStatus}
        currentStatus={orderItem?.currentStatus?.status}
        processing={processingStatus}
        returnRequest={returnRequest}
      />
      <RefundModal
        showModal={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onProcess={handleProcessRefund}
        processing={processingStatus}
        orderItem={orderItem}
        returnRequest={returnRequest}
      />
    </div>
  );
}

export default OrderItemDetail;
