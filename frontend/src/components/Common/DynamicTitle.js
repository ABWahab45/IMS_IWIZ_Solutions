import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DynamicTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const getPageTitle = (pathname) => {
      switch (pathname) {
        case '/dashboard':
          return 'Dashboard - IWIZ Solutions';
        case '/inventory':
          return 'Inventory - IWIZ Solutions';
        case '/inventory/new':
          return 'Add Product - IWIZ Solutions';
        case '/inventory/handover':
          return 'Hand Over - IWIZ Solutions';
        case '/inventory/pending-handovers':
          return 'Pending Handovers - IWIZ Solutions';
        case '/inventory/request-handover':
          return 'Request Handover - IWIZ Solutions';
        case '/inventory/return-handover':
          return 'My Handovers - IWIZ Solutions';
        case '/reports':
          return 'Reports - IWIZ Solutions';
        case '/users':
          return 'Users - IWIZ Solutions';
        case '/settings':
          return 'Settings - IWIZ Solutions';
        case '/profile':
          return 'Profile - IWIZ Solutions';
        case '/login':
          return 'Login - IWIZ Solutions';
        case '/register':
          return 'Register - IWIZ Solutions';
        default:
          if (pathname.startsWith('/inventory/') && pathname !== '/inventory/new') {
            return 'Product Details - IWIZ Solutions';
          }
          return 'IWIZ Solutions - Inventory Management';
      }
    };

    const title = getPageTitle(location.pathname);
    document.title = title;
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default DynamicTitle;
