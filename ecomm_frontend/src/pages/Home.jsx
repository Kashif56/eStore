import React from 'react';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import BestSellers from '../components/BestSellers';
import SpecialOffers from '../components/SpecialOffers';
import Newsletter from '../components/Newsletter';
import BrandShowcase from '../components/BrandShowcase';
import Testimonials from '../components/Testimonials';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add margin-top to account for fixed navbar */}
      <div className="pt-16">
        <Hero />
        
        {/* Main content with proper spacing */}
        <main>
          {/* Light sections */}
          <div className="bg-white">
            <FeaturedCategories />
          </div>

          {/* Gray sections */}
          <div className="bg-gray-50">
            <BestSellers />
          </div>

          {/* White sections */}
          <div className="bg-white">
            <SpecialOffers />
          </div>

          {/* Newsletter with its own background */}
          <Newsletter />

          {/* Gray sections */}
          <div className="bg-gray-50">
            <BrandShowcase />
          </div>

          {/* White sections */}
          <div className="bg-white">
            <Testimonials />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
