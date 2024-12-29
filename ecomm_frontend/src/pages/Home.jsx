import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductList from '../components/ProductList';
import { useSelector } from 'react-redux';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/products/list/');
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  return (
    <div>
      <Hero />
      <div className="py-12 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
        <ProductList products={products} />
      </div>
    </div>
  );
};

export default Home;
