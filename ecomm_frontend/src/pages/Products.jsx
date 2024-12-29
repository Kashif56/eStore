import React, { useState } from 'react';
import ProductList from '../components/ProductList';
import CategoryFilter from '../components/CategoryFilter';

const Products = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);


  // Sample categories - replace with your actual categories
  const categories = [
    { id: 1, name: "Electronics", count: 150 },
    { id: 2, name: "Clothing", count: 200 },
    { id: 3, name: "Books", count: 100 },
    { id: 4, name: "Home & Garden", count: 80 },
  ];

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
          />
        </div>
        <div className="w-full md:w-3/4">
          <h1 className="text-3xl font-bold mb-6">All Products</h1>
          <ProductList products={sampleProducts} />
        </div>
      </div>
    </div>
  );
};

export default Products;
