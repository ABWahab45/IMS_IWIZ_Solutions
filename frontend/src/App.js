import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SidebarProvider } from './contexts/SidebarContext';

// Components
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Auth/Login';

import Dashboard from './pages/Dashboard/Dashboard';
import InventoryList from './pages/Inventory/InventoryList';
import AddInventory from './pages/Inventory/AddInventory';
import InventoryDetail from './pages/Inventory/InventoryDetail';
import InventoryUsage from './pages/Inventory/InventoryUsage';
import InventoryRestock from './pages/Inventory/InventoryRestock';
import HandOver from './pages/Inventory/HandOver';
import NewHandOver from './pages/Inventory/NewHandOver';
import HandoverDetail from './pages/Inventory/HandoverDetail';
import RequestHandover from './pages/Inventory/RequestHandover';
import ReturnHandover from './pages/Inventory/ReturnHandover';
import PendingHandovers from './pages/Inventory/PendingHandovers';
import Users from './pages/Users/Users';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Reports from './pages/Reports/Reports';

import NotFound from './pages/NotFound';

// Form Components
import UserForm from './components/Forms/UserForm';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  
                  <Route path="/*" element={
                    <PrivateRoute>
                      <AppLayout />
                    </PrivateRoute>
                  } />
                </Routes>
                
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
              </div>
            </Router>
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Layout component for authenticated users
function AppLayout() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <main className="main-content p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/inventory/new" element={<AddInventory />} />
            <Route path="/inventory/:id" element={<InventoryDetail />} />
            <Route path="/inventory/:id/edit" element={<AddInventory />} />
            <Route path="/inventory/usage" element={<InventoryUsage />} />
            <Route path="/inventory/restock" element={<InventoryRestock />} />
                        <Route path="/inventory/handover" element={<HandOver />} />
            <Route path="/inventory/handover/new" element={<NewHandOver />} />
            <Route path="/inventory/handover/:id" element={<HandoverDetail />} />
            <Route path="/inventory/request-handover" element={<RequestHandover />} />
            <Route path="/inventory/return-handover" element={<ReturnHandover />} />
            <Route path="/inventory/pending-handovers" element={<PendingHandovers />} />
            
            <Route path="/users" element={<Users />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/:id/edit" element={<UserForm />} />
            
            <Route path="/reports" element={<Reports />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;