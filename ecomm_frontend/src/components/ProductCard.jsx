import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';

const ProductCard = ({ product }) => {
 

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product.productId}`}>
        <div className="relative">
          <img
            src={'http://localhost:8000/' + product.images[0].image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {product.discount_price && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-green-500 text-white text-xs font-semibold shadow">
              Saved Rs. {product.base_price - product.discount_price}
            </div>
          )}
          <div className="absolute top-2 right-2">
            <button className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100">
              <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.productId}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600">{product.name}</h3>
        </Link>
      
        
        <div className="mt-3 flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-lg font-bold text-gray-900">
              Rs. {product.discount_price ? product.discount_price : product.base_price}
            </span>
            {product.discount_price && (
              <span className="line-through text-gray-500">
                Rs. {product.base_price}
              </span>
            )}
          </div>
          
        </div>



      </div>
    </div>
  );
};

export default ProductCard;
