import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import store from './store';
import queryClient from './api/queryClient';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { FullPageLoader } from './components/Loader';
import { authService } from './services/authService';
import { loginSuccess, logoutSuccess, setLoading } from './store/authSlice';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const BlogCreateEdit = lazy(() => import('./pages/BlogCreateEdit'));
const Profile = lazy(() => import('./pages/Profile'));
const Categories = lazy(() => import('./pages/Categories'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));

// A helper component to check for user login session on application boot
const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authService.getMe();
        if (response.success && response.data) {
          dispatch(loginSuccess(response.data));
        } else {
          dispatch(logoutSuccess());
        }
      } catch {
        dispatch(logoutSuccess());
      } finally {
        dispatch(setLoading(false));
      }
    };

    initializeAuth();

    // Listen for global custom logout events (e.g. from axios token refresh failure)
    const handleGlobalLogout = () => {
      dispatch(logoutSuccess());
    };

    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout);
    };
  }, [dispatch]);

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <BrowserRouter>
            <AuthInitializer>
              <Suspense fallback={<FullPageLoader />}>
                <Routes>
                  {/* Main layouts routes */}
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="verify-email" element={<EmailVerification />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="blog/:slug" element={<BlogDetail />} />
                    <Route path="profile/:username" element={<Profile />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="search" element={<SearchPage />} />
                    
                    {/* Protected Routes */}
                    <Route
                      path="write"
                      element={
                        <ProtectedRoute>
                          <BlogCreateEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="edit/:id"
                      element={
                        <ProtectedRoute>
                          <BlogCreateEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="bookmarks"
                      element={
                        <ProtectedRoute>
                          <BookmarksPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Restricted Routes */}
                    <Route
                      path="admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                  </Route>
                </Routes>
              </Suspense>
            </AuthInitializer>
          </BrowserRouter>
        </ErrorBoundary>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
