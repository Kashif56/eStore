import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Profile from './pages/auth/Profile';
import Orders from './pages/auth/Orders.jsx';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess';


import { Provider } from 'react-redux';
import store from './store/store.js';

function App() {
  return (
    <Provider store={store}>
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path='profile/user/orders' element={<Orders />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
          
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </Provider>
  );
}

export default App;
