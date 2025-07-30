import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { theme } from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InstrumentManagement from './pages/InstrumentManagement';
import PriceFeedMonitoring from './pages/PriceFeedMonitoring';
import ClientManagement from './pages/ClientManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import AuditTrail from './pages/AuditTrail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SSIManagement from './pages/SSIManagement';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import './firebase/config'; // This will initialize Firebase
import ConsolidatedData from './pages/ConsolidatedData';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <Layout>
                    <Outlet />
                  </Layout>
                }
              >
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/instrument-management"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <InstrumentManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/price-feed-monitoring"
                  element={
                    <ProtectedRoute>
                      <PriceFeedMonitoring />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client-management"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <ClientManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports-analytics"
                  element={
                    <ProtectedRoute>
                      <ReportsAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit-trail"
                  element={
                    <ProtectedRoute>
                      <AuditTrail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ssi-management"
                  element={
                    <ProtectedRoute>
                      <SSIManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consolidated-data"
                  element={
                    <ProtectedRoute>
                      <ConsolidatedData />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App; 