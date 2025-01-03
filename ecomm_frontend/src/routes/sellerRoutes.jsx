import React, { lazy } from 'react';
import SellerLayout from '../layouts/SellerLayout';

const Dashboard = lazy(() => import('../pages/seller/Dashboard'));
const RegisterSeller = lazy(() => import('../pages/seller/RegisterSeller'));
const Products = lazy(() => import('../pages/seller/Products'));
const AddProduct = lazy(() => import('../pages/seller/AddProduct'));
const EditProduct = lazy(() => import('../pages/seller/EditProduct'));

export const sellerRoutes = {
  path: '/seller',
  element: <SellerLayout />,
  children: [
    {
      path: '',
      element: <Dashboard />,
    },
    {
      path: 'register',
      element: <RegisterSeller />,
    },
    {
      path: 'dashboard',
      element: <Dashboard />,
    },
    {
      path: 'products',
      element: <Products />,
    },
    {
      path: 'products/add',
      element: <AddProduct />,
    },
    {
      path: 'products/edit/:productId',
      element: <EditProduct />,
    }
  ],
};
