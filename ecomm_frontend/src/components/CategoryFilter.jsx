import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

const CategoryFilter = ({ categories = [], selectedCategories = [], onCategoryChange }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-800">
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center">
            <input
              type="checkbox"
              id={`category-${category.id}`}
              checked={selectedCategories.includes(category.id)}
              onChange={() => onCategoryChange && onCategoryChange(category.id)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor={`category-${category.id}`}
              className="ml-2 text-sm text-gray-700"
            >
              {category.name}
              {category.count && (
                <span className="ml-1 text-gray-500">({category.count})</span>
              )}
            </label>
          </div>
        ))}
      </div>

      {/* Price Range Filter */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Price Range</h3>
          <FaChevronDown className="h-4 w-4 text-gray-500" />
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <input
              type="number"
              placeholder="Min"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200">
            Apply
          </button>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center">
              <input
                type="checkbox"
                id={`rating-${rating}`}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={`rating-${rating}`} className="ml-2 text-sm text-gray-700">
                {rating} Stars & Up
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
