import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        });
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        });
      }
    } else {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock login - replace with actual API call
      if (email === 'admin@example.com' && password === 'admin123') {
        const user: User = {
          id: '1',
          name: 'Sarah Al-Khalifa',
          email: email,
          avatar: undefined
        };
        
        const token = 'mock-jwt-token';
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('redirectAfterLogin');
    
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    });
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('userLogout'));
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Mock signup - replace with actual API call
      const user: User = {
        id: Date.now().toString(),
        name,
        email,
        avatar: undefined
      };
      
      const token = 'mock-jwt-token';
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      });
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  return {
    ...authState,
    login,
    logout,
    signup
  };
};