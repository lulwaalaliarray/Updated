import React, { useState, useEffect } from 'react';
import DoctorPatientRecords from './DoctorPatientRecords';
import Header from './Header';
import Footer from './Footer';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PatientRecords Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
            Something went wrong loading Patient Records
          </h2>
          <p style={{ color: '#991b1b', marginBottom: '16px' }}>
            Error: {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const PatientRecords: React.FC = () => {
  const [user, setUser] = useState<{ id?: string; name: string; userType: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header />
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            Access Denied
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Please log in to access patient records.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (user.userType !== 'doctor' && user.userType !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header />
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            Access Restricted
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Only doctors and administrators can access patient records.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  // Simple working version
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
          Patient Records
        </h1>
        


        {/* DoctorPatientRecords with error handling */}
        <ErrorBoundary>
          <DoctorPatientRecords doctorId={user.id || user.email || user.name || 'unknown'} />
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  );
};

export default PatientRecords;