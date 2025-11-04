import React, { useEffect, useState } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import StatsSection from './StatsSection';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import AdminDashboard from './AdminDashboard';
import { isLoggedIn } from '../utils/navigation';

interface WelcomeScreenProps {
  onGetStarted?: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  userType?: string;
  avatar?: string;
  specialization?: string;
  licenseNumber?: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for user authentication on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const checkAuth = () => {
      if (isLoggedIn()) {
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    setLoading(false);

    // Listen for logout events
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('userLogout', handleLogout);

    return () => {
      window.removeEventListener('userLogout', handleLogout);
    };
  }, []);

  const handleWatchDemo = () => {
    console.log('Watch demo clicked');
    // Implement demo logic
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // If user is logged in and is a doctor, show AdminDashboard
  if (user && user.userType === 'doctor') {
    return <AdminDashboard user={user} />;
  }

  // If user is logged in but is a patient, show regular dashboard
  if (user && user.userType === 'patient') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
        <Header />

        {/* Patient Welcome Section */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '48px 32px',
            marginBottom: '32px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Welcome back, {user.name}!
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#6b7280',
              maxWidth: '800px',
              margin: '0 auto 32px auto',
              lineHeight: '1.6'
            }}>
              Your health journey continues here. Access your medical records, book appointments, and stay connected with your healthcare providers.
            </p>
          </div>
        </div>

        <FeaturesSection />
        <StatsSection />
        <Footer />
        <BackToTopButton />
      </div>
    );
  }

  // Default welcome screen for non-logged-in users
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />

      <HeroSection
        onGetStarted={onGetStarted}
        onWatchDemo={handleWatchDemo}
      />

      <FeaturesSection />

      <StatsSection />

      <Footer />
      
      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
};

export default WelcomeScreen;