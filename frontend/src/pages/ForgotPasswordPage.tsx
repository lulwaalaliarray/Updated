import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { routes } from '../utils/navigation';
import { userStorage } from '../utils/userStorage';
import { inputValidation } from '../utils/inputValidation';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate email
    if (!email) {
      showToast('Please enter your email address', 'error');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error');
      setIsLoading(false);
      return;
    }

    try {
      // Check if user exists
      const userExists = userStorage.userExists(email);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (userExists) {
        // In a real app, this would send an actual email
        // Show the reset instructions
        setIsEmailSent(true);
        showToast('Password reset instructions sent to your email', 'success');
      } else {
        // For security, we don't reveal if email exists or not
        setIsEmailSent(true);
        showToast('If an account with this email exists, you will receive reset instructions', 'success');
      }
    } catch (error) {
      showToast('Failed to send reset email. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedEmail = inputValidation.sanitizeEmail(e.target.value);
    setEmail(sanitizedEmail);
  };

  if (isEmailSent) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Success Message */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg width="32" height="32" fill="#16a34a" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Check your email
            </h1>
            
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              We've sent password reset instructions to <strong>{email}</strong>
            </p>

            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #e0f2fe',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#0369a1',
                marginBottom: '8px'
              }}>
                Demo Instructions:
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#0369a1',
                margin: '4px 0'
              }}>
                • For demo accounts, use the original passwords
              </p>
              <p style={{
                fontSize: '13px',
                color: '#0369a1',
                margin: '4px 0'
              }}>
                • Patient: password
              </p>
              <p style={{
                fontSize: '13px',
                color: '#0369a1',
                margin: '4px 0'
              }}>
                • Doctor: doctor123
              </p>
            </div>

            <Link
              to={routes.login}
              style={{
                display: 'inline-block',
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                textAlign: 'center',
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
              Back to Login
            </Link>
          </div>

          {/* Additional Help */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              Didn't receive the email?
            </p>
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0d9488',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            Forgot Password?
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Enter your email and we'll send you reset instructions
          </p>
        </div>

        {/* Reset Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email address"
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
                required
              />
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
                  Sending...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>
        </div>

        {/* Back to Login */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            to={routes.login}
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
            Back to login
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

export default ForgotPasswordPage;