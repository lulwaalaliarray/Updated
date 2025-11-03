import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, routes } from '../utils/navigation';
import { useToast } from './Toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  message?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = routes.login,
  message = 'Please log in to access this page'
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn());

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isLoggedIn();
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        showToast(message, 'info');
        // Store current path for redirect after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate(redirectTo, { replace: true });
      }
    };

    // Check authentication immediately
    checkAuth();

    // Listen for logout events
    const handleLogout = () => {
      setIsAuthenticated(false);
      checkAuth();
    };

    // Listen for storage changes (logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'userData') {
        checkAuth();
      }
    };

    window.addEventListener('userLogout', handleLogout);
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically as fallback
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('userLogout', handleLogout);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [navigate, showToast, redirectTo, message]);

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;