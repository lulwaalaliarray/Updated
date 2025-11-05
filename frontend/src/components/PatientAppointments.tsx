import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useToast } from './Toast';
import { appointmentStorage } from '../utils/appointmentStorage';
import { appointmentManager } from '../utils/appointmentManager';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes?: string;
}

const PatientAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
    
    // Listen for real-time appointment updates
    const handleAppointmentUpdate = () => {
      loadAppointments(); // Reload appointments to reflect changes
    };
    
    window.addEventListener('appointmentStatusChanged', handleAppointmentUpdate as EventListener);
    
    return () => {
      window.removeEventListener('appointmentStatusChanged', handleAppointmentUpdate as EventListener);
    };
  }, []);

  const loadAppointments = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        showToast('Please log in to view appointments', 'error');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id || user.email;
      
      const allAppointments = appointmentStorage.getAllAppointments();
      const userAppointments = allAppointments.filter(
        apt => apt.patientId === userId || apt.patientEmail === user.email
      );
      
      // Sort by date (newest first)
      userAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAppointments(userAppointments);
      setLoading(false);
    } catch (error) {
      console.error('Error loading appointments:', error);
      showToast('Error loading appointments', 'error');
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const userData = localStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.id || user?.email || '';
      
      const success = await appointmentManager.updateAppointmentStatus(
        appointmentId, 
        'cancelled', 
        userId,
        'Cancelled by patient'
      );
      
      if (success) {
        showToast('Appointment cancelled successfully', 'success');
        // No need to reload manually - real-time update will handle it
      } else {
        showToast('Failed to cancel appointment', 'error');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showToast('Error cancelling appointment', 'error');
    }
  };

  const handleRescheduleAppointment = (_appointmentId: string) => {
    // In a real app, this would open a reschedule modal
    showToast('Reschedule feature coming soon!', 'info');
  };

  // Filter appointments based on active tab
  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 'pending':
        return appointments.filter(apt => apt.status === 'pending');
      case 'approved':
        return appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'completed');
      case 'rejected':
        return appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'rejected');
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return { bg: '#dcfce7', color: '#059669' };
      case 'pending':
        return { bg: '#fef3c7', color: '#d97706' };
      case 'completed':
        return { bg: '#dbeafe', color: '#2563eb' };
      case 'cancelled':
        return { bg: '#fee2e2', color: '#dc2626' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const canCancel = (appointment: Appointment) => {
    return isUpcoming(appointment.date) && 
           (appointment.status === 'confirmed' || appointment.status === 'pending');
  };

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
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading appointments...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '32px' }}>
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
              color: '#6b7280'
            }}>
              View and manage your medical appointments organized by status
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{ 
            marginBottom: '32px',
            borderBottom: '2px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', gap: '0' }}>
              {[
                { key: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length },
                { key: 'approved', label: 'Approved', count: appointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length },
                { key: 'rejected', label: 'Rejected', count: appointments.filter(a => a.status === 'cancelled' || a.status === 'rejected').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'pending' | 'approved' | 'rejected')}
                  style={{
                    padding: '16px 24px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderBottom: activeTab === tab.key ? '3px solid #0d9488' : '3px solid transparent',
                    color: activeTab === tab.key ? '#0d9488' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: activeTab === tab.key ? '600' : '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.color = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.color = '#6b7280';
                    }
                  }}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    backgroundColor: activeTab === tab.key ? '#0d9488' : '#e5e7eb',
                    color: activeTab === tab.key ? 'white' : '#6b7280',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 
                  activeTab === 'pending' ? '#fef3c7' :
                  activeTab === 'approved' ? '#dcfce7' : '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {activeTab === 'pending' && (
                  <svg width="12" height="12" fill="#d97706" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                  </svg>
                )}
                {activeTab === 'approved' && (
                  <svg width="12" height="12" fill="#059669" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                  </svg>
                )}
                {activeTab === 'rejected' && (
                  <svg width="12" height="12" fill="#dc2626" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M14.5,9L13.09,7.59L12,8.67L10.91,7.59L9.5,9L10.59,10.09L9.5,11.17L10.91,12.59L12,11.5L13.09,12.59L14.5,11.17L13.41,10.09L14.5,9Z"/>
                  </svg>
                )}
              </div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                margin: 0,
                textTransform: 'capitalize'
              }}>
                {activeTab} Appointments
              </h2>
              <span style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                ({filteredAppointments.length} {filteredAppointments.length === 1 ? 'appointment' : 'appointments'})
              </span>
            </div>
            
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              {activeTab === 'pending' && 'Appointments awaiting doctor approval'}
              {activeTab === 'approved' && 'Confirmed and completed appointments'}
              {activeTab === 'rejected' && 'Cancelled or declined appointments'}
            </p>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 
                  activeTab === 'pending' ? '#fef3c7' :
                  activeTab === 'approved' ? '#dcfce7' : '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <svg width="40" height="40" fill={
                  activeTab === 'pending' ? '#d97706' :
                  activeTab === 'approved' ? '#059669' : '#dc2626'
                } viewBox="0 0 24 24">
                  <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                No {activeTab} appointments
              </h3>
              <p style={{ marginBottom: '24px' }}>
                {activeTab === 'pending' && 'You don\'t have any appointments awaiting approval.'}
                {activeTab === 'approved' && 'You don\'t have any confirmed appointments yet.'}
                {activeTab === 'rejected' && 'You don\'t have any cancelled appointments.'}
              </p>
              {activeTab !== 'rejected' && (
                <button
                  onClick={() => navigate('/doctors')}
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
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0d9488';
                  }}
                >
                  Book New Appointment
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {filteredAppointments.map((appointment) => {
                const statusStyle = getStatusColor(appointment.status);
                const upcoming = isUpcoming(appointment.date);
                
                return (
                  <div
                    key={appointment.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: 0
                          }}>
                            Dr. {appointment.doctorName}
                          </h3>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            textTransform: 'capitalize'
                          }}>
                            {appointment.status === 'confirmed' ? 'Approved' : 
                             appointment.status === 'cancelled' ? 'Rejected' :
                             appointment.status === 'rejected' ? 'Rejected' :
                             appointment.status}
                          </span>
                        </div>
                        
                        <p style={{
                          fontSize: '14px',
                          color: '#0d9488',
                          margin: '0 0 8px 0',
                          fontWeight: '500'
                        }}>
                          {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Appointment
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                            </svg>
                            <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,6V12L16.5,16.5L15.08,17.92L10,12.83V6H12Z"/>
                            </svg>
                            <span>{appointment.time}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,6V12L16.5,16.5L15.08,17.92L10,12.83V6H12Z"/>
                            </svg>
                            <span>30 min</span>
                          </div>
                          
                          {upcoming && (
                            <span style={{
                              color: '#059669',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/>
                              </svg>
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#111827',
                          marginBottom: '4px'
                        }}>
                          25 BHD
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          Consultation Fee
                        </div>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: 0,
                          fontStyle: 'italic',
                          lineHeight: '1.4',
                          maxHeight: '42px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          <strong>Notes:</strong> {appointment.notes.length > 80 
                            ? `${appointment.notes.substring(0, 80).trim()}...` 
                            : appointment.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: 'white',
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        View Details
                      </button>
                      
                      {canCancel(appointment) && (
                        <>
                          <button
                            onClick={() => handleRescheduleAppointment(appointment.id)}
                            style={{
                              padding: '8px 16px',
                              border: '1px solid #0d9488',
                              borderRadius: '6px',
                              backgroundColor: 'white',
                              color: '#0d9488',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f0fdfa';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            Reschedule
                          </button>
                          
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            style={{
                              padding: '8px 16px',
                              border: '1px solid #dc2626',
                              borderRadius: '6px',
                              backgroundColor: 'white',
                              color: '#dc2626',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/leave-review/${appointment.doctorId}`)}
                          style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            position: 'relative',
                            boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#d97706';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f59e0b';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.3)';
                          }}
                        >
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z"/>
                          </svg>
                          Leave Review
                          <span style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#dc2626',
                            borderRadius: '50%',
                            border: '2px solid white',
                            animation: 'pulse 2s infinite'
                          }}></span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>
                Appointment Details
              </h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Doctor
                </label>
                <p style={{ fontSize: '16px', color: '#111827', margin: '4px 0 0 0' }}>
                  Dr. {selectedAppointment.doctorName}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Date
                  </label>
                  <p style={{ fontSize: '16px', color: '#111827', margin: '4px 0 0 0' }}>
                    {new Date(selectedAppointment.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Time
                  </label>
                  <p style={{ fontSize: '16px', color: '#111827', margin: '4px 0 0 0' }}>
                    {selectedAppointment.time}
                  </p>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Appointment Type
                </label>
                <p style={{ fontSize: '16px', color: '#111827', margin: '4px 0 0 0' }}>
                  {selectedAppointment.type}
                </p>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Status
                </label>
                <p style={{ fontSize: '16px', color: '#111827', margin: '4px 0 0 0' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(selectedAppointment.status).bg,
                    color: getStatusColor(selectedAppointment.status).color,
                    textTransform: 'capitalize'
                  }}>
                    {selectedAppointment.status}
                  </span>
                </p>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Notes
                  </label>
                  <p style={{ fontSize: '16px', color: '#111827', margin: '4px 0 0 0' }}>
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default PatientAppointments;