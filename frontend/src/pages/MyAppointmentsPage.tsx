import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackToTopButton from '../components/BackToTopButton';
import { appointmentStorage, Appointment } from '../utils/appointmentStorage';
import { userStorage } from '../utils/userStorage';
import { useToast } from '../components/Toast';
import { isLoggedIn } from '../utils/navigation';
import { reviewStorage } from '../utils/reviewStorage';
import EditReviewModal from '../components/EditReviewModal';

const MyAppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [cancelledAppointments, setCancelledAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [doctorInfo, setDoctorInfo] = useState<{ [key: string]: any }>({});

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
        loadUserReviews(parsedUser.id || parsedUser.email);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    }
    setLoading(false);
  }, [navigate, showToast]);

  const loadAppointments = (userId: string) => {
    const allAppointments = appointmentStorage.getPatientAppointments(userId);
    
    // Separate appointments by status
    const active = allAppointments.filter(apt => 
      apt.status === 'pending' || apt.status === 'confirmed'
    ).sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare === 0) {
        return a.time.localeCompare(b.time);
      }
      return dateCompare;
    });

    const completed = allAppointments.filter(apt => 
      apt.status === 'completed'
    ).sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date); // Most recent first
      if (dateCompare === 0) {
        return b.time.localeCompare(a.time);
      }
      return dateCompare;
    });

    const cancelled = allAppointments.filter(apt => 
      apt.status === 'cancelled' || apt.status === 'rejected'
    ).sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date); // Most recent first
      if (dateCompare === 0) {
        return b.time.localeCompare(a.time);
      }
      return dateCompare;
    });

    setActiveAppointments(active);
    setCompletedAppointments(completed);
    setCancelledAppointments(cancelled);
  };

  const loadUserReviews = (userId: string) => {
    try {
      // Get user's reviews
      const reviews = reviewStorage.getPatientReviews(userId);
      setUserReviews(reviews);

      // Load doctor information for reviews
      const userStorageData = localStorage.getItem('patientcare_users');
      if (userStorageData) {
        const users = JSON.parse(userStorageData);
        const doctorInfoMap: { [key: string]: any } = {};
        
        reviews.forEach(review => {
          const doctor = users.find((user: any) => 
            user.id === review.doctorId && user.userType === 'doctor'
          );
          
          if (doctor) {
            doctorInfoMap[review.doctorId] = {
              id: doctor.id,
              name: doctor.name,
              specialization: doctor.specialization || 'General Medicine'
            };
          }
        });
        
        setDoctorInfo(doctorInfoMap);
      }
    } catch (error) {
      console.error('Error loading user reviews:', error);
    }
  };

  const getUserReviewForDoctor = (doctorId: string) => {
    return userReviews.find(review => review.doctorId === doctorId);
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
  };

  const handleSaveReview = (updatedReview: any) => {
    // Update the reviews list with the updated review
    setUserReviews(userReviews.map(review => 
      review.id === updatedReview.id ? updatedReview : review
    ));
  };

  const handleCloseModal = () => {
    setEditingReview(null);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      if (await appointmentStorage.cancelAppointment(appointmentId, 'Cancelled by patient')) {
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

        {/* Patient Notes */}
        {appointment.notes && appointment.status !== 'completed' && (
          <div id={`notes-${appointment.id}`} style={{
            padding: '12px',
            backgroundColor: '#f8fafc',
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
              maxHeight: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              <strong>Your Notes:</strong> {appointment.notes}
            </p>
            {appointment.notes.length > 100 && (
              <button
                onClick={() => {
                  const element = document.getElementById(`notes-${appointment.id}`);
                  if (element) {
                    const p = element.querySelector('p');
                    if (p) {
                      if (p.style.maxHeight === '60px') {
                        p.style.maxHeight = 'none';
                        p.style.webkitLineClamp = 'unset';
                        element.querySelector('button')!.textContent = 'Show less';
                      } else {
                        p.style.maxHeight = '60px';
                        p.style.webkitLineClamp = '3';
                        element.querySelector('button')!.textContent = 'Show more';
                      }
                    }
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0d9488',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginTop: '4px',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Show more
              </button>
            )}
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
          


          {appointment.status === 'completed' && (() => {
            const existingReview = getUserReviewForDoctor(appointment.doctorId);
            const isEdit = !!existingReview;
            
            return (
              <button
                onClick={() => {
                  if (isEdit) {
                    handleEditReview(existingReview);
                  } else {
                    navigate(`/leave-review/${appointment.doctorId}`);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isEdit ? '#0f766e' : '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isEdit ? '#065f46' : '#0f766e';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isEdit ? '#0f766e' : '#0d9488';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z"/>
                </svg>
                {isEdit ? 'Edit Review' : 'Write Review'}
              </button>
            );
          })()}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
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
            <button
              onClick={() => navigate('/my-reviews')}
              style={{
                padding: '12px 20px',
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
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
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z"/>
              </svg>
              My Reviews
            </button>
          </div>
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
            onClick={() => setActiveTab('active')}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: activeTab === 'active' ? '#0d9488' : 'transparent',
              color: activeTab === 'active' ? 'white' : '#6b7280',
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
            Active
            <span style={{
              padding: '2px 8px',
              backgroundColor: activeTab === 'active' ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {activeAppointments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: activeTab === 'completed' ? '#0d9488' : 'transparent',
              color: activeTab === 'completed' ? 'white' : '#6b7280',
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
            Completed
            <span style={{
              padding: '2px 8px',
              backgroundColor: activeTab === 'completed' ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {completedAppointments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            style={{
              flex: 1,
              padding: '12px 24px',
              backgroundColor: activeTab === 'cancelled' ? '#0d9488' : 'transparent',
              color: activeTab === 'cancelled' ? 'white' : '#6b7280',
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
            Cancelled
            <span style={{
              padding: '2px 8px',
              backgroundColor: activeTab === 'cancelled' ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {cancelledAppointments.length}
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
          {activeTab === 'active' ? (
            activeAppointments.length === 0 ? (
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
                  No active appointments
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
                {activeAppointments.map(renderAppointmentCard)}
              </div>
            )
          ) : activeTab === 'completed' ? (
            completedAppointments.length === 0 ? (
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
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  No completed appointments
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280'
                }}>
                  Your completed appointments will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {completedAppointments.map(renderAppointmentCard)}
              </div>
            )
          ) : (
            cancelledAppointments.length === 0 ? (
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
                  No cancelled appointments
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Your cancelled and rejected appointments will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cancelledAppointments.map(renderAppointmentCard)}
              </div>
            )
          )}
        </div>
      </div>

      <Footer />
      <BackToTopButton />

      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          doctorName={doctorInfo[editingReview.doctorId]?.name || 'Doctor'}
          onClose={handleCloseModal}
          onSave={handleSaveReview}
        />
      )}
    </div>
  );
};

export default MyAppointmentsPage;