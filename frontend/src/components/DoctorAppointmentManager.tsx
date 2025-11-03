import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useToast } from './Toast';
import { appointmentStorage, Appointment } from '../utils/appointmentStorage';
import { appointmentManager } from '../utils/appointmentManager';
import { inputValidation } from '../utils/inputValidation';

const DoctorAppointmentManager: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled'>('pending');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedAppointmentForCompletion, setSelectedAppointmentForCompletion] = useState<Appointment | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState('');

  useEffect(() => {
    loadDoctorAppointments();
    
    // Listen for real-time appointment updates
    const handleAppointmentUpdate = () => {
      loadDoctorAppointments();
    };
    
    window.addEventListener('appointmentStatusChanged', handleAppointmentUpdate);
    
    return () => {
      window.removeEventListener('appointmentStatusChanged', handleAppointmentUpdate);
    };
  }, []);

  const loadDoctorAppointments = () => {
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
      const doctorAppointments = allAppointments.filter(
        apt => apt.doctorId === userId || apt.doctorName === user.name
      );
      
      // Sort by date (newest first)
      doctorAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAppointments(doctorAppointments);
      setLoading(false);
    } catch (error) {
      console.error('Error loading appointments:', error);
      showToast('Error loading appointments', 'error');
      setLoading(false);
    }
  };



  const handleCompleteAppointment = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setSelectedAppointmentForCompletion(appointment);
      setAppointmentDetails('');
      setShowCompleteModal(true);
    }
  };

  const handleViewPatientDetails = (appointment: Appointment) => {
    // Check if doctor has completed appointments with this patient
    const userData = localStorage.getItem('userData');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const doctorId = user.id || user.email;
    
    const allAppointments = appointmentStorage.getAllAppointments();
    const hasCompletedAppointment = allAppointments.some(apt => 
      (apt.patientId === appointment.patientId || apt.patientEmail === appointment.patientEmail) &&
      apt.doctorId === doctorId &&
      apt.status === 'completed'
    );
    
    if (!hasCompletedAppointment) {
      showToast('You can only view patient records after completing an appointment with them', 'info');
      return;
    }
    
    // Navigate to patient records - we'll create a route that shows records for this specific patient
    navigate(`/patient-records/${appointment.patientId || appointment.patientEmail}`);
  };

  const handleConfirmComplete = () => {
    if (!selectedAppointmentForCompletion) return;

    if (appointmentDetails.trim().length === 0) {
      showToast('Please add appointment details before completing', 'error');
      return;
    }

    if (appointmentDetails.length > 500) {
      showToast('Appointment details must not exceed 500 characters', 'error');
      return;
    }

    try {
      const userData = localStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.id || user?.email || '';
      
      const success = appointmentManager.updateAppointmentStatus(
        selectedAppointmentForCompletion.id,
        'completed',
        userId,
        appointmentDetails.trim()
      );
      
      if (success) {
        showToast('Appointment marked as completed with details', 'success');
        setShowCompleteModal(false);
        setSelectedAppointmentForCompletion(null);
        setAppointmentDetails('');
      } else {
        showToast('Failed to complete appointment', 'error');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      showToast('Error completing appointment', 'error');
    }
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
        'Appointment approved by doctor'
      );
      
      if (success) {
        showToast('Appointment approved successfully', 'success');
        loadDoctorAppointments();
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
        'Appointment declined by doctor'
      );
      
      if (success) {
        showToast('Appointment declined', 'info');
        loadDoctorAppointments();
      } else {
        showToast('Failed to decline appointment', 'error');
      }
    } catch (error) {
      console.error('Error declining appointment:', error);
      showToast('Error declining appointment', 'error');
    }
  };

  // Filter appointments based on active tab
  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 'pending':
        return appointments.filter(apt => apt.status === 'pending');
      case 'confirmed':
        return appointments.filter(apt => apt.status === 'confirmed');
      case 'completed':
        return appointments.filter(apt => apt.status === 'completed');
      case 'rejected':
        return appointments.filter(apt => apt.status === 'rejected');
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'cancelled');
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
      case 'rejected':
        return { bg: '#fee2e2', color: '#dc2626' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
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
              Manage Appointments
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Review and manage patient appointments
            </p>
            
            {/* Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '20px'
            }}>
              {[
                { 
                  label: 'Pending Approval', 
                  count: appointments.filter(a => a.status === 'pending').length,
                  color: '#d97706',
                  bg: '#fef3c7'
                },
                { 
                  label: 'Confirmed Today', 
                  count: appointments.filter(a => a.status === 'confirmed' && a.date === new Date().toISOString().split('T')[0]).length,
                  color: '#059669',
                  bg: '#dcfce7'
                },
                { 
                  label: 'Total Completed', 
                  count: appointments.filter(a => a.status === 'completed').length,
                  color: '#2563eb',
                  bg: '#dbeafe'
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: stat.bg,
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${stat.color}20`
                  }}
                >
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: stat.color,
                    marginBottom: '4px'
                  }}>
                    {stat.count}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ 
            marginBottom: '32px',
            borderBottom: '2px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
              {[
                { 
                  key: 'pending', 
                  label: 'Pending Approval', 
                  icon: '⏳',
                  count: appointments.filter(a => a.status === 'pending').length,
                  color: '#d97706'
                },
                { 
                  key: 'confirmed', 
                  label: 'Confirmed', 
                  icon: '✅',
                  count: appointments.filter(a => a.status === 'confirmed').length,
                  color: '#059669'
                },
                { 
                  key: 'completed', 
                  label: 'Completed', 
                  icon: '✔️',
                  count: appointments.filter(a => a.status === 'completed').length,
                  color: '#2563eb'
                },
                { 
                  key: 'rejected', 
                  label: 'Rejected', 
                  icon: '❌',
                  count: appointments.filter(a => a.status === 'rejected').length,
                  color: '#dc2626'
                },
                { 
                  key: 'cancelled', 
                  label: 'Cancelled', 
                  icon: '🚫',
                  count: appointments.filter(a => a.status === 'cancelled').length,
                  color: '#6b7280'
                }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled')}
                  style={{
                    padding: '16px 20px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderBottom: activeTab === tab.key ? `3px solid ${tab.color}` : '3px solid transparent',
                    color: activeTab === tab.key ? tab.color : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: activeTab === tab.key ? '600' : '500',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: 'fit-content'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.color = tab.color;
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.key) {
                      e.currentTarget.style.color = '#6b7280';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span style={{
                    backgroundColor: activeTab === tab.key ? tab.color : '#e5e7eb',
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
                backgroundColor: '#f3f4f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                No {activeTab} appointments
              </h3>
              <p>
                {activeTab === 'pending' && 'No appointments awaiting your approval. New appointment requests will appear here.'}
                {activeTab === 'confirmed' && 'No confirmed appointments at the moment. Approved appointments will be shown here.'}
                {activeTab === 'completed' && 'No completed appointments yet. Finished consultations will be listed here.'}
                {activeTab === 'rejected' && 'No rejected appointments. Appointments you decline will appear here.'}
                {activeTab === 'cancelled' && 'No cancelled appointments. Patient-cancelled appointments will be shown here.'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {filteredAppointments.map((appointment) => {
                const statusStyle = getStatusColor(appointment.status);
                const isUpcoming = new Date(appointment.date) > new Date();
                
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
                            {appointment.patientName}
                          </h3>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            textTransform: 'capitalize',
                            border: `1px solid ${statusStyle.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>
                              {appointment.status === 'pending' && '⏳'}
                              {appointment.status === 'confirmed' && '✅'}
                              {appointment.status === 'completed' && '✔️'}
                              {appointment.status === 'rejected' && '❌'}
                              {appointment.status === 'cancelled' && '🚫'}
                            </span>
                            {appointment.status}
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
                            <span>{appointment.duration || 30} min</span>
                          </div>
                          
                          {isUpcoming && (
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
                          {appointment.fee} BHD
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
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }}>
                        <p style={{
                          fontSize: '14px',
                          color: '#374151',
                          margin: 0
                        }}>
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      {/* View Patient Details Button - Always visible */}
                      <button
                        onClick={() => handleViewPatientDetails(appointment)}
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
                          e.currentTarget.style.borderColor = '#0d9488';
                          e.currentTarget.style.color = '#0d9488';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        View Patient Details
                      </button>

                      {appointment.status === 'pending' && (
                        <div style={{
                          display: 'flex',
                          gap: '8px'
                        }}>
                          <button
                            onClick={() => handleDenyAppointment(appointment.id)}
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
                            Deny
                          </button>
                          <button
                            onClick={() => handleApproveAppointment(appointment.id)}
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
                            Approve
                          </button>
                        </div>
                      )}
                      
                      {appointment.status === 'confirmed' && isUpcoming && (
                        <button
                          onClick={() => handleCompleteAppointment(appointment.id)}
                          style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1d4ed8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                          }}
                        >
                          Mark as Completed
                        </button>
                      )}
                      
                      {(appointment.status === 'rejected' || appointment.status === 'cancelled') && (
                        <div style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          fontSize: '14px',
                          fontWeight: '500',
                          border: '1px solid #d1d5db'
                        }}>
                          {appointment.status === 'rejected' ? 'Declined by Doctor' : 'Cancelled by Patient'}
                        </div>
                      )}
                      
                      {appointment.status === 'completed' && (
                        <div style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          backgroundColor: '#dbeafe',
                          color: '#2563eb',
                          fontSize: '14px',
                          fontWeight: '500',
                          border: '1px solid #93c5fd',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>✔️</span>
                          Consultation Completed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Complete Appointment Modal */}
      {showCompleteModal && selectedAppointmentForCompletion && (
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
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
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
                Complete Appointment
              </h2>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedAppointmentForCompletion(null);
                  setAppointmentDetails('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Appointment Info */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px'
              }}>
                Appointment Details
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Patient: </span>
                  <span style={{ fontSize: '14px', color: '#111827' }}>{selectedAppointmentForCompletion.patientName}</span>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Date: </span>
                  <span style={{ fontSize: '14px', color: '#111827' }}>
                    {new Date(selectedAppointmentForCompletion.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Time: </span>
                  <span style={{ fontSize: '14px', color: '#111827' }}>{selectedAppointmentForCompletion.time}</span>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Type: </span>
                  <span style={{ fontSize: '14px', color: '#111827' }}>
                    {selectedAppointmentForCompletion.type.charAt(0).toUpperCase() + selectedAppointmentForCompletion.type.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Details Form */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Appointment Summary *
              </label>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '12px'
              }}>
                Please provide a brief summary of the appointment, diagnosis, treatment, or recommendations (max 500 characters).
              </p>
              <textarea
                value={appointmentDetails}
                onChange={(e) => {
                  const value = e.target.value;
                  const sanitizedValue = inputValidation.sanitizeMedicalText(value);
                  if (sanitizedValue.length <= 500) {
                    setAppointmentDetails(sanitizedValue);
                  }
                }}
                placeholder="e.g., Patient presented with chest pain. Conducted ECG and blood tests. Diagnosed with mild anxiety. Prescribed medication and recommended lifestyle changes. Follow-up in 2 weeks."
                rows={6}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${appointmentDetails.length > 500 ? '#dc2626' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = appointmentDetails.length > 500 ? '#dc2626' : '#0d9488';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = appointmentDetails.length > 500 ? '#dc2626' : '#d1d5db';
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  This information will be saved with the appointment record
                </p>
                <p style={{
                  fontSize: '12px',
                  color: appointmentDetails.length > 500 ? '#dc2626' : appointmentDetails.length > 450 ? '#f59e0b' : '#6b7280',
                  margin: 0,
                  fontWeight: appointmentDetails.length > 450 ? '600' : '400'
                }}>
                  {appointmentDetails.length}/500 characters
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedAppointmentForCompletion(null);
                  setAppointmentDetails('');
                }}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
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
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                disabled={appointmentDetails.trim().length === 0 || appointmentDetails.length > 500}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: appointmentDetails.trim().length === 0 || appointmentDetails.length > 500 ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: appointmentDetails.trim().length === 0 || appointmentDetails.length > 500 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (appointmentDetails.trim().length > 0 && appointmentDetails.length <= 500) {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (appointmentDetails.trim().length > 0 && appointmentDetails.length <= 500) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
              >
                Complete Appointment
              </button>
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
        `}
      </style>
    </div>
  );
};

export default DoctorAppointmentManager;