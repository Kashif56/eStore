import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import CartPage from '../pages/CartPage';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import MainLayout from '../layouts/MainLayout';

export const mainRoutes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <Home />
      },
      {
        path: "products",
        element: <Products />
      },
      {
        path: "product/:productId",
        element: <ProductDetail />
      },
      {
        path: "cart",
        element: <CartPage />
      },
      {
        path: "checkout",
        element: <Checkout />
      },
      {
        path: "order-success",
        element: <OrderSuccess />
      }
    ]
  }
];
