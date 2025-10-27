import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackToTopButton from '../components/BackToTopButton';
import { appointmentStorage, Appointment } from '../utils/appointmentStorage';
import { userStorage } from '../utils/userStorage';
import { useToast } from '../components/Toast';
import { isLoggedIn } from '../utils/navigation';

const MyAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'previous'>('upcoming');
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [previousAppointments, setPreviousAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      showToast('Please log in to view your appointments', 'error');
      navigate('/login');
      return;
    }

    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadAppointments(parsedUser.id || parsedUser.email);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    }
    setLoading(false);
  }, [navigate, showToast]);

  const loadAppointments = (userId: string) => {
    const allAppointments = appointmentStorage.getPatientAppointments(userId);
    
    // Separate upcoming and previous appointments
    const today = new Date().toISOString().split('T')[0];
    const upcoming = allAppointments.filter(apt => 
      apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed'
    ).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare === 0) {
        return a.time.localeCompare(b.time);
      }
      return dateCompare;
    });

    const previous = allAppointments.filter(apt => 
      apt.date < today || apt.status === 'completed' || apt.status === 'cancelled'
    ).sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date); // Most recent first
      if (dateCompare === 0) {
        return b.time.localeCompare(a.time);
      }
      return dateCompare;
    });

    setUpcomingAppointments(upcoming);
    setPreviousAppointments(previous);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      if (appointmentStorage.cancelAppointment(appointmentId, 'Cancelled by patient')) {
        showToast('Appointment cancelled successfully', 'info');
        loadAppointments(user.id || user.email);
      } else {
        showToast('Failed to cancel appointment', 'error');
      }
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: {
        label: 'Pending',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        tooltip: 'Awaiting doctor\'s confirmation'
      },
      confirmed: {
        label: 'Confirmed',
        color: '#10b981',
        bgColor: '#d1fae5',
        tooltip: 'Appointment confirmed by doctor'
      },
      rejected: {
        label: 'Rejected',
        color: '#ef4444',
        bgColor: '#fee2e2',
        tooltip: 'Doctor unavailable, please select another time'
      },
      completed: {
        label: 'Completed',
        color: '#6b7280',
        bgColor: '#f3f4f6',
        tooltip: 'Appointment finished'
      },
      cancelled: {
        label: 'Cancelled',
        color: '#ef4444',
        bgColor: '#fee2e2',
        tooltip: 'Appointment was cancelled'
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const getDoctorInfo = (doctorId: string) => {
    const allUsers = userStorage.getAllUsers();
    return allUsers.find(user => user.id === doctorId && user.userType === 'doctor');
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const statusInfo = getStatusInfo(appointment.status);
    const doctorInfo = getDoctorInfo(appointment.doctorId);

    return (
      <div
        key={appointment.id}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f3f4f6',
          transition: 'all 0.2s'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Doctor Avatar */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {doctorInfo?.profilePicture ? (
                <img 
                  src={doctorInfo.profilePicture} 
                  alt={appointment.doctorName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <span style={{
                  color: '#0d9488',
                  fontWeight: '600',
                  fontSize: '20px'
                }}>
                  {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>

            {/* Appointment Info */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 4px 0'
              }}>
                {appointment.doctorName}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#0d9488',
                fontWeight: '500',
                margin: '0 0 4px 0'
              }}>
                {doctorInfo?.specialization || 'General Medicine'}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <span>{formatDate(appointment.date)}</span>
                <span>•</span>
                <span>{formatTime(appointment.time)}</span>
                <span>•</span>
                <span>{appointment.duration} min</span>
                <span>•</span>
                <span>BHD {appointment.fee}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: statusInfo.bgColor,
                color: statusInfo.color,
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'help'
              }}
              title={statusInfo.tooltip}
            >
              {statusInfo.label}
            </div>
          </div>
        </div>

        {/* Appointment Type */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{
            padding: '4px 8px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'capitalize'
          }}>
            {appointment.type}
          </span>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0,
              fontStyle: 'italic'
            }}>
              <strong>Notes:</strong> {appointment.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end'
        }}>
          {appointment.status === 'pending' && (
            <button
              onClick={() => handleCancelAppointment(appointment.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fecaca';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
              }}
            >
              Cancel
            </button>
          )}
          
          {appointment.status === 'confirmed' && (
            <button
              onClick={() => showToast('Video call feature coming soon!', 'info')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0f766e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0d9488';
              }}
            >
              Join Call
            </button>
          )}

          {appointment.status === 'completed' && (
            <button
              onClick={() => showToast('Review feature coming soon!', 'info')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              Write Review
            </button>
          )}
        </div>
      </div>
    );
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
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading appointments...</div>
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
        maxWidth: '1200px',
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
            My Appointments
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>
            Manage your healthcare appointments and consultations
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '8px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          gap: '4px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: activeTab === 'upcoming' ? '#0d9488' : 'transparent',
              color: activeTab === 'upcoming' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Upcoming Appointments
            <span style={{
              padding: '2px 8px',
              backgroundColor: activeTab === 'upcoming' ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {upcomingAppointments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('previous')}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: activeTab === 'previous' ? '#0d9488' : 'transparent',
              color: activeTab === 'previous' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Previous Appointments
            <span style={{
              padding: '2px 8px',
              backgroundColor: activeTab === 'previous' ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {previousAppointments.length}
            </span>
          </button>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => {
              loadAppointments(user.id || user.email);
              showToast('Appointments refreshed', 'info');
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Appointments List */}
        <div>
          {activeTab === 'upcoming' ? (
            upcomingAppointments.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '48px 32px',
                textAlign: 'center',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <svg width="32" height="32" fill="#9ca3af" viewBox="0 0 24 24">
                    <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  No upcoming appointments
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  marginBottom: '24px'
                }}>
                  Book an appointment with a doctor to get started.
                </p>
                <button
                  onClick={() => navigate('/find-doctors')}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#0d9488',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
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
                  Find Doctors
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {upcomingAppointments.map(renderAppointmentCard)}
              </div>
            )
          ) : (
            previousAppointments.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '48px 32px',
                textAlign: 'center',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <svg width="32" height="32" fill="#9ca3af" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  No previous appointments
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Your completed and cancelled appointments will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {previousAppointments.map(renderAppointmentCard)}
              </div>
            )
          )}
        </div>
      </div>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default MyAppointmentsPage;