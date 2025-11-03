import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleNavigation, routes, isLoggedIn, logout } from '../utils/navigation';
import { useToast } from './Toast';
import './Header.css';

interface User {
  id: string;
  name: string;
  email: string;
  userType?: string;
  avatar?: string;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  // Check for user authentication
  useEffect(() => {
    if (isLoggedIn()) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, []);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  const handleGetStarted = () => {
    console.log('Navigating to signup page');
    handleNavigation(navigate, routes.signup, false, showToast);
  };

  const handleLogin = () => {
    console.log('Navigating to login page');
    handleNavigation(navigate, routes.login, false, showToast);
  };

  const handleNavClick = (destination: string) => {
    handleNavigation(navigate, destination, false, showToast);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    // Use centralized logout function
    logout();
    
    // Clear local component state immediately
    setUser(null);
    
    // Close any open menus
    setIsMenuOpen(false);
    setShowDropdown(false);
    
    // Show logout message
    showToast('You have been logged out successfully', 'info');
    
    // Force immediate navigation to home page
    navigate(routes.home, { replace: true });
    
    // Force a page reload to ensure all state is cleared
    setTimeout(() => {
      window.location.href = routes.home;
    }, 100);
  };



  return (
    <header style={{ 
      backgroundColor: 'white', 
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

          
          <button 
            onClick={() => handleNavClick(routes.home)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#0d9488',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4h4v4zm0-6h-4V7h4v4z"/>
              </svg>
            </div>
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#111827',
                margin: 0
              }}>
                PatientCare
              </h1>
            </div>
          </button>
        </div>

        {/* Desktop Navigation - Centered */}
        <nav style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
        className="desktop-nav"
        >
          <button 
            onClick={() => handleNavClick(routes.home)}
            style={{ 
              color: '#6b7280', 
              background: 'none',
              border: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            Home
          </button>
          {user && (
            <>

              <button 
                onClick={() => handleNavClick(user.userType === 'doctor' ? '/past-patients' : routes.doctors)}
                style={{ 
                  color: '#6b7280', 
                  background: 'none',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                {user.userType === 'doctor' ? 'Patients' : 'Doctors'}
              </button>
              <button 
                onClick={() => handleNavClick(routes.appointments)}
                style={{ 
                  color: '#6b7280', 
                  background: 'none',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Appointments
              </button>
            </>
          )}

          {user && user.userType === 'patient' && (
            <>
              <button 
                onClick={() => handleNavClick(routes.prescriptions)}
                style={{ 
                  color: '#6b7280', 
                  background: 'none',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Prescriptions
              </button>
            </>
          )}

          {user && user.userType === 'doctor' && (
            <>
              <button 
                onClick={() => handleNavClick('/write-prescription')}
                style={{ 
                  color: '#6b7280', 
                  background: 'none',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Prescriptions
              </button>
              <button 
                onClick={() => handleNavClick(routes.manageAvailability)}
                style={{ 
                  color: '#6b7280', 
                  background: 'none',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Availability
              </button>
            </>
          )}
          {user && user.userType === 'admin' && (
            <>
              <button 
                onClick={() => handleNavClick('/write-prescription')}
                style={{ 
                  color: '#6b7280', 
                  background: 'none',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Prescriptions
              </button>
              <button 
                onClick={() => handleNavClick(routes.manageAvailability)}
                style={{ 
                  color: '#6b7280', 
                  background: 'none',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Availability
              </button>
            </>
          )}

          {/* Always visible navigation items */}
          <button 
            onClick={() => handleNavClick(routes.about)}
            style={{ 
              color: '#6b7280', 
              background: 'none',
              border: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            About
          </button>
          <button 
            onClick={() => handleNavClick(routes.contact)}
            style={{ 
              color: '#6b7280', 
              background: 'none',
              border: 'none',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'color 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            Contact Us
          </button>

        </nav>

        {/* Desktop CTA Buttons */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
        className="desktop-cta"
        >
          {user ? (
            // Authenticated user profile
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0fdfa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Click to open menu"
              >
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0
                  }}>
                    {user.name}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {user.userType === 'doctor' ? 'Doctor' : user.userType === 'admin' ? 'Admin' : 'Patient'}
                  </p>
                </div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f0fdfa',
                  borderRadius: '50%',
                  border: '2px solid #0d9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#0d9488'
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  minWidth: '200px',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 4px 0'
                    }}>
                      {user.name}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {user.email}
                    </p>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <button
                      onClick={() => {
                        handleNavClick(routes.profile);
                        setShowDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#374151',
                        textAlign: 'left',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        handleNavClick(routes.dashboard);
                        setShowDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#374151',
                        textAlign: 'left',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        textAlign: 'left',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Non-authenticated user buttons
            <>
              <button
                onClick={handleLogin}
                style={{
                  padding: '8px 16px',
                  color: '#0d9488',
                  backgroundColor: 'transparent',
                  border: '1px solid #0d9488',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0fdfa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                style={{
                  padding: '8px 16px',
                  color: 'white',
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
          className="mobile-menu-btn"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '20px'
        }}
        className="mobile-menu"
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button onClick={() => handleNavClick(routes.home)} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>Home</button>
            {user && (
              <>

                <button onClick={() => handleNavClick(user.userType === 'doctor' ? '/past-patients' : routes.doctors)} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>
                  {user.userType === 'doctor' ? 'Past Patients' : 'Find Doctors'}
                </button>
                <button onClick={() => handleNavClick(routes.appointments)} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>
                  My Appointments
                </button>
              </>
            )}
            {user && user.userType === 'doctor' && (
              <>
                <button onClick={() => handleNavClick('/write-prescription')} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>
                  Write Prescription
                </button>
                <button onClick={() => handleNavClick(routes.manageAvailability)} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>
                  Availability
                </button>
                <button onClick={() => handleNavClick(routes.blog)} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>
                  Blog
                </button>
              </>
            )}
            {user && user.userType === 'admin' && (
              <>
                <button onClick={() => handleNavClick('/write-prescription')} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>
                  Write Prescription
                </button>
                <button onClick={() => handleNavClick(routes.manageAvailability)} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>
                  Availability
                </button>
              </>
            )}
            {user && user.userType === 'patient' && (
              <>
                <button onClick={() => handleNavClick(routes.prescriptions)} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>
                  My Prescriptions
                </button>
              </>
            )}
            {/* Always visible navigation items */}
            <button onClick={() => handleNavClick(routes.about)} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>
              About
            </button>
            <button onClick={() => handleNavClick(routes.contact)} style={{ color: '#6b7280', background: 'none', border: 'none', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>
              Contact Us
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {user ? (
                <>
                  <button 
                    onClick={() => handleNavClick(routes.profile)}
                    style={{ 
                      padding: '12px',
                      backgroundColor: '#f0fdfa',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ccfbf1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdfa';
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#0d9488',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <span style={{ fontSize: '14px', color: '#0d9488', fontWeight: '500' }}>
                      {user.name || 'User'} - View Profile
                    </span>
                  </button>
                  <button onClick={handleLogout} style={{
                    padding: '12px',
                    color: '#6b7280',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleLogin} style={{
                    padding: '12px',
                    color: '#0d9488',
                    backgroundColor: 'transparent',
                    border: '1px solid #0d9488',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Sign In
                  </button>
                  <button onClick={handleGetStarted} style={{
                    padding: '12px',
                    color: 'white',
                    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Get Started
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;