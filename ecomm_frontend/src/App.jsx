import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { mainRoutes } from './routes/mainRoutes';
import { authRoutes } from './routes/authRoutes';
import { sellerRoutes } from './routes/sellerRoutes';
import { PrivateRoute } from './components/PrivateRoute';

// Helper function to wrap routes with PrivateRoute if needed
const renderRoutes = (routes) => {
  return routes.map((route) => {
    if (route.children) {
      return (
        <Route key={route.path} path={route.path} element={route.element}>
          {renderRoutes(route.children)}
        </Route>
      );
    }
    
    // Wrap profile routes with PrivateRoute
    if (route.path.startsWith('/profile')) {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={<PrivateRoute>{route.element}</PrivateRoute>}
        />
      );
    }
    
    // Wrap cart and checkout with PrivateRoute
    if (route.path === '/cart' || route.path === '/checkout') {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={<PrivateRoute>{route.element}</PrivateRoute>}
        />
      );
    }

    return <Route key={route.path} path={route.path} element={route.element} />;
  });
};

function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {renderRoutes(mainRoutes)}
          {renderRoutes(authRoutes)}
          <Route
            path={sellerRoutes.path}
            element={sellerRoutes.element}
          >
            {renderRoutes(sellerRoutes.children)}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
