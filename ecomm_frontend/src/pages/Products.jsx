import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faSpinner,
  faSort,
  faTimes,
  faMoneyBill
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../utils/axiosInstance';
import Toast from '../components/Toast';
import ProductList from '../components/ProductList';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('categories') ? searchParams.get('categories').split(',') : []
  );
  const [priceRange, setPriceRange] = useState({ 
    min: searchParams.get('min_price') || '', 
    max: searchParams.get('max_price') || '' 
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState(null);
  const [categories, setCategories] = useState([]);
  const [variantOptions, setVariantOptions] = useState({});
  const [selectedVariants, setSelectedVariants] = useState(
    searchParams.get('variants') 
      ? Object.fromEntries(
          searchParams.get('variants')
            .split(';')
            .map(v => {
              const [name, values] = v.split(':');
              return [name, values.split(',')];
            })
        )
      : {}
  );

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // Handle categories
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    } else {
      params.delete('categories');
    }
    
    // Handle price range
    if (priceRange.min) {
      params.set('min_price', priceRange.min);
    } else {
      params.delete('min_price');
    }
    if (priceRange.max) {
      params.set('max_price', priceRange.max);
    } else {
      params.delete('max_price');
    }
    
    // Handle sort
    if (sortBy !== 'newest') {
      params.set('sort', sortBy);
    } else {
      params.delete('sort');
    }
    
    // Handle variant filters
    const variantParams = Object.entries(selectedVariants)
      .filter(([_, values]) => values && values.length > 0)
      .map(([name, values]) => `${name}:${values.join(',')}`)
      .join(';');
    
    if (variantParams) {
      params.set('variants', variantParams);
    } else {
      params.delete('variants');
    }
    
    setSearchParams(params);
  }, [selectedCategories, priceRange, sortBy, selectedVariants]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
    fetchVariantOptions();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      const response = await axiosInstance.get(`/api/products/list/?${params.toString()}`);
      
      if (response.data?.status === 'success') {
        setProducts(response.data.data || []);
      } else {
        setProducts([]);
        setToast({
          type: 'error',
          message: 'Failed to load products'
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setToast({
        type: 'error',
        message: 'Error loading products'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/products/categories/');
      if (response.data?.status === 'success') {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setToast({
        type: 'error',
        message: 'Failed to load categories'
      });
    }
  };

  const fetchVariantOptions = async () => {
    try {
      const response = await axiosInstance.get('/api/products/variants/');
      if (response.data?.status === 'success') {
        // Filter out variants with no values
        const filteredVariants = Object.fromEntries(
          Object.entries(response.data.data || {})
            .filter(([_, values]) => values && values.length > 0)
        );
        setVariantOptions(filteredVariants);
      }
    } catch (error) {
      console.error('Error fetching variant options:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId.toString())) {
        return prev.filter(id => id !== categoryId.toString());
      }
      return [...prev, categoryId.toString()];
    });
  };

  const handleVariantChange = (variantName, value) => {
    setSelectedVariants(prev => {
      const currentValues = prev[variantName] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      // Remove the variant key if there are no values selected
      const updatedVariants = {
        ...prev,
        [variantName]: newValues
      };
      
      if (newValues.length === 0) {
        delete updatedVariants[variantName];
      }
      
      return updatedVariants;
    });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (priceRange.min) params.set('min_price', priceRange.min);
    if (priceRange.max) params.set('max_price', priceRange.max);
    setSearchParams(params);
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams);
    const searchQuery = params.get('search'); // Preserve search query
    params.delete('categories');
    params.delete('min_price');
    params.delete('max_price');
    params.delete('sort');
    params.delete('variants');
    if (searchQuery) params.set('search', searchQuery);
    setSearchParams(params);
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setSelectedVariants({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="popular">Best Selling</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Categories */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id.toString())}
                      onChange={() => handleCategoryChange(category.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {category.name} ({category.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Variant Filters */}
            {Object.entries(variantOptions).map(([variantName, values]) => (
              <div key={variantName} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 capitalize">
                  {variantName}
                </h3>
                <div className="space-y-2">
                  {values.map(value => (
                    <label key={value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(selectedVariants[variantName] || []).includes(value)}
                        onChange={() => handleVariantChange(variantName, value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {value}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Price Range */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FontAwesomeIcon icon={faMoneyBill} className="text-indigo-500 mr-2" />
                Price Range
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Min Price</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rs</span>
                    </div>
                    <input
                      type="number"
                      name="min"
                      value={priceRange.min}
                      onChange={(e) => {
                        handlePriceChange(e);
                        applyPriceFilter();
                      }}
                      placeholder="0"
                      min="0"
                      className="block w-full pl-10 pr-3 py-1 text-base rounded-md border border-gray-200 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Max Price</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Rs</span>
                    </div>
                    <input
                      type="number"
                      name="max"
                      value={priceRange.max}
                      onChange={(e) => {
                        handlePriceChange(e);
                        applyPriceFilter();
                      }}
                      placeholder="Any"
                      min="0"
                      className="block w-full pl-10 pr-3 py-1 text-gray-900 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Filters
            </button>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FontAwesomeIcon icon={faSpinner} className="text-indigo-600 text-4xl animate-spin" />
              </div>
            ) : (
              <ProductList products={products} />
            )}
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Products;
