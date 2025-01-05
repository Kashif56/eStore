import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaSearch, FaFilter, FaFileDownload } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import { formatCurrency } from '../../services/dashboardService';
import Toast from '../../components/Toast';

const PayoutStatusBadge = ({ status }) => {
  const styles = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status.toLowerCase()]}`}>
      {status}
    </span>
  );
};

const PayoutTable = ({ payouts, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border-b border-gray-200 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!payouts.length) {
    return (
      <div className="text-center py-12">
        <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No payouts</h3>
        <p className="mt-1 text-sm text-gray-500">No payout records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payout ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order Item
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payouts.map((payout) => (
            <tr key={payout.payoutId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {payout.payoutId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {payout.orderItem.orderItemId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(payout.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <PayoutStatusBadge status={payout.is_paid ? 'Paid' : 'Pending'} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(payout.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Payouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalPaid: 0,
    count: 0
  });

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/seller-payouts/');
      if (response?.data?.status === 'success') {
        setPayouts(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (err) {
      setToast({
        message: 'Failed to fetch payouts',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (payoutData) => {
    const stats = payoutData.reduce((acc, payout) => {
      if (payout.is_paid) {
        acc.totalPaid += payout.amount;
      } else {
        acc.totalPending += payout.amount;
      }
      acc.count += 1;
      return acc;
    }, { totalPending: 0, totalPaid: 0, count: 0 });

    setStats(stats);
  };

  const filteredPayouts = payouts
    .filter(payout => {
      if (filterStatus === 'all') return true;
      return filterStatus === 'paid' ? payout.is_paid : !payout.is_paid;
    })
    .filter(payout =>
      payout.payoutId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.orderItem.orderItemId.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="flex-1 ml-64 p-8 bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and track all your payment transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-800">
                <FaMoneyBillWave className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
                <FaMoneyBillWave className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalPending)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                <FaMoneyBillWave className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.count}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Payout ID or Order ID"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
              <div className="flex space-x-4">
                <select
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FaFileDownload className="mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <PayoutTable payouts={filteredPayouts} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default Payouts;
