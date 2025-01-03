import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import Profile from '../pages/auth/Profile';
import Orders from '../pages/auth/Orders';
import OrderItemDetail from '../pages/auth/OrderItemDetail';
import Addresses from '../pages/auth/Addresses';
import ProfileLayout from '../layouts/ProfileLayout';

export const authRoutes = [
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/profile",
    element: <ProfileLayout />,
    children: [
      {
        path: "",
        element: <Profile />
      },
      {
        path: "addresses",
        element: <Addresses />
      },
      {
        path: "orders",
        element: <Orders />
      },
      {
        path: "orders/order-item-detail/:orderItemId",
        element: <OrderItemDetail />
      },
      {
        path: "wishlist",
        element: <Profile /> // You'll need to create a separate Wishlist component
      },
      {
        path: "settings",
        element: <Profile /> // You'll need to create a separate Settings component
      }
    ]
  }
];
