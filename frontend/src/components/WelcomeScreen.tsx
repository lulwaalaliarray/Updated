import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import StatsSection from './StatsSection';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import AdminDashboard from './AdminDashboard';
import { isLoggedIn, routes } from '../utils/navigation';
import { appointmentStorage } from '../utils/appointmentStorage';
import { prescriptionStorage } from '../utils/prescriptionStorage';

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

// Patient Home Dashboard Component
const PatientHomeDashboard: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalPrescriptions: 0,
    recentActivity: [] as Array<{
      type: 'appointment' | 'prescription';
      title: string;
      date: string;
      status?: string;
    }>
  });

  useEffect(() => {
    // Calculate patient statistics
    const calculateStats = () => {
      const userId = user.id || user.email;
      
      // Get patient's appointments
      const allAppointments = appointmentStorage.getAllAppointments();
      const patientAppointments = allAppointments.filter(apt => 
        apt.patientId === userId || apt.patientEmail === user.email
      );
      
      // Count upcoming appointments
      const currentDate = new Date();
      const upcoming = patientAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= currentDate && (apt.status === 'confirmed' || apt.status === 'pending');
      });
      
      // Get patient's prescriptions
      const patientPrescriptions = prescriptionStorage.getPatientPrescriptionsWithExpiration(userId);
      
      // Create recent activity
      const recentActivity: Array<{
        type: 'appointment' | 'prescription';
        title: string;
        date: string;
        status?: string;
      }> = [];
      
      // Add recent appointments
      const recentAppointments = patientAppointments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
      
      recentAppointments.forEach(apt => {
        recentActivity.push({
          type: 'appointment',
          title: `Appointment with ${apt.doctorName}`,
          date: apt.date,
          status: apt.status
        });
      });
      
      // Add recent prescriptions
      const recentPrescriptions = patientPrescriptions
        .sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime())
        .slice(0, 2);
      
      recentPrescriptions.forEach(prescription => {
        recentActivity.push({
          type: 'prescription',
          title: `Prescription from ${prescription.doctorName}`,
          date: prescription.dateIssued,
          status: prescription.status
        });
      });
      
      // Sort by date
      recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setStats({
        upcomingAppointments: upcoming.length,
        totalPrescriptions: patientPrescriptions.length,
        recentActivity: recentActivity.slice(0, 5)
      });
    };
    
    calculateStats();
  }, [user]);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const quickActions = [
    {
      title: 'Find Doctors',
      description: 'Search for healthcare providers',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/>
        </svg>
      ),
      action: () => navigate(routes.doctors),
      color: '#0d9488'
    },
    {
      title: 'My Appointments',
      description: 'View and manage appointments',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
        </svg>
      ),
      action: () => navigate('/appointments'),
      color: '#2563eb'
    },
    {
      title: 'My Prescriptions',
      description: 'View your medical prescriptions',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      ),
      action: () => navigate('/prescriptions'),
      color: '#059669'
    },
    {
      title: 'Medical Records',
      description: 'View your personal health records',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      ),
      action: () => navigate(routes.records),
      color: '#7c3aed'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      
      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Welcome Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}>
              {greeting}, {user.name}!
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#6b7280'
            }}>
              How can we help you with your healthcare today?
            </p>
          </div>

          {/* Quick Actions Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.backgroundColor = '#f0fdfa';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: action.color,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  {action.icon}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 4px 0'
                  }}>
                    {action.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats and Activity Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {/* Health Stats */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dbeafe',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="#2563eb" viewBox="0 0 24 24">
                  <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                Your Health Overview
              </h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#2563eb',
                  margin: '0 0 8px 0'
                }}>
                  {stats.upcomingAppointments}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Upcoming Appointments
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#059669',
                  margin: '0 0 8px 0'
                }}>
                  {stats.totalPrescriptions}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Total Prescriptions
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f3e8ff',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="#7c3aed" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                Recent Activity
              </h3>
            </div>
            
            {stats.recentActivity.length === 0 ? (
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0,
                textAlign: 'center',
                padding: '20px 0'
              }}>
                No recent activity to display
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: activity.type === 'appointment' ? '#dbeafe' : '#dcfce7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {activity.type === 'appointment' ? (
                        <svg width="16" height="16" fill="#2563eb" viewBox="0 0 24 24">
                          <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="#059669" viewBox="0 0 24 24">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '0 0 2px 0'
                      }}>
                        {activity.title}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {activity.status && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            backgroundColor: activity.status === 'completed' ? '#dcfce7' : '#fef3c7',
                            color: activity.status === 'completed' ? '#059669' : '#d97706',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500',
                            textTransform: 'capitalize'
                          }}>
                            {activity.status}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for user authentication on component mount
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
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #0d9488',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If user is a doctor, show admin dashboard
  if (user && user.userType === 'doctor') {
    return <AdminDashboard user={user} />;
  }

  // If user is a patient, show patient dashboard-like home page
  if (user && user.userType === 'patient') {
    return <PatientHomeDashboard user={user} />;
  }

  // Default welcome screen for non-authenticated users
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />
      
      {/* Hero Section with video/slideshow */}
      <HeroSection onGetStarted={onGetStarted} />
      
      {/* Features Section with information */}
      <FeaturesSection />
      
      {/* Statistics Section */}
      <StatsSection />
      
      <Footer />
      <BackToTopButton />
      
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

export default WelcomeScreen;