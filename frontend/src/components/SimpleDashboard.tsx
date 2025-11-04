import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AdminDashboard from './AdminDashboard';

interface SimpleDashboardProps {
  user: {
    name: string;
    email?: string;
    userType?: string;
    avatar?: string;
  };
}

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  
  // If user is a doctor, show the AdminDashboard
  if (user.userType === 'doctor') {
    return <AdminDashboard user={user} />;
  }

  // For patients and other user types, show the patient dashboard
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const quickActions = [
    {
      title: 'Find Doctors',
      description: 'Search for healthcare providers',
      icon: '👨‍⚕️',
      action: () => navigate('/doctors')
    },
    {
      title: 'My Appointments',
      description: 'View and manage appointments',
      icon: '📅',
      action: () => navigate('/appointments')
    },
    {
      title: 'Profile Settings',
      description: 'Manage your account',
      icon: '⚙️',
      action: () => navigate('/profile')
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Welcome Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '16px'
          }}>
            {greeting}, {user.name}! 👋
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '0'
          }}>
            Welcome to your PatientCare dashboard. How can we help you today?
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '24px'
          }}>
            Quick Actions
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
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
                  e.currentTarget.style.borderColor = '#0d9488';
                  e.currentTarget.style.backgroundColor = '#f0fdfa';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '32px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#0d9488',
                  borderRadius: '12px'
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

        {/* User Info */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Account Information
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Name</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>{user.name}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Email</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>{user.email}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Account Type</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {user.userType === 'doctor' ? 'Healthcare Provider' : 'Patient'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SimpleDashboard;