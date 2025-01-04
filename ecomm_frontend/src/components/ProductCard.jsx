import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '../utils/helpers';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const discount = product.discount_price 
    ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
    : 0;

  return (
    <div className="relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-green-500 text-white px-1 py-1 rounded-md text-sm font-semibold">
          {discount}% Off
        </div>
      )}
      
      <Link to={`/product/${product.productId}`} className="group">
        <div className="aspect-w-1 aspect-h-1 bg-gray-200">
          {product.images && product.images[0] ? (
            <img
              src={`http://localhost:8000${product.images[0].image}`}
              alt={product.name}
              className="w-full h-full object-center object-cover group-hover:opacity-75"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
          <div className="mt-1 flex items-center">
            {product.discount_price ? (
              <>
                <span className="text-lg font-bold text-indigo-600">
                  {formatPrice(product.discount_price, 'PKR')}
                </span>
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {formatPrice(product.base_price, 'PKR')}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.base_price, 'PKR')}
              </span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="mt-1 flex items-center">
              {[...Array(5)].map((_, index) => (
                <FontAwesomeIcon
                  key={index}
                  icon={faStar}
                  className={`h-4 w-4 ${
                    index < Math.round(product.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-1 text-sm text-gray-500">
                ({product.review_count || 0})
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
