import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store.js';
import { mainRoutes } from './routes/mainRoutes';
import { authRoutes } from './routes/authRoutes';
import { sellerRoutes } from './routes/sellerRoutes';
import { Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  const renderRoutes = (routes) => {
    return routes.map((route) => {
      if (route.children) {
        return (
          <Route key={route.path} path={route.path} element={route.element}>
            {renderRoutes(route.children)}
          </Route>
        );
      }
      return (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      );
    });
  };

  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {renderRoutes(mainRoutes)}
              {renderRoutes(authRoutes)}
              <Route
                path="/seller/*"
                element={
                  <PrivateRoute>
                    {sellerRoutes.element}
                  </PrivateRoute>
                }
              >
                {sellerRoutes.children.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
