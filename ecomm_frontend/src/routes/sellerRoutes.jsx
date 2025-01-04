import React, { lazy } from 'react';
import SellerLayout from '../layouts/SellerLayout';
import SellerRoute from '../components/SellerRoute';

const Dashboard = lazy(() => import('../pages/seller/Dashboard'));
const RegisterSeller = lazy(() => import('../pages/seller/Register'));
const Products = lazy(() => import('../pages/seller/Products'));
const AddProduct = lazy(() => import('../pages/seller/AddProduct'));
const EditProduct = lazy(() => import('../pages/seller/EditProduct'));
const Orders = lazy(() => import('../pages/seller/Orders'));
const OrderItemDetail = lazy(() => import('../pages/seller/OrderItemDetail'));
const Approval = lazy(() => import('../pages/seller/Approval'));

export const sellerRoutes = {
  path: '/seller',
  element: <SellerLayout />,
  children: [
    {
      path: '',
      element: <SellerRoute><Dashboard /></SellerRoute>,
    },
    {
      path: 'register',
      element: <RegisterSeller />,
    },
    {
      path: 'approval',
      element: <Approval />,
    },
    {
      path: 'dashboard',
      element: <SellerRoute><Dashboard /></SellerRoute>,
    },
    {
      path: 'products',
      element: <SellerRoute><Products /></SellerRoute>,
    },
    {
      path: 'products/add',
      element: <SellerRoute><AddProduct /></SellerRoute>,
    },
    {
      path: 'products/edit/:productId',
      element: <SellerRoute><EditProduct /></SellerRoute>,
    },
    {
      path: 'orders',
      element: <SellerRoute><Orders /></SellerRoute>,
    },
    {
      path: 'orders/order-item-detail/:orderItemId',
      element: <SellerRoute><OrderItemDetail /></SellerRoute>,
    }
  ],
};
