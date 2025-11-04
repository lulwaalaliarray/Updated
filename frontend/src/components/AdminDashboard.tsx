import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import { routes } from '../utils/navigation';
import { useToast } from './Toast';
import { appointmentStorage, Appointment } from '../utils/appointmentStorage';
import { appointmentManager } from '../utils/appointmentManager';

interface AdminDashboardProps {
  user: {
    name: string;
    email?: string;
    userType?: string;
    avatar?: string;
    specialization?: string;
    licenseNumber?: string;
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Load appointments data
  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user, selectedDate]);

  // Refresh data when component becomes visible (user returns from other pages)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        loadAppointments();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && user) {
        loadAppointments();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [user]);

  const loadAppointments = (dateToLoad?: string) => {
    const doctorId = (user as any).id || user.email;
    const targetDate = dateToLoad || selectedDate;
    
    // Get appointments for selected date
    const dateAppointments = appointmentStorage.getDoctorAppointmentsByDateAndStatus(doctorId, targetDate);
    setAppointments(dateAppointments);

    // Get pending appointments
    const allPending = appointmentStorage.getDoctorAppointments(doctorId)
      .filter(apt => apt.status === 'pending')
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare === 0) {
          return a.time.localeCompare(b.time);
        }
        return dateCompare;
      });
    setPendingAppointments(allPending);

    // Get past patients (completed appointments only)
    const pastAppointments = appointmentStorage.getPastAppointments(doctorId);
    setAllPatients(pastAppointments);
  };

  const handleApproveAppointment = (appointmentId: string) => {
    try {
      const userData = localStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.id || user?.email || '';
      
      const success = appointmentManager.updateAppointmentStatus(
        appointmentId,
        'confirmed',
        userId,
        'Appointment approved by admin'
      );
      
      if (success) {
        showToast('Appointment approved successfully', 'success');
        loadAppointments();
      } else {
        showToast('Failed to approve appointment', 'error');
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
      showToast('Error approving appointment', 'error');
    }
  };

  const handleDenyAppointment = (appointmentId: string) => {
    try {
      const userData = localStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.id || user?.email || '';
      
      const success = appointmentManager.updateAppointmentStatus(
        appointmentId,
        'rejected',
        userId,
        'Appointment declined by admin'
      );
      
      if (success) {
        showToast('Appointment declined', 'info');
        loadAppointments();
      } else {
        showToast('Failed to decline appointment', 'error');
      }
    } catch (error) {
      console.error('Error declining appointment:', error);
      showToast('Error declining appointment', 'error');
    }
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = newDate.toISOString().split('T')[0];
    setSelectedDate(dateString);
  };

  const getAppointmentCountForDate = (day: number) => {
    const doctorId = (user as any).id || user.email;
    const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    const dayAppointments = appointmentStorage.getDoctorAppointmentsByDateAndStatus(doctorId, dateString);
    return dayAppointments.length;
  };

  const isSelectedDate = (day: number) => {
    const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return dateString === selectedDate;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };



  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const quickActions = [
    {
      title: 'Manage Availability',
      description: 'Update schedule and availability',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
        </svg>
      ),
      action: () => navigate('/manage-availability')
    },

    {
      title: 'Write Prescription',
      description: 'Create new prescriptions',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22H9M10,16V19.08L13.08,16H20V4H4V16H10Z"/>
        </svg>
      ),
      action: () => navigate('/write-prescription')
    },
    {
      title: 'Create Blog Post',
      description: 'Share medical insights',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      ),
      action: () => navigate(routes.blog)
    }
  ];

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                {greeting}, {user.name}
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0
              }}>
                {formatDate(new Date(selectedDate))} • {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                padding: '12px 20px',
                backgroundColor: '#f0fdfa',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#0d9488',
                  margin: '0 0 4px 0'
                }}>
                  {appointments.filter(apt => apt.status === 'confirmed').length}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : 'Selected Day'} Confirmed
                </p>
              </div>
              <div style={{
                padding: '12px 20px',
                backgroundColor: '#fef3c7',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#d97706',
                  margin: '0 0 4px 0'
                }}>
                  {pendingAppointments.length}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Pending Approval
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth >= 1200 ? '1fr 400px' : '1fr',
          gap: '32px'
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Pending Appointments */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  {selectedDate === new Date().toISOString().split('T')[0] ? "Today's" : 'Selected Day'} Appointments
                </h2>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#f0fdfa',
                  color: '#0d9488',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {appointments.length} total
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointments.length === 0 ? (
                  <div style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    <p>No appointments for this date</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #fbbf24'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'white'
                          }}>
                            {appointment.patientName.charAt(0)}
                          </div>
                          <div>
                            <p style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#111827',
                              margin: '0 0 4px 0'
                            }}>
                              {appointment.patientName}
                            </p>
                            <p style={{
                              fontSize: '12px',
                              color: '#6b7280',
                              margin: 0
                            }}>
                              {appointment.type} • {appointment.duration} min • BHD {appointment.fee}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 4px 0'
                          }}>
                            {new Date(appointment.date).toLocaleDateString()} at {formatTime(appointment.time)}
                          </p>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div style={{
                          backgroundColor: '#f8fafc',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          margin: '8px 0 12px 0',
                          border: '1px solid #e5e7eb'
                        }}>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            margin: 0,
                            fontStyle: 'italic',
                            lineHeight: '1.3',
                            maxHeight: '32px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            <strong>Notes:</strong> {appointment.notes.length > 60 
                              ? `${appointment.notes.substring(0, 60).trim()}...` 
                              : appointment.notes}
                          </p>
                        </div>
                      )}
                      {appointment.status === 'pending' && (
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          justifyContent: 'flex-end',
                          marginTop: '12px'
                        }}>
                          <button
                            onClick={() => handleDenyAppointment(appointment.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              fontSize: '12px',
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
                            Deny
                          </button>
                          <button
                            onClick={() => handleApproveAppointment(appointment.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#0d9488',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
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
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Previous Patients */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  My Patients
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate('/appointments')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#0d9488',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    View All
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allPatients.length === 0 ? (
                  <div style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    <p style={{ marginBottom: '16px' }}>No patients have booked appointments yet</p>

                  </div>
                ) : (
                  allPatients.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#6366f1',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {appointment.patientName.charAt(0)}
                        </div>
                        <div>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 4px 0'
                          }}>
                            {appointment.patientName}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            margin: 0
                          }}>
                            {appointment.type} • BHD {appointment.fee}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: '0 0 4px 0'
                        }}>
                          {new Date(appointment.date).toLocaleDateString()}
                        </p>
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: appointment.status === 'completed' ? '#dcfce7' : '#f3f4f6',
                          color: appointment.status === 'completed' ? '#166534' : '#6b7280',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '20px'
              }}>
                Quick Actions
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdfa';
                      e.currentTarget.style.borderColor = '#0d9488';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ color: '#0d9488' }}>
                        {action.icon}
                      </div>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0
                      }}>
                        {action.title}
                      </h3>
                    </div>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Calendar */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            height: 'fit-content'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '16px'
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} style={{
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  {day}
                </div>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px'
            }}>
              {generateCalendarDays().map((day, index) => {
                const appointmentCount = day ? getAppointmentCountForDate(day) : 0;
                const isSelected = day ? isSelectedDate(day) : false;
                const isTodayDate = day ? isToday(day) : false;
                
                return (
                  <button
                    key={index}
                    onClick={() => day && handleDateSelect(day)}
                    disabled={!day}
                    style={{
                      padding: '8px 4px',
                      backgroundColor: 
                        isSelected ? '#0d9488' :
                        isTodayDate ? '#f0fdfa' :
                        'transparent',
                      color: 
                        isSelected ? 'white' :
                        isTodayDate ? '#0d9488' :
                        day ? '#111827' : 'transparent',
                      border: isTodayDate && !isSelected ? '1px solid #0d9488' : 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: day ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      position: 'relative',
                      minHeight: '36px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (day && !isSelected) {
                        e.currentTarget.style.backgroundColor = '#f0fdfa';
                        e.currentTarget.style.color = '#0d9488';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (day && !isSelected) {
                        e.currentTarget.style.backgroundColor = isTodayDate ? '#f0fdfa' : 'transparent';
                        e.currentTarget.style.color = isTodayDate ? '#0d9488' : '#111827';
                      }
                    }}
                  >
                    <span>{day}</span>
                    {day && appointmentCount > 0 && (
                      <div style={{
                        width: '6px',
                        height: '6px',
                        backgroundColor: isSelected ? 'white' : '#0d9488',
                        borderRadius: '50%',
                        marginTop: '2px'
                      }}></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Calendar Legend */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#0d9488',
                    borderRadius: '3px'
                  }}></div>
                  <span>Selected date</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#f0fdfa',
                    border: '1px solid #0d9488',
                    borderRadius: '3px'
                  }}></div>
                  <span>Today</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#0d9488',
                    borderRadius: '50%'
                  }}></div>
                  <span>Has appointments</span>
                </div>
              </div>
              <p style={{ margin: '8px 0 0 0', fontStyle: 'italic' }}>
                Click on any date to view appointments for that day
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default AdminDashboard;