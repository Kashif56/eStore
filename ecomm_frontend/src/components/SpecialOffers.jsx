import React from 'react';
import { motion } from 'framer-motion';

const SpecialOffers = () => {
  const offers = [
    {
      id: 1,
      name: 'Summer Collection',
      description: 'Get up to 50% off on our latest summer collection. Fresh styles for the season.',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      discount: 50,
      soldPercentage: 75,
      soldCount: 100,
      price: 19.99,
      oldPrice: 29.99,
      timeLeft: '24h',
    },
    {
      id: 2,
      name: 'Tech Gadgets',
      description: 'Extra 20% off on premium gadgets. Limited stock available.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1099&q=80',
      discount: 20,
      soldPercentage: 50,
      soldCount: 50,
      price: 99.99,
      oldPrice: 119.99,
      timeLeft: '24h',
    },
  ];

  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Special Offers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Exclusive deals you don't want to miss</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col"
            >
              <div className="relative h-[250px] overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                  {offer.discount}% OFF
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">{offer.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{offer.description}</p>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center mb-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${offer.soldPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 ml-3">
                      {offer.soldCount} sold
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900">${offer.price}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">${offer.oldPrice}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Ends in {offer.timeLeft}
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Shop Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
