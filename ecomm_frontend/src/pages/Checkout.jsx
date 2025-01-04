import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faMoneyBill, faCreditCard, faMapMarkerAlt, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';

// Address Card Component
const AddressCard = ({ address, selected, onSelect }) => {
  const isSelected = selected === address.id;

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-200'
      }`}
      onClick={() => onSelect(address.id)}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            isSelected ? 'border-indigo-500' : 'border-gray-300'
          }`}
        >
          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
        </div>
        <div className="flex-1">
          <p className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
            {address.street_address}
          </p>
          {address.apartment && (
            <p className="text-sm text-gray-500">{address.apartment}</p>
          )}
          <p className="text-sm text-gray-500">
            {address.city}, {address.state} {address.postal_code}
          </p>
        </div>
      </div>
    </div>
  );
};

// Payment Method Card Component
const PaymentMethodCard = ({ method, selected, onSelect }) => {
  const isSelected = selected?.id === method.id;

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-200'
      }`}
      onClick={() => onSelect(method)}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            isSelected ? 'border-indigo-500' : 'border-gray-300'
          }`}
        >
          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
        </div>
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon
            icon={method.icon}
            className={isSelected ? 'text-indigo-500' : 'text-gray-400'}
          />
          <span className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
            {method.name}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500 ml-8">{method.description}</p>
    </div>
  );
};

// Order Item Card Component
const OrderItemCard = ({ item }) => {
  const price = Number(item.product.discount_price || item.product.base_price);
  const total = item.qty * price;

  return (
    <div className="flex items-center space-x-4 py-4 border-b">
      <div className="w-20 h-20 flex-shrink-0">
        <img
          src={`http://localhost:8000${item.product.images[0]?.image}`}
          alt={item.product.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {item.product.name}
        </h3>
        <p className="text-sm text-gray-500">
          Qty: {item.qty} × ${price.toFixed(2)}
        </p>
      </div>
      <div className="text-sm font-medium text-gray-900">
        ${total.toFixed(2)}
      </div>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ onClose, onSubmit, amount, processing }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Validate card number (16 digits)
    if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    // Validate expiry date (MM/YY format)
    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    // Validate CVV (3 or 4 digits)
    if (!cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Please enter a valid CVV (3-4 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!cardNumber || !expiryDate || !cvv) {
      showToast('All payment fields are required - React', 'error');
      return;
    }

    if (!validateForm()) {
      return;
    }

    onSubmit({
      card_number: cardNumber.replace(/\s/g, ''),
      expiry_date: expiryDate,
      cvv
    });
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Enter Payment Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength="19"
              placeholder="1234 5678 9012 3456"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.cardNumber ? 'border-red-500' : ''
              }`}
              required
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                maxLength="5"
                placeholder="MM/YY"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.expiryDate ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                maxLength="4"
                placeholder="123"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.cvv ? 'border-red-500' : ''
                }`}
                required
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Processing...
              </span>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Main Checkout Component
const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street_address: '',
    apartment: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false,
  });

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: faMoneyBill,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your card',
      icon: faCreditCard,
    },
  ];

  useEffect(() => {
    fetchCartItems();
    fetchAddresses();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axiosInstance.get('/api/orders/cart/');
      if (response.data.status === 'success') {
        setCartItems(response.data.data.orderItems || []);
        setOrderId(response.data.data.orderId);
      }
    } catch (error) {
      showToast('Failed to fetch cart items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/addresses/');
      if (response.data.status === 'success') {
        setAddresses(response.data.data);
        if (response.data.data.length > 0 && !selectedAddress) {
          setSelectedAddress(response.data.data[0].id);
        }
      }
    } catch (error) {
      showToast('Failed to fetch addresses', 'error');
    }
  };

  const handlePaymentMethodSelect = (method) => {
    if (!selectedAddress) {
      showToast('Please select a delivery address first', 'error');
      return;
    }
    if (method.id === 'card' && !paymentCompleted) {
      setSelectedPaymentMethod(method);
      setShowPaymentModal(true);
    } else if (method.id === 'cod') {
      setSelectedPaymentMethod(method);
      setPaymentCompleted(false);
    }
  };

  const handlePaymentSubmit = async (paymentDetails) => {
    try {
      setProcessing(true);
      const response = await axiosInstance.post('/api/orders/process-payment/', {
        card_number: paymentDetails.card_number,
        expiry_date: paymentDetails.expiry_date,
        cvv: paymentDetails.cvv,
        amount: calculateTotal(),
        order_id: orderId
      });

      if (response.data.status === 'success') {
        setShowPaymentModal(false);
        setPaymentCompleted(true);
        showToast('Payment successful! Click Place Order to complete your purchase.', 'success');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Payment failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    if (!selectedPaymentMethod) {
      showToast('Please select a payment method', 'error');
      return;
    }

    if (selectedPaymentMethod.id === 'card' && !paymentCompleted) {
      showToast('Please complete the payment first', 'error');
      return;
    }

    try {
      setProcessing(true);
      const response = await axiosInstance.post('/api/orders/checkout/', {
        shipping_address_id: selectedAddress,
        payment_method: selectedPaymentMethod.id,
      });

      if (response.data.status === 'success') {
        showToast('Order placed successfully!', 'success');
        
        // Navigate to order success page with order details
        navigate('/order-success', {
          state: {
            orderDetails: {
              orderId: response.data.data.orderId,
              orderItems: cartItems,
              totalAmount: calculateTotal(),
              paymentMethod: selectedPaymentMethod.id === 'cod' ? 'Cash on Delivery' : 'Credit Card'
            }
          }
        });
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.product.discount_price || item.product.base_price);
      return total + (item.qty * price);
    }, 0);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/addresses/add/', newAddress);
      if (response.data.status === 'success') {
        setAddresses([...addresses, response.data.data]);
        setSelectedAddress(response.data.data.id);
        setIsAddressModalOpen(false);
        showToast('Address added successfully', 'success');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add address', 'error');
    }
  };

  const handleInputChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FontAwesomeIcon icon={faSpinner} spin className="h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ToastContainer />
      
      {/* Shipping Address Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
          <button
            onClick={() => setIsAddressModalOpen(true)}
            className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center space-x-1"
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            <span>Add New Address</span>
          </button>
        </div>

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="h-8 w-8 text-gray-400 mb-2"
              />
              <p className="text-gray-500">No addresses found</p>
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
              >
                Add New Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  selected={selectedAddress}
                  onSelect={setSelectedAddress}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="relative">
              <PaymentMethodCard
                method={method}
                selected={selectedPaymentMethod}
                onSelect={handlePaymentMethodSelect}
              />
              {method.id === 'card' && paymentCompleted && (
                <div className="absolute top-2 right-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Payment Completed
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <OrderItemCard key={item.id} item={item} />
          ))}

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Total</p>
              <p>${calculateTotal().toFixed(2)}</p>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={processing || !selectedAddress || !selectedPaymentMethod || (selectedPaymentMethod.id === 'card' && !paymentCompleted)}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Processing...
              </span>
            ) : (
              selectedPaymentMethod?.id === 'card' && !paymentCompleted
                ? 'Complete Payment to Place Order'
                : 'Place Order'
            )}
          </button>
        </div>
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Add New Address
                  </h3>
                  <div className="mt-4">
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div>
                        <label htmlFor="street_address" className="block text-sm font-medium text-gray-700">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="street_address"
                          id="street_address"
                          value={newAddress.street_address}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            id="city"
                            value={newAddress.city}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            id="state"
                            value={newAddress.state}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            name="postal_code"
                            id="postal_code"
                            value={newAddress.postal_code}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            id="country"
                            value={newAddress.country}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="is_default"
                          id="is_default"
                          checked={newAddress.is_default}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                          Set as default address
                        </label>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {loading ? 'Adding...' : 'Add Address'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={() => setIsAddressModalOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && !paymentCompleted && (
        <PaymentModal
          onClose={() => {
            setShowPaymentModal(false);
            if (!paymentCompleted) {
              setSelectedPaymentMethod(null);
            }
            setProcessing(false);
          }}
          onSubmit={handlePaymentSubmit}
          amount={calculateTotal()}
          processing={processing}
        />
      )}
    </div>
  );
};

export default Checkout;
