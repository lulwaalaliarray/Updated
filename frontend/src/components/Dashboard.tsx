import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { routes } from '../utils/navigation';
import { useToast } from './Toast';
import PastPatients from './PastPatients';

interface DashboardProps {
  user: {
    name: string;
    email?: string;
    userType?: string;
    avatar?: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const navigate = useNavigate();
  const { showToast } = useToast();

  // For doctors, show PastPatients component instead of regular dashboard
  if (user.userType === 'doctor') {
    return <PastPatients />;
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    showToast('Logged out successfully', 'success');
    navigate(routes.home);
  };

  const handleQuickAction = () => {
    showToast('Feature coming soon!', 'info');
  };

  // Define quick actions based on user type
  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Find Doctors',
        description: 'Search for healthcare providers',
        icon: (
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/>
          </svg>
        ),
        action: () => navigate(routes.doctors)
      },
      {
        title: 'My Appointments',
        description: 'View and manage appointments',
        icon: (
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
          </svg>
        ),
        action: () => navigate('/appointments')
      },
      {
        title: 'Medical Records',
        description: 'Access your health history',
        icon: (
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        ),
        action: () => handleQuickAction()
      }
    ];

    // Add doctor-specific actions
    if (user.userType === 'doctor') {
      baseActions.push({
        title: 'Manage Blog Posts',
        description: 'Create and manage your blog posts',
        icon: (
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        ),
        action: () => navigate(routes.blog)
      });
    } else {
      // Add patient-specific action
      baseActions.push({
        title: 'Prescriptions',
        description: 'Manage your medications',
        icon: (
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.5,20Q4.22,20 2.61,18.43Q1,16.85 1,14.58Q1,12.63 2.17,11.1Q3.35,9.57 5.25,9.15Q5.88,6.85 7.75,5.43Q9.63,4 12,4Q14.93,4 16.96,6.04Q19,8.07 19,11Q20.73,11.2 21.86,12.5Q23,13.78 23,15.5Q23,17.38 21.69,18.69Q20.38,20 18.5,20H6.5M6.5,18H18.5Q19.46,18 20.23,17.23Q21,16.46 21,15.5Q21,14.54 20.23,13.77Q19.46,13 18.5,13H17V11Q17,8.79 15.61,7.39Q14.21,6 12,6Q9.79,6 8.39,7.39Q7,8.79 7,11H6.5Q5.12,11 4.06,12.06Q3,13.12 3,14.5Q3,15.88 4.06,16.94Q5.12,18 6.5,18Z"/>
          </svg>
        ),
        action: () => handleQuickAction()
      });
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                PatientCare Dashboard
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                Bahrain Healthcare Platform
              </p>
            </div>
          </div>

          {/* User Info and Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                {user.name}
              </p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                {user.userType === 'doctor' ? 'Doctor' : 'Patient'} • {user.email}
              </p>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#f0fdfa',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0d9488'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0d9488'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

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
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}>
              {greeting}, {user.name}!
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280'
            }}>
              {user.userType === 'doctor' 
                ? 'Ready to help your patients today?' 
                : 'How can we help you with your healthcare today?'
              }
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
                  e.currentTarget.style.borderColor = '#0d9488';
                  e.currentTarget.style.backgroundColor = '#f0fdfa';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.15)';
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
                  backgroundColor: '#0d9488',
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

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to={routes.home}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#0d9488',
                border: '2px solid #0d9488',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0fdfa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Back to Home
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Account Status */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dcfce7',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="#16a34a" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                Account Status
              </h3>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#16a34a',
              fontWeight: '500',
              margin: '0 0 8px 0'
            }}>
              ✅ Account Active
            </p>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              Your account is verified and ready to use all features.
            </p>
          </div>

          {/* Quick Stats */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
                Your Activity
              </h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2563eb',
                  margin: '0 0 4px 0'
                }}>
                  0
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {user.userType === 'doctor' ? 'Patients Seen' : 'Appointments'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  This Month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;