import React, { useEffect } from 'react'; // useEffect is needed at the top level
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'; // useNavigate is needed at the top level
import { AppProvider, useAppContext } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProgressPage from './pages/ProgressPage';
import NotesPage from './pages/NotesPage';
import SettingsPage from './pages/SettingsPage';
import CoursePage from './pages/CoursePage';
import LoginPage from './pages/Auth/LoginPage';

// This component will handle the conditional rendering and redirection logic
function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { userProfile, appDataLoading } = useAppContext();
  const location = useLocation();

  // Show a loading screen while authentication or app data is loading
  if (authLoading || appDataLoading) {
    return <div>Loading application...</div>; // You can replace this with a more sophisticated loading spinner
  }

  // If the user is authenticated and is at the root path, redirect them to the dashboard or welcome page
  if (isAuthenticated && location.pathname === '/') {
    if (userProfile.name) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/welcome" replace />;
    }
  }

  // If the user is not authenticated and is trying to access a protected route, redirect them to the login page
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/welcome') {
    return <Navigate to="/login" replace />;
  }

  // Once loading is complete, render the actual routes
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Navigate to="/login" replace />} /> {/* Redirect /register to /login */}
      <Route path="/welcome" element={<WelcomePage />} /> {/* Explicitly define welcome route */}

      {/* Protected Routes - these will only be accessible if isAuthenticated is true */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/project-details"
        element={
          <ProtectedRoute>
            <Layout><ProjectDetailsPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Layout><ProgressPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Layout><NotesPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout><SettingsPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/course"
        element={
          <ProtectedRoute>
            <Layout><CoursePage /></Layout>
          </ProtectedRoute>
        }
      />
      {/* Fallback for any unmatched routes - redirects to dashboard if authenticated, otherwise to login */}
      <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

// The main App component that sets up the Router and Context Providers
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          {/* AppContent is rendered here, so it has access to all contexts and router */}
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;