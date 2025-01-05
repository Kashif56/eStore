import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faHeart,
  faStore,
  faTag,
  faBox
} from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '../utils/helpers';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const discount = product.discount_price 
    ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-medium">
            <FontAwesomeIcon icon={faTag} className="h-3 w-3" />
            <span>{discount}% Off</span>
          </div>
        </div>
      )}
      
      <Link to={`/product/${product.productId}`}>
        <div className="relative aspect-w-1 aspect-h-1 bg-gray-100">
          {product.images && product.images[0] ? (
            <img
              src={`http://localhost:8000${product.images[0].image}`}
              alt={product.name}
              className="w-full h-full object-center object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <FontAwesomeIcon icon={faBox} className="h-16 w-16 text-gray-400" />
            </div>
          )}
          {/* Stock badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium px-4 py-2 bg-red-500 rounded-lg">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Seller info */}
          {product.seller && (
            <div className="flex items-center space-x-2 mb-2">
              <FontAwesomeIcon icon={faStore} className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 hover:text-indigo-600 truncate">
                {product.seller.business_name}
              </span>
            </div>
          )}

          {/* Product name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[20px]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mt-2 flex items-center">
            {[...Array(5)].map((_, index) => (
              <FontAwesomeIcon
                key={index}
                icon={faStar}
                className={`h-3 w-3 ${
                  index < Math.round(product.rating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-200'
                }`}
              />
            ))}
            {product.rating > 0 && (
              <span className="ml-1 text-xs text-gray-600 font-medium">
                {Number(product.rating).toFixed(1)}
              </span>
            )}
            <span className="ml-1 text-xs text-gray-500">
              {product.review_count > 0 
                ? `(${product.review_count} ${product.review_count === 1 ? 'review' : 'reviews'})`
                : '(No reviews yet)'}
            </span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-baseline space-x-2">
            {product.discount_price ? (
              <>
                <span className="text-lg font-bold text-indigo-600">
                  {formatPrice(product.discount_price, 'PKR')}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.base_price, 'PKR')}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.base_price, 'PKR')}
              </span>
            )}
          </div>

          {/* Stock info */}
          <div className="mt-2">
            {product.stock > 0 ? (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                In Stock ({product.stock})
              </span>
            ) : (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
