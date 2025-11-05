import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import { useToast } from './Toast';
import { userStorage } from '../utils/userStorage';
import { isLoggedIn } from '../utils/navigation';

const ManageAvailability: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState({
    sunday: { available: false, startTime: '08:00', endTime: '17:00' },
    monday: { available: true, startTime: '08:00', endTime: '17:00' },
    tuesday: { available: true, startTime: '08:00', endTime: '17:00' },
    wednesday: { available: true, startTime: '08:00', endTime: '17:00' },
    thursday: { available: true, startTime: '08:00', endTime: '17:00' },
    friday: { available: false, startTime: '08:00', endTime: '17:00' },
    saturday: { available: false, startTime: '08:00', endTime: '17:00' }
  });

  useEffect(() => {
    // Check if user is logged in and is a doctor
    if (!isLoggedIn()) {
      showToast('Please log in to manage availability', 'error');
      navigate('/login');
      return;
    }

    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Only show access denied if user data is properly loaded and user is not a doctor
        if (parsedUser && parsedUser.userType && parsedUser.userType !== 'doctor') {
          showToast('Access denied. Doctors only.', 'error');
          navigate('/');
          return;
        }
        setUser(parsedUser);
        
        // Load existing availability if it exists
        if (parsedUser.availability) {
          setAvailability(parsedUser.availability);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    }
    setLoading(false);
  }, [navigate, showToast]);

  const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    if (!user) return;

    try {
      // Update user data with new availability
      const allUsers = userStorage.getAllUsers();
      const userIndex = allUsers.findIndex(u => u.email === user.email);
      
      if (userIndex !== -1) {
        allUsers[userIndex] = {
          ...allUsers[userIndex],
          availability: availability
        };
        
        localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
        localStorage.setItem('userData', JSON.stringify(allUsers[userIndex]));
        
        showToast('Availability updated successfully!', 'success');
      } else {
        showToast('Error updating availability', 'error');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      showToast('Error saving availability', 'error');
    }
  };

  const handleQuickSet = (preset: string) => {
    let newAvailability = { ...availability };
    
    switch (preset) {
      case 'weekdays':
        newAvailability = {
          sunday: { available: false, startTime: '08:00', endTime: '17:00' },
          monday: { available: true, startTime: '08:00', endTime: '17:00' },
          tuesday: { available: true, startTime: '08:00', endTime: '17:00' },
          wednesday: { available: true, startTime: '08:00', endTime: '17:00' },
          thursday: { available: true, startTime: '08:00', endTime: '17:00' },
          friday: { available: false, startTime: '08:00', endTime: '17:00' },
          saturday: { available: false, startTime: '08:00', endTime: '17:00' }
        };
        break;
      case 'everyday':
        Object.keys(newAvailability).forEach(day => {
          newAvailability[day as keyof typeof newAvailability] = {
            available: true,
            startTime: '08:00',
            endTime: '17:00'
          };
        });
        break;
      case 'none':
        Object.keys(newAvailability).forEach(day => {
          newAvailability[day as keyof typeof newAvailability] = {
            available: false,
            startTime: '08:00',
            endTime: '17:00'
          };
        });
        break;
    }
    
    setAvailability(newAvailability);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Manage Availability
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>
            Set your weekly schedule and availability for patient appointments
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Quick Presets
          </h2>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => handleQuickSet('weekdays')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0fdfa',
                color: '#0d9488',
                border: '1px solid #0d9488',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0d9488';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0fdfa';
                e.currentTarget.style.color = '#0d9488';
              }}
            >
              Weekdays (Sun-Thu)
            </button>
            <button
              onClick={() => handleQuickSet('everyday')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0fdfa',
                color: '#0d9488',
                border: '1px solid #0d9488',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0d9488';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0fdfa';
                e.currentTarget.style.color = '#0d9488';
              }}
            >
              Every Day
            </button>
            <button
              onClick={() => handleQuickSet('none')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #dc2626',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '20px'
          }}>
            Weekly Schedule
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(availability).map(([day, schedule]) => (
              <div key={day} style={{
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '120px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={schedule.available}
                      onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#0d9488'
                      }}
                    />
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#374151',
                      textTransform: 'capitalize'
                    }}>
                      {day}
                    </span>
                  </label>
                  
                  {schedule.available && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: 1
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <label style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          From:
                        </label>
                        <input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <label style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          To:
                        </label>
                        <input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {!schedule.available && (
                    <span style={{
                      fontSize: '14px',
                      color: '#9ca3af',
                      fontStyle: 'italic',
                      flex: 1
                    }}>
                      Not available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <button
            onClick={handleSave}
            style={{
              padding: '12px 32px',
              backgroundColor: '#0d9488',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0f766e';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0d9488';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Save Availability
          </button>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '12px',
            margin: '12px 0 0 0'
          }}>
            Your availability will be visible to patients when booking appointments
          </p>
        </div>
      </div>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default ManageAvailability;