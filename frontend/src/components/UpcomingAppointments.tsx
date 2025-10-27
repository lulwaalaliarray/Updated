import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import { appointmentStorage, Appointment } from '../utils/appointmentStorage';
import { useToast } from './Toast';
import { isLoggedIn } from '../utils/navigation';

const UpcomingAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is a doctor
    if (!isLoggedIn()) {
      showToast('Please log in to view appointments', 'error');
      navigate('/login');
      return;
    }

    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.userType !== 'doctor') {
          showToast('Access denied. Doctors only.', 'error');
          navigate('/');
          return;
        }
        setUser(parsedUser);
        loadUpcomingAppointments(parsedUser.id || parsedUser.email);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    }
    setLoading(false);
  }, [navigate, showToast]);

  const loadUpcomingAppointments = (doctorId: string) => {
    const appointments = appointmentStorage.getUpcomingAppointments(doctorId);
    setUpcomingAppointments(appointments);
  };

  const handleAcceptAppointment = (appointmentId: string) => {
    if (appointmentStorage.confirmAppointment(appointmentId)) {
      showToast('Appointment accepted successfully', 'success');
      loadUpcomingAppointments(user.id || user.email);
    } else {
      showToast('Failed to accept appointment', 'error');
    }
  };

  const handleRejectAppointment = (appointmentId: string) => {
    if (appointmentStorage.updateAppointment(appointmentId, { status: 'rejected' })) {
      showToast('Appointment rejected', 'info');
      loadUpcomingAppointments(user.id || user.email);
    } else {
      showToast('Failed to reject appointment', 'error');
    }
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    if (appointmentStorage.completeAppointment(appointmentId)) {
      showToast('Appointment marked as completed', 'success');
      loadUpcomingAppointments(user.id || user.email);
    } else {
      showToast('Failed to complete appointment', 'error');
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    if (appointmentStorage.cancelAppointment(appointmentId, 'Cancelled by doctor')) {
      showToast('Appointment cancelled', 'info');
      loadUpcomingAppointments(user.id || user.email);
    } else {
      showToast('Failed to cancel appointment', 'error');
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
        day: 'numeric'
      });
    }
  };

  const getAppointmentsByDate = () => {
    const grouped: { [key: string]: Appointment[] } = {};
    upcomingAppointments.forEach(appointment => {
      if (!grouped[appointment.date]) {
        grouped[appointment.date] = [];
      }
      grouped[appointment.date].push(appointment);
    });
    
    // Sort dates
    const sortedDates = Object.keys(grouped).sort();
    return sortedDates.map(date => ({
      date,
      appointments: grouped[date].sort((a, b) => a.time.localeCompare(b.time))
    }));
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
            Manage your scheduled appointments and patient consultations
          </p>
        </div>

        {/* Appointments List */}
        {upcomingAppointments.length === 0 ? (
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
              margin: 0
            }}>
              Your schedule is clear. New appointment requests will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {getAppointmentsByDate().map(({ date, appointments }) => (
              <div key={date} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{formatDate(date)}</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '400'
                  }}>
                    ({appointments.length} appointment{appointments.length !== 1 ? 's' : ''})
                  </span>
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {appointments.map((appointment) => (
                    <div key={appointment.id} style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      border: `2px solid ${
                        appointment.status === 'confirmed' ? '#dcfce7' : 
                        appointment.status === 'pending' ? '#fef3c7' : '#f3f4f6'
                      }`
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: appointment.status === 'confirmed' ? '#0d9488' : '#f59e0b',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: '600',
                            color: 'white'
                          }}>
                            {appointment.patientName.charAt(0)}
                          </div>
                          <div>
                            <h3 style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#111827',
                              margin: '0 0 4px 0'
                            }}>
                              {appointment.patientName}
                            </h3>
                            <p style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              margin: '0 0 4px 0'
                            }}>
                              {appointment.patientEmail}
                            </p>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '14px',
                              color: '#6b7280'
                            }}>
                              <span>{formatTime(appointment.time)}</span>
                              <span>•</span>
                              <span>{appointment.duration} min</span>
                              <span>•</span>
                              <span>{appointment.type}</span>
                              <span>•</span>
                              <span>BHD {appointment.fee}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '4px 12px',
                            backgroundColor: 
                              appointment.status === 'confirmed' ? '#dcfce7' : 
                              appointment.status === 'pending' ? '#fef3c7' : '#f3f4f6',
                            color: 
                              appointment.status === 'confirmed' ? '#166534' : 
                              appointment.status === 'pending' ? '#92400e' : '#6b7280',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            textTransform: 'capitalize'
                          }}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div style={{
                          padding: '12px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '8px',
                          marginBottom: '12px'
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

                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'flex-end',
                        flexWrap: 'wrap'
                      }}>
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAcceptAppointment(appointment.id)}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#bbf7d0';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#dcfce7';
                              }}
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleRejectAppointment(appointment.id)}
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
                              ✗ Reject
                            </button>
                          </>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleCompleteAppointment(appointment.id)}
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
                              Mark Complete
                            </button>
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
                          </>
                        )}

                        {(appointment.status === 'rejected' || appointment.status === 'completed') && (
                          <div style={{
                            padding: '8px 16px',
                            backgroundColor: '#f3f4f6',
                            color: '#6b7280',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            {appointment.status === 'rejected' ? 'Rejected' : 'Completed'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default UpcomingAppointments;