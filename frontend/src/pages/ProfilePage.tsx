import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { routes } from '../utils/navigation';
import { useToast } from '../components/Toast';
import { userStorage } from '../utils/userStorage';
import Header from '../components/Header';

interface User {
  id: string;
  name: string;
  email: string;
  userType?: string;
  cpr?: string;
  status?: string;
  createdAt?: string;
  avatar?: string;
  specialization?: string;
  consultationFee?: number;
  experience?: string;
  qualifications?: string;
  availability?: {
    [key: string]: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
  };
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        // Try to get more detailed user info from userStorage
        const registeredUsers = userStorage.getAllUsers();
        const detailedUser = registeredUsers.find(u => u.email === parsedUser.email);
        
        if (detailedUser) {
          setUser({
            ...parsedUser,
            cpr: detailedUser.cpr,
            status: detailedUser.status,
            createdAt: detailedUser.createdAt,
            specialization: detailedUser.specialization,
            consultationFee: detailedUser.consultationFee,
            experience: detailedUser.experience,
            qualifications: detailedUser.qualifications,
            availability: detailedUser.availability
          });
        } else {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate(routes.login);
      }
    } else {
      navigate(routes.login);
    }
  }, [navigate]);



  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    
    try {
      // Remove user from registered users
      const registeredUsers = userStorage.getAllUsers();
      const updatedUsers = registeredUsers.filter(u => u.email !== user.email);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      // Clear all user data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('redirectAfterLogin');
      
      showToast('Account deleted successfully', 'success');
      
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate(routes.home);
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('Failed to delete account. Please try again.', 'error');
      setIsDeleting(false);
    }
  };

  const cancelDeleteAccount = () => {
    setShowDeleteConfirm(false);
  };



  if (!user) {
    return <div>Loading...</div>;
  }

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
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Account Settings
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280'
            }}>
              Manage your account information and preferences
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to={routes.dashboard}
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
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Detailed User Information */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Personal Information */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dbeafe',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" fill="#2563eb" viewBox="0 0 24 24">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>
                Personal Information
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '500'
                }}>
                  Full Name
                </p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  {user.name}
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '500'
                }}>
                  Email Address
                </p>
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  {user.email}
                </p>
              </div>
              {user.cpr && (
                <div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: '500'
                  }}>
                    CPR Number
                  </p>
                  <p style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0,
                    fontFamily: 'monospace'
                  }}>
                    {userStorage.formatCPR(user.cpr)}
                  </p>
                </div>
              )}
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '500'
                }}>
                  Account Type
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: user.userType === 'doctor' ? '#dcfce7' : '#dbeafe',
                    color: user.userType === 'doctor' ? '#166534' : '#1e40af'
                  }}>
                    {user.userType === 'doctor' ? 'Healthcare Provider' : 'Patient'}
                  </span>
                </div>
              </div>
              
              {/* Doctor-specific information */}
              {user.userType === 'doctor' && (
                <>
                  {user.specialization && (
                    <div>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '500'
                      }}>
                        Specialization
                      </p>
                      <p style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0
                      }}>
                        {user.specialization}
                      </p>
                    </div>
                  )}
                  
                  {user.consultationFee && (
                    <div>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '500'
                      }}>
                        Consultation Fee
                      </p>
                      <p style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0
                      }}>
                        BHD {user.consultationFee}
                      </p>
                    </div>
                  )}
                  
                  {user.experience && (
                    <div>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '500'
                      }}>
                        Experience
                      </p>
                      <p style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0
                      }}>
                        {user.experience}
                      </p>
                    </div>
                  )}
                  
                  {user.qualifications && (
                    <div>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '500'
                      }}>
                        Qualifications
                      </p>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: 0,
                        lineHeight: '1.5'
                      }}>
                        {user.qualifications}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Account Status & Security */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dcfce7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" fill="#16a34a" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,16.6 15.6,17 15,17H9C8.4,17 8,16.6 8,16V13C8,12.4 8.4,11.5 9,11.5V10C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,8.7 10.2,10V11.5H13.8V10C13.8,8.7 12.8,8.2 12,8.2Z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>
                Account Status
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '500'
                }}>
                  Status
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: user.status === 'verified' || user.status === 'active' ? '#dcfce7' : '#fef3c7',
                    color: user.status === 'verified' || user.status === 'active' ? '#166534' : '#92400e'
                  }}>
                    {user.status === 'verified' ? '✅ Verified' : 
                     user.status === 'active' ? '✅ Active' : 
                     user.status === 'pending_verification' ? '⏳ Pending Verification' : '✅ Active'}
                  </span>
                </div>
              </div>
              {user.createdAt && (
                <div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: '500'
                  }}>
                    Member Since
                  </p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#111827',
                    margin: 0
                  }}>
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '0 0 4px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '500'
                }}>
                  Security
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#16a34a',
                  fontWeight: '500',
                  margin: 0
                }}>
                  🔒 Account Secured
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Availability Section */}
        {user.userType === 'doctor' && user.availability && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f0fdfa',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" fill="#0d9488" viewBox="0 0 24 24">
                  <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>
                Weekly Availability
              </h3>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {Object.entries(user.availability).map(([day, schedule]) => (
                <div key={day} style={{
                  padding: '16px',
                  backgroundColor: schedule.available ? '#f0fdfa' : '#f9fafb',
                  borderRadius: '12px',
                  border: `1px solid ${schedule.available ? '#0d9488' : '#e5e7eb'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: schedule.available ? '#0d9488' : '#9ca3af'
                    }}></div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0,
                      textTransform: 'capitalize'
                    }}>
                      {day}
                    </p>
                  </div>
                  
                  {schedule.available ? (
                    <div>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#0d9488',
                        margin: '0 0 4px 0'
                      }}>
                        {(() => {
                          const formatTime = (time: string) => {
                            const [hours, minutes] = time.split(':');
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour % 12 || 12;
                            return `${displayHour}:${minutes} ${ampm}`;
                          };
                          return `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`;
                        })()}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        Available for appointments
                      </p>
                    </div>
                  ) : (
                    <p style={{
                      fontSize: '14px',
                      color: '#9ca3af',
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      Not available
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 8px 0'
              }}>
                Want to update your availability?
              </p>
              <Link
                to={routes.manageAvailability}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f766e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0d9488';
                }}
              >
                Manage Availability
              </Link>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #fecaca',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="#ef4444" viewBox="0 0 24 24">
                <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21C3,22.11 3.89,23 5,23H19C20.11,23 21,22.11 21,21V9M19,9H14V4H5V21H19V9Z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#dc2626',
              margin: 0
            }}>
              Danger Zone
            </h3>
          </div>
          <div style={{
            padding: '20px',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#dc2626',
              margin: '0 0 8px 0'
            }}>
              Delete Account
            </h4>
            <p style={{
              fontSize: '14px',
              color: '#7f1d1d',
              margin: '0 0 16px 0',
              lineHeight: '1.5'
            }}>
              Once you delete your account, there is no going back. This will permanently delete your account, 
              all your medical records, appointments, and remove all associated data from our servers.
            </p>
            <button
              onClick={handleDeleteAccount}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#fef2f2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" fill="#ef4444" viewBox="0 0 24 24">
                  <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21C3,22.11 3.89,23 5,23H19C20.11,23 21,22.11 21,21V9M19,9H14V4H5V21H19V9Z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#dc2626',
                margin: 0
              }}>
                Delete Account
              </h3>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontSize: '16px',
                color: '#374151',
                margin: '0 0 16px 0',
                lineHeight: '1.6'
              }}>
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div style={{
                padding: '16px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                marginBottom: '16px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#7f1d1d',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  <strong>This will permanently delete:</strong><br/>
                  • Your account and profile information<br/>
                  • All medical records and history<br/>
                  • Appointment history and bookings<br/>
                  • All associated data from our servers
                </p>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                If you're sure you want to proceed, click "Yes, Delete Account" below.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelDeleteAccount}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                disabled={isDeleting}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isDeleting ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
              >
                {isDeleting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ProfilePage;