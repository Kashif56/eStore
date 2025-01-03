import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faBriefcase, 
  faMapMarkerAlt,
  faEllipsisV,
  faCheck,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../utils/axiosInstance';
import Toast from '../../components/Toast';
import AddressModal from '../../components/AddressModal';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/addresses/');
      if (response.data.status === 'success') {
        setAddresses(response.data.data);
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load addresses'
      });
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await axiosInstance.post(`/api/auth/addresses/${addressId}/set-default/`);
      if (response.data.status === 'success') {
        setAddresses(prevAddresses => 
          prevAddresses.map(addr => ({
            ...addr,
            is_default: addr.id === addressId
          }))
        );
        setToast({
          type: 'success',
          message: 'Default address updated successfully'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update default address'
      });
    }
  };

  const handleAddAddress = (newAddress) => {
    if (newAddress.is_default) {
      setAddresses(prevAddresses => 
        [...prevAddresses.map(addr => ({
          ...addr,
          is_default: false
        })), newAddress]
      );
    } else {
      setAddresses(prevAddresses => [...prevAddresses, newAddress]);
    }
    setShowAddressModal(false);
    setToast({
      type: 'success',
      message: 'Address added successfully'
    });
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await axiosInstance.delete(`/api/auth/addresses/${addressId}/`);
      if (response.data.status === 'success') {
        setAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== addressId));
        setShowDeleteConfirm(false);
        setSelectedAddress(null);
        setToast({
          type: 'success',
          message: 'Address deleted successfully'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete address'
      });
    }
  };

  const handleEditAddress = async (updatedAddress) => {
    try {
      const response = await axiosInstance.put(`/api/auth/addresses/${updatedAddress.id}/`, updatedAddress);
      if (response.data.status === 'success') {
        setAddresses(prevAddresses => 
          prevAddresses.map(addr => 
            addr.id === updatedAddress.id ? response.data.data : addr
          )
        );
        setShowEditModal(false);
        setSelectedAddress(null);
        setToast({
          type: 'success',
          message: 'Address updated successfully'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update address'
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 select-none">Addresses</h3>
            <p className="mt-1 text-sm text-gray-500 select-none">
              Manage your shipping and billing addresses.
            </p>
          </div>
          <button
            onClick={() => setShowAddressModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 select-none"
          >
            Add New Address
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${
                address.is_default ? 'ring-2 ring-indigo-500' : 'border border-gray-200'
              }`}
            >
              {/* Status Badge */}
              {address.is_default && (
                <div className="absolute -top-2 -right-2 bg-indigo-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                  <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                  Default
                </div>
              )}

              {/* Address Type Icon */}
              <div className="absolute top-4 left-4">
                <div className={`p-2 rounded-full ${
                  address.is_default ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <FontAwesomeIcon 
                    icon={address.address_type === 'home' ? faHome : address.address_type === 'work' ? faBriefcase : faMapMarkerAlt} 
                    className="h-5 w-5"
                  />
                </div>
              </div>

              {/* Actions Dropdown */}
              <div className="absolute top-4 right-4">
                <div className="relative inline-block text-left">
                  <div className="group">
                    <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                      <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4 text-gray-500" />
                    </button>
                    <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAddress(address);
                            setShowEditModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAddress(address);
                            setShowDeleteConfirm(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Content */}
              <div className="p-6 pt-16">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {address.address_type} Address
                    </p>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                      {address.street_address}
                      {address.apartment && `, ${address.apartment}`}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Address</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedAddress(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAddress(selectedAddress.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal for Add/Edit */}
      <AddressModal
        isOpen={showAddressModal || showEditModal}
        onClose={() => {
          setShowAddressModal(false);
          setShowEditModal(false);
          setSelectedAddress(null);
        }}
        onAddressAdded={handleAddAddress}
        onAddressUpdated={handleEditAddress}
        address={selectedAddress}
        isEditing={showEditModal}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default Addresses;
