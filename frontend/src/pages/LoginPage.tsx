import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { routes } from '../utils/navigation';
import { userStorage, initializeDemoUsers } from '../utils/userStorage';
import { initializeDemoPrescriptions } from '../utils/prescriptionStorage';
import { inputValidation } from '../utils/inputValidation';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'patient'
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Initialize demo users and prescriptions on component mount
  useEffect(() => {
    initializeDemoUsers();
    initializeDemoPrescriptions();
  }, []);

  // Get user statistics for display
  const userStats = userStorage.getUserCount();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Apply appropriate validation based on field type
    if (name === 'email') {
      sanitizedValue = inputValidation.sanitizeEmail(value);
    } else {
      sanitizedValue = inputValidation.sanitizeText(value);
    }

    setFormData({
      ...formData,
      [name]: sanitizedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation
    if (!formData.email || !formData.password) {
      showToast('Please fill in all fields', 'error');
      setIsLoading(false);
      return;
    }

    try {
      // Find user with matching credentials
      const user = userStorage.findUser(formData.email, formData.password, formData.userType);

      if (user) {
        // All accounts are now active upon registration

        // Store auth data
        localStorage.setItem('authToken', 'mock-jwt-token');
        localStorage.setItem('userData', JSON.stringify(user));

        const welcomeMessage = user.userType === 'patient'
          ? `Welcome back, ${user.name}!`
          : `Welcome back, Dr. ${user.name}!`;

        showToast(welcomeMessage, 'success');

        // Check for redirect destination
        const redirectTo = localStorage.getItem('redirectAfterLogin') || routes.dashboard;
        localStorage.removeItem('redirectAfterLogin');

        navigate(redirectTo);
      } else {
        showToast('Invalid email or password for selected account type', 'error');
      }
    } catch (error) {
      showToast('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
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
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4h4v4zm0-6h-4V7h4v4z" />
              </svg>
            </div>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Welcome back
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Sign in to your PatientCare account
          </p>
        </div>

        {/* Login Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Account Type
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="patient">Patient Login</option>
                <option value="doctor">Doctor Login</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                {formData.userType === 'patient' ? 'Email Address' : 'Professional Email'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={formData.userType === 'patient' ? 'patient@patientcare.bh' : 'doctor@patientcare.bh'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                Remember me
              </label>
              <Link
                to="#"
                style={{
                  fontSize: '14px',
                  color: '#0d9488',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: formData.userType === 'patient' ? '#f0f9ff' : '#f0fdf4',
            borderRadius: '8px',
            border: `1px solid ${formData.userType === 'patient' ? '#e0f2fe' : '#dcfce7'}`
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: formData.userType === 'patient' ? '#0369a1' : '#166534',
              marginBottom: '8px'
            }}>
              {formData.userType === 'patient' ? 'Patient Demo Login:' : 'Doctor Demo Login:'}
            </p>
            <p style={{
              fontSize: '13px',
              color: formData.userType === 'patient' ? '#0369a1' : '#166534',
              margin: '2px 0'
            }}>
              Email: {formData.userType === 'patient' ? 'patient@patientcare.bh' : 'doctor@patientcare.bh'}
            </p>
            <p style={{
              fontSize: '13px',
              color: formData.userType === 'patient' ? '#0369a1' : '#166534',
              margin: '2px 0'
            }}>
              Password: {formData.userType === 'patient' ? 'password' : 'doctor123'}
            </p>
            {formData.userType === 'doctor' && (
              <p style={{
                fontSize: '12px',
                color: '#166534',
                margin: '8px 0 0 0',
                fontStyle: 'italic'
              }}>
                🩺 Verified NHRA-licensed physician
              </p>
            )}
          </div>

          {/* User Statistics */}
          {userStats.total > 2 && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                textAlign: 'center',
                margin: 0
              }}>
                📊 {userStats.total} registered users ({userStats.patients} patients, {userStats.doctors} doctors)
              </p>
            </div>
          )}
        </div>

        {/* Sign Up Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link
              to={routes.signup}
              style={{
                color: '#0d9488',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link
            to={routes.home}
            style={{
              fontSize: '14px',
              color: '#9ca3af',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;