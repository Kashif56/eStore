import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

const ReviewSection = ({ reviews = [], productId }) => {
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    created_at: null,
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  // get current date and time
  const c = new Date();
  const d = c.getDate();
  const m = c.getMonth() + 1;
  const y = c.getFullYear();
  const h = c.getHours();
  const min = c.getMinutes();
  const s = c.getSeconds();
  const cDate = `${d}/${m}/${y} ${h}:${min}:${s}`;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    // Add API call to submit review
    fetch(`http://localhost:8000/api/products/add-review/${productId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(newReview),
    })
      .then(response => response.json())
      .then(data => {
        // Handle success (maybe refresh reviews)
        setNewReview({ rating: data.rating, comment: data.comment, created_at: data.created_at });
      })
      .catch(error => console.error('Error submitting review:', error));
  };

  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const ratingValue = index + 1;
      return (
        <FontAwesomeIcon
          key={index}
          icon={ratingValue <= (interactive ? (hoveredRating || newReview.rating) : rating) ? faStarSolid : faStarRegular}
          className={`h-5 w-5 ${
            interactive 
              ? 'cursor-pointer text-yellow-400 hover:text-yellow-500' 
              : 'text-yellow-400'
          }`}
          onMouseEnter={() => interactive && setHoveredRating(ratingValue)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          onClick={() => interactive && setNewReview(prev => ({ ...prev, rating: ratingValue }))}
        />
      );
    });
  };

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold mb-8">Customer Reviews</h3>

      {/* Review Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h4 className="text-lg font-semibold mb-4">Write a Review</h4>
        <form onSubmit={handleSubmitReview}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex space-x-1">
              {renderStars(newReview.rating, true)}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              rows="4"
              className="w-full border-gray-500 ring-1 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={newReview.comment}
              placeholder=' Please Type your Review'
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            onClick={handleSubmitReview}
          >
            Submit Review
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex space-x-1">
                {renderStars(review.rating)}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
            <p className="mt-2 text-sm text-gray-600">By {review.user_name}</p>
          </div>
        ))}

        {reviews.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
