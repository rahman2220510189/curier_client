import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth'; 
import socketService from './services/socket';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Header from './components/Layout/Header';

// Admin Components
import Dashboard from './components/Admin/Dashboard';
import ParcelManagement from './components/Admin/ParcelManagement';
import UserManagement from './components/Admin/UserManagement'; 
import Reports from './components/Admin/Reports'; 

// Customer Components
import BookingForm from './components/Customer/BookingForm';
import TrackingView from './components/Customer/TrackingView';
import BookingHistory from './components/Customer/BookingHistory'; 

// Agent Components
import AssignedParcels from './components/Agent/AssignedParcels';

// Common Components
import LoadingSpinner from './components/Common/LoadingSpinner';


// Private Route Component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace={true} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the default route if role is not allowed
    return <Navigate to="/" replace={true} />; 
  }

  return children;
};

// Main App Content Component 
const AppContent = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to Socket.IO only after user is logged in
      socketService.connect();
      return () => socketService.disconnect();
    }
  }, [user]);

  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'agent':
        return '/agent/parcels';
      case 'customer':
        return '/customer/book';
      default:
        // Should not happen, but fallback to prevent crash
        return '/login';
    }
  };

  return (
    <BrowserRouter>
      {user && <Header />}
      <main className="bg-gray-50 min-h-[calc(100vh-64px)]">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track/:id?" element={<TrackingView />} /> 
          
          {/* Default/Redirect */}
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace={true} />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="max-w-7xl mx-auto px-4 py-8"><Dashboard /></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/parcels"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="max-w-7xl mx-auto px-4 py-8"><ParcelManagement /></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="max-w-7xl mx-auto px-4 py-8"><UserManagement /></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <div className="max-w-7xl mx-auto px-4 py-8"><Reports /></div>
              </PrivateRoute>
            }
          />

          {/* Customer Routes */}
          <Route
            path="/customer/book"
            element={
              <PrivateRoute allowedRoles={['customer']}>
                <div className="max-w-4xl mx-auto px-4 py-8"><BookingForm /></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/track"
            element={
              <PrivateRoute allowedRoles={['customer']}>
                <div className="max-w-4xl mx-auto px-4 py-8"><TrackingView /></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <PrivateRoute allowedRoles={['customer']}>
                <div className="max-w-7xl mx-auto px-4 py-8"><BookingHistory /></div>
              </PrivateRoute>
            }
          />

          {/* Agent Routes */}
          <Route
            path="/agent/parcels"
            element={
              <PrivateRoute allowedRoles={['agent']}>
                <div className="max-w-7xl mx-auto px-4 py-8"><AssignedParcels /></div>
              </PrivateRoute>
            }
          />
          
          {/* 404 Catch-all */}
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;