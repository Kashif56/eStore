import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { 
  MdTrendingUp, 
  MdShoppingCart, 
  MdAttachMoney,
  MdMoreVert,
  MdAccessTime,
  MdRefresh
} from 'react-icons/md';
import { 
  FaBox, 
  FaShoppingCart as FaShoppingCartAlt, 
  FaMoneyBillWave, 
  FaUserClock, 
  FaMoneyCheckAlt, 
  FaMoneyBill 
} from 'react-icons/fa';
import { 
  fetchDashboardStats, 
  fetchSalesGraphData,
  formatCurrency,
  formatNumber,
  formatTrend,
  formatDate,
  fetchTopProducts
} from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../../utils/axiosInstance';


const TimeFilter = ({ isOpen, onClose, onSelect, currentPeriod }) => {
  const options = ['daily', 'monthly', 'yearly', 'all'];
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 top-8 mt-2 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-[100] transform transition-all duration-200 origin-top-right">
      <div className="py-1" role="menu">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => {
              onSelect(option);
              onClose();
            }}
            className={`block w-full px-4 py-2 text-sm text-left capitalize transition-colors duration-200
              ${option === currentPeriod 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            role="menuitem"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md relative animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
    <div className="space-y-4">
      <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="flex justify-between items-center">
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  </div>
);

const StatsCard = ({ title, value, icon, trend, period, onPeriodChange, loading, onRefresh }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatPeriod = (period) => {
    switch (period) {
      case 'daily': return 'Today';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
      case 'all': return 'All Time';
      default: return period;
    }
  };

  if (loading) return <CardSkeleton />;

  const trendValue = formatTrend(trend);
  const formattedValue = title === 'Total Orders' ? formatNumber(value) : formatCurrency(value);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
        {trendValue && (
          <span
            className={`text-sm font-medium ${
              Number(trendValue) >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {Number(trendValue) >= 0 ? '+' : ''}{trendValue}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
        {title}
      </h3>
      <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-2">
        {formattedValue}
      </p>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded transition-colors duration-200">
          <MdAccessTime size={14} className="text-gray-500 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-300">{formatPeriod(period)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
            title="Refresh data"
          >
            <MdRefresh size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
            >
              <MdMoreVert size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
            <TimeFilter
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onSelect={onPeriodChange}
              currentPeriod={period}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const GraphSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
    <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
);

const PayoutStatsCard = ({ title, value, count, icon, color, loading }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} bg-opacity-10 dark:bg-opacity-20 mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(value)}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{count} Payouts</p>
      </div>
    </div>
    {loading && (
      <div className="animate-pulse mt-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    )}
  </div>
);

const TopProductCard = ({ product, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={`http://localhost:8000${product.images?.[0]?.image || '/placeholder-product.png'}`}
            alt={product.name}
            className="w-25 h-16 rounded-lg object-cover"
          />
          <div>
            <h3
             
              className="font-medium text-gray-900 dark:text-white "
            >
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{product.sold} Sold</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {product.discount_price ? formatCurrency(product.discount_price) : formatCurrency(product.base_price)}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(product.base_price * product.sold)}
          </p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    sales: null,
    orders: null,
    average: null
  });
  const [cardPeriods, setCardPeriods] = useState({
    sales: 'monthly',
    orders: 'monthly',
    average: 'monthly'
  });
  const [cardLoading, setCardLoading] = useState({
    sales: true,
    orders: true,
    average: true
  });
  const [graphPeriod, setGraphPeriod] = useState('monthly');
  const [isGraphMenuOpen, setIsGraphMenuOpen] = useState(false);
  const [graphLoading, setGraphLoading] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [topProductsLoading, setTopProductsLoading] = useState(true);
  const [pendingPayout, setPendingPayout] = useState({
    pendingTotal: 0,
    pendingPayoutCount: 0
  });
  const [paidPayout, setPaidPayout] = useState({
    paidTotal: 0,
    paidPayoutCount: 0
  });
  const [payoutStatsLoading, setPayoutStatsLoading] = useState(true);

  const fetchCardStats = async (card, period) => {
    try {
      setCardLoading(prev => ({ ...prev, [card]: true }));
      const data = await fetchDashboardStats(period || cardPeriods[card]);
      setStats(prev => ({ ...prev, [card]: data }));
      setError(null);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.error === 'User does not have a seller profile') {

        navigate('/seller/register');
      } else {
        setError(err.message);
        console.error(`Error fetching ${card} stats:`, err);
      }
    } finally {
      setCardLoading(prev => ({ ...prev, [card]: false }));
    }
  };

  const fetchGraphData = async (period) => {
    try {
      setGraphLoading(true);
      const response = await fetchSalesGraphData(period || graphPeriod);
      if (response?.status === 'success' && Array.isArray(response.data)) {
        setGraphData(response.data);
      } else {
        setGraphData([]);
      }
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/seller/register');
      } else {
        setError(`Error fetching graph data: ${err.message}`);
        console.error('Error fetching graph data:', err);
        setGraphData([]);
      }
    } finally {
      setGraphLoading(false);
    }
  };

  const fetchTopProductsData = async (period) => {
    try {
      setTopProductsLoading(true);
      const response = await fetchTopProducts(period || graphPeriod);
      if (response?.status === 'success' && Array.isArray(response.data)) {
        setTopProducts(response.data);
        console.log(response.data);
      } else {
        setTopProducts([]);
      }
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/seller/register');
      } else {
        setError(`Error fetching top products: ${err.message}`);
        console.error('Error fetching top products:', err);
        setTopProducts([]);
      }
    } finally {
      setTopProductsLoading(false);
    }
  };

  const fetchPayoutStatsData = async () => {
    try {
      setPayoutStatsLoading(true);
      const response = await axiosInstance.get('/api/seller-payout-stats/');
      
      if (response?.data?.status === 'success' && response.data?.data) {
        setPendingPayout({pendingTotal: response.data.data.pendingTotal, pendingPayoutCount: response.data.data.pendingCount});
        setPaidPayout({paidTotal: response.data.data.paidTotal, paidPayoutCount: response.data.data.paidCount});
      } else {
        setPendingPayout(0, 0);
        setPaidPayout(0, 0);
      }
      setError(null);
    } catch (err) {
      setError(`Error fetching payout stats: ${err.message}`);
      console.error('Error fetching payout stats:', err);
      setPendingPayout(0, 0);
      setPaidPayout(0, 0);
    } finally {
      setPayoutStatsLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchCardStats('sales'),
          fetchCardStats('orders'),
          fetchCardStats('average'),
          fetchGraphData(),
          fetchTopProductsData(),
          fetchPayoutStatsData()
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchAllData();
  }, []);

  const handleCardPeriodChange = (card, period) => {
    setCardPeriods(prev => ({ ...prev, [card]: period }));
    fetchCardStats(card, period);
  };

  const handleGraphPeriodChange = (period) => {
    setGraphPeriod(period);
    fetchGraphData();
  };

  if (error) return (
    <div className="text-red-500 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
      Error: {error}
    </div>
  );

  return (
    <div className="pl-64 pt-16 min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Seller Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Sales"
            value={stats.sales?.stats.total_sales}
            icon={<MdTrendingUp size={24} />}
            trend={stats.sales?.trends.sales_trend}
            period={cardPeriods.sales}
            onPeriodChange={(period) => handleCardPeriodChange('sales', period)}
            loading={cardLoading.sales}
            onRefresh={() => fetchCardStats('sales')}
          />
          <StatsCard
            title="Total Orders"
            value={stats.orders?.stats.total_orders}
            icon={<MdShoppingCart size={24} />}
            trend={stats.orders?.trends.orders_trend}
            period={cardPeriods.orders}
            onPeriodChange={(period) => handleCardPeriodChange('orders', period)}
            loading={cardLoading.orders}
            onRefresh={() => fetchCardStats('orders')}
          />
          <StatsCard
            title="Average Order Value"
            value={stats.average?.stats.average_order}
            icon={<MdAttachMoney size={24} />}
            trend={stats.average?.trends.average_trend}
            period={cardPeriods.average}
            onPeriodChange={(period) => handleCardPeriodChange('average', period)}
            loading={cardLoading.average}
            onRefresh={() => fetchCardStats('average')}
          />

          {/* Payout Stats */}
          <PayoutStatsCard
            title="Pending Payouts"
            value={pendingPayout.pendingTotal}
            count={pendingPayout.pendingPayoutCount}
            icon={<FaMoneyCheckAlt size={24} />}
            color="text-purple-500"
            loading={payoutStatsLoading}
          />
          <PayoutStatsCard
            title="Paid Payouts"
            value={paidPayout.paidTotal}
            count={paidPayout.paidPayoutCount}
            icon={<FaMoneyBill size={24} />}
            color="text-indigo-500"
            loading={payoutStatsLoading}
          />
        </div>

        {/* Sales Graph */}
        {graphLoading ? (
          <GraphSkeleton />
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transform transition-all duration-200 hover:shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Sales Overview</h2>
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-600 dark:text-blue-400">
                  <MdAccessTime size={14} />
                  <span className="capitalize">{graphPeriod}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchGraphData}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                  title="Refresh data"
                >
                  <MdRefresh size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsGraphMenuOpen(!isGraphMenuOpen)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                  >
                    <MdMoreVert size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>
                  <TimeFilter
                    isOpen={isGraphMenuOpen}
                    onClose={() => setIsGraphMenuOpen(false)}
                    onSelect={handleGraphPeriodChange}
                    currentPeriod={graphPeriod}
                  />
                </div>
              </div>
            </div>
            {!Array.isArray(graphData) || graphData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No Sales Data Available</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Start selling to see your sales graph here
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={graphData}
                    onMouseMove={(e) => {
                      if (e.activeTooltipIndex !== undefined) {
                        setSelectedDataPoint(graphData[e.activeTooltipIndex]);
                      }
                    }}
                    onMouseLeave={() => setSelectedDataPoint(null)}
                  >
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(date) => formatDate(date, graphPeriod)}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#F9FAFB',
                        border: 'none',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [formatCurrency(value), 'Sales']}
                      labelFormatter={(date) => formatDate(date, graphPeriod)}
                      animationDuration={200}
                    />
                    {selectedDataPoint && (
                      <ReferenceLine
                        x={selectedDataPoint.date}
                        stroke="#3B82F6"
                        strokeDasharray="3 3"
                      />
                    )}
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3B82F6" 
                      fill="url(#salesGradient)"
                      strokeWidth={2}
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Top Sold Products */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transform transition-all duration-200 hover:shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Top Sold Products</h2>
            <button
              onClick={fetchTopProductsData}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              title="Refresh data"
            >
              <MdRefresh size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {topProductsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                  <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          ) : !Array.isArray(topProducts) || topProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No Products Available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Add products to your store to see them listed here
              </p>
              <button
                onClick={() => navigate('/seller/products/add')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <TopProductCard
                  key={index}
                  product={product}
                  loading={topProductsLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
