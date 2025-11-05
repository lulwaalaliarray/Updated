import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes, isLoggedIn } from '../utils/navigation';
import { useToast } from './Toast';
import Header from './Header';
import Footer from './Footer';
import { appointmentStorage } from '../utils/appointmentStorage';
import { prescriptionStorage } from '../utils/prescriptionStorage';
import { userStorage } from '../utils/userStorage';
import { reviewStorage } from '../utils/reviewStorage';

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

  // Listen for logout events and redirect immediately
  useEffect(() => {
    const handleLogout = () => {
      navigate('/', { replace: true });
    };

    // Check if user is still logged in
    const checkAuth = () => {
      if (!isLoggedIn()) {
        navigate('/', { replace: true });
      }
    };

    // Check immediately
    checkAuth();

    window.addEventListener('userLogout', handleLogout);
    
    // Also check periodically
    const interval = setInterval(checkAuth, 500);
    
    return () => {
      window.removeEventListener('userLogout', handleLogout);
      clearInterval(interval);
    };
  }, [navigate]);
  
  // State for dashboard statistics
  const [monthlyStats, setMonthlyStats] = useState({
    appointmentsThisMonth: 0,
    prescriptionsThisMonth: 0,
    upcomingAppointments: 0,
    recentActivity: [] as Array<{
      type: 'appointment' | 'prescription';
      title: string;
      date: string;
      status?: string;
    }>
  });

  // State for review notifications (patients only)
  const [reviewNotifications, setReviewNotifications] = useState<Array<{
    appointmentId: string;
    doctorId: string;
    doctorName: string;
    date: string;
    type: string;
  }>>([]);

  // Calculate monthly statistics
  useEffect(() => {
    const calculateStats = () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Get current user data from localStorage to get the user ID
      const userData = localStorage.getItem('userData');
      let userId = user.email || '';
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          userId = parsedUser.id || parsedUser.email || '';
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      // Get all appointments and filter by user
      const allAppointments = appointmentStorage.getAllAppointments();
      const userAppointments = user.userType === 'admin'
        ? allAppointments // Admin sees all appointments
        : user.userType === 'doctor' 
        ? allAppointments.filter(apt => apt.doctorId === userId || apt.doctorName === user.name)
        : allAppointments.filter(apt => apt.patientId === userId || apt.patientEmail === user.email);
      
      // Filter appointments for current month
      const appointmentsThisMonth = userAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getMonth() === currentMonth && 
               aptDate.getFullYear() === currentYear;
      });

      // Get upcoming appointments
      const upcoming = userAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= currentDate && 
               (apt.status === 'confirmed' || apt.status === 'pending');
      });

      // Get prescriptions for all user types
      let prescriptionsThisMonth = 0;
      if (user.userType === 'admin') {
        // Admin sees all prescriptions
        const allPrescriptions = prescriptionStorage.getAllPrescriptions();
        prescriptionsThisMonth = allPrescriptions.filter(prescription => {
          const prescDate = new Date(prescription.dateIssued);
          return prescDate.getMonth() === currentMonth && 
                 prescDate.getFullYear() === currentYear;
        }).length;
      } else if (user.userType === 'doctor') {
        // Doctor sees prescriptions they wrote
        const allPrescriptions = prescriptionStorage.getAllPrescriptions();
        prescriptionsThisMonth = allPrescriptions.filter(prescription => {
          const prescDate = new Date(prescription.dateIssued);
          return prescription.doctorId === userId &&
                 prescDate.getMonth() === currentMonth && 
                 prescDate.getFullYear() === currentYear;
        }).length;
      } else {
        // Patient sees their own prescriptions
        const userPrescriptions = prescriptionStorage.getPatientPrescriptionsWithExpiration(userId);
        prescriptionsThisMonth = userPrescriptions.filter(prescription => {
          const prescDate = new Date(prescription.dateIssued);
          return prescDate.getMonth() === currentMonth && 
                 prescDate.getFullYear() === currentYear;
        }).length;
      }

      // Create recent activity feed
      const recentActivity: Array<{
        type: 'appointment' | 'prescription';
        title: string;
        date: string;
        status?: string;
      }> = [];

      // Add recent appointments
      const recentAppointments = userAppointments
        .filter(apt => new Date(apt.date) <= currentDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      recentAppointments.forEach(apt => {
        recentActivity.push({
          type: 'appointment',
          title: user.userType === 'doctor' 
            ? `Appointment with ${apt.patientName}`
            : `Appointment with ${apt.doctorName}`,
          date: apt.date,
          status: apt.status
        });
      });

      // Add recent prescriptions for all user types
      if (user.userType === 'admin') {
        // Admin sees all recent prescriptions
        const allPrescriptions = prescriptionStorage.getAllPrescriptions();
        const recentPrescriptions = allPrescriptions
          .sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime())
          .slice(0, 2);

        recentPrescriptions.forEach(prescription => {
          recentActivity.push({
            type: 'prescription',
            title: `Prescription: ${prescription.patientName} by ${prescription.doctorName}`,
            date: prescription.dateIssued,
            status: prescription.status
          });
        });
      } else if (user.userType === 'doctor') {
        // Doctor sees prescriptions they wrote
        const allPrescriptions = prescriptionStorage.getAllPrescriptions();
        const doctorPrescriptions = allPrescriptions
          .filter(prescription => prescription.doctorId === userId)
          .sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime())
          .slice(0, 2);

        doctorPrescriptions.forEach(prescription => {
          recentActivity.push({
            type: 'prescription',
            title: `Prescription for ${prescription.patientName}`,
            date: prescription.dateIssued,
            status: prescription.status
          });
        });
      } else {
        // Patient sees their own prescriptions
        const userPrescriptions = prescriptionStorage.getPatientPrescriptionsWithExpiration(userId);
        const recentPrescriptions = userPrescriptions
          .sort((a, b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime())
          .slice(0, 2);

        recentPrescriptions.forEach(prescription => {
          recentActivity.push({
            type: 'prescription',
            title: `Prescription from ${prescription.doctorName}`,
            date: prescription.dateIssued,
            status: prescription.status
          });
        });
      }

      // Sort recent activity by date
      recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setMonthlyStats({
        appointmentsThisMonth: appointmentsThisMonth.length,
        prescriptionsThisMonth,
        upcomingAppointments: upcoming.length,
        recentActivity: recentActivity.slice(0, 5)
      });

      // Calculate review notifications for patients
      if (user.userType === 'patient') {
        const completedAppointments = userAppointments.filter(apt => 
          apt.status === 'completed'
        );

        // Check which completed appointments don't have reviews yet
        const existingReviews = reviewStorage.getPatientReviews(userId);
        
        const appointmentsNeedingReviews = completedAppointments.filter(apt => {
          // Check if this appointment already has a review
          return !existingReviews.some((review: any) => 
            review.doctorId === apt.doctorId && 
            new Date(review.date).toDateString() === new Date(apt.date).toDateString()
          );
        }).slice(0, 3); // Limit to 3 most recent

        setReviewNotifications(appointmentsNeedingReviews.map(apt => ({
          appointmentId: apt.id,
          doctorId: apt.doctorId,
          doctorName: apt.doctorName,
          date: apt.date,
          type: apt.type
        })));
      }
    };

    calculateStats();
  }, [user]);

  // For doctors, show dashboard with admin-specific statistics
  // Note: PastPatients is accessible via navigation

  // For admin users, show admin-specific dashboard
  if (user.userType === 'admin') {
    // Admin users get different quick actions
  }



  const handleQuickAction = () => {
    showToast('Feature coming soon!', 'info');
  };

  // Define quick actions based on user type
  const getQuickActions = () => {
    // Admin-specific actions
    if (user.userType === 'admin') {
      return [
        {
          title: 'Previous Patients',
          description: 'View all patient records and history',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2M4 18v-4h3v4h2v-7.5c0-.83.67-1.5 1.5-1.5S12 9.67 12 10.5V11h2.5c.83 0 1.5.67 1.5 1.5V18h2v4H4v-4z"/>
            </svg>
          ),
          action: () => navigate('/past-patients')
        },

        {
          title: 'Write Prescription',
          description: 'Create prescriptions for patients',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          ),
          action: () => navigate('/write-prescription')
        },
        {
          title: 'Manage Availability',
          description: 'Set doctor schedules and manage availability',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
            </svg>
          ),
          action: () => navigate(routes.manageAvailability)
        },
        {
          title: 'User Management',
          description: 'Manage users and permissions',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/>
            </svg>
          ),
          action: () => handleQuickAction()
        },
        {
          title: 'Manage Blogs',
          description: 'Create and manage blog posts',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          ),
          action: () => navigate(routes.blog)
        },
        {
          title: 'System Analytics',
          description: 'View system performance and analytics',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
            </svg>
          ),
          action: () => handleQuickAction()
        }
      ];
    }

    const baseActions = [];

    // Only add Find Doctors and Medical Records for patients (not doctors)
    if (user.userType !== 'doctor') {
      baseActions.push(
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
          title: 'My Medical Records',
          description: 'View your personal health records',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          ),
          action: () => navigate(routes.records)
        }
      );
    }

    // Add My Appointments for all user types
    baseActions.push({
      title: 'My Appointments',
      description: 'View and manage appointments',
      icon: (
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
        </svg>
      ),
      action: () => navigate('/appointments')
    });

    // Add doctor-specific actions
    if (user.userType === 'doctor') {
      baseActions.push(
        {
          title: 'Manage Appointments',
          description: 'Review and approve patient appointments',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
            </svg>
          ),
          action: () => navigate('/manage-appointments')
        },

        {
          title: 'Manage Availability',
          description: 'Set your schedule and manage time off',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
            </svg>
          ),
          action: () => navigate(routes.manageAvailability)
        },
        {
          title: 'Manage Blog Posts',
          description: 'Create and manage your blog posts',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          ),
          action: () => navigate(routes.blog)
        }
      );
    } else {
      // Add patient-specific actions
      baseActions.push(
        {
          title: 'View Prescriptions',
          description: 'View your medical prescriptions',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          ),
          action: () => navigate('/prescriptions')
        },
        {
          title: 'My Reviews',
          description: 'View and manage your doctor reviews',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z"/>
            </svg>
          ),
          action: () => navigate(routes.myReviews)
        },
        {
          title: 'Health Blog',
          description: 'Read health tips and medical articles',
          icon: (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          ),
          action: () => navigate(routes.blog)
        }
      );
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

  // Don't render dashboard if user is not logged in
  if (!isLoggedIn()) {
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
                : user.userType === 'admin'
                ? 'Manage your healthcare system efficiently'
                : 'How can we help you with your healthcare today?'
              }
            </p>
          </div>

          {/* Doctor Profile Information */}
          {user.userType === 'doctor' && (() => {
            const userData = localStorage.getItem('userData');
            let doctorInfo = null;
            if (userData) {
              try {
                doctorInfo = JSON.parse(userData);
              } catch (error) {
                console.error('Error parsing user data:', error);
              }
            }
            
            return doctorInfo && (
              <div style={{
                backgroundColor: '#f0fdfa',
                border: '2px solid #14b8a6',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#0d9488',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#0d9488',
                    margin: 0
                  }}>
                    Doctor Profile Information
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      margin: '0 0 4px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Doctor ID
                    </p>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0,
                      fontFamily: 'monospace'
                    }}>
                      {doctorInfo.id}
                    </p>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      margin: '0 0 4px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      CPR Number
                    </p>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0,
                      fontFamily: 'monospace'
                    }}>
                      {userStorage.formatCPR(doctorInfo.cpr)}
                    </p>
                  </div>
                  {doctorInfo.specialization && (
                    <div>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#6b7280',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Specialization
                      </p>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0
                      }}>
                        {doctorInfo.specialization}
                      </p>
                    </div>
                  )}
                  {doctorInfo.consultationFee && (
                    <div>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#6b7280',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Consultation Fee
                      </p>
                      <p style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0
                      }}>
                        {doctorInfo.consultationFee} BHD
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

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

          {/* Monthly Activity Stats */}
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
                This Month's Activity
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2563eb',
                  margin: '0 0 4px 0'
                }}>
                  {monthlyStats.appointmentsThisMonth}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {user.userType === 'doctor' ? 'Patients Seen' : user.userType === 'admin' ? 'Total Appointments' : 'Appointments'}
                </p>
              </div>
              <div>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#059669',
                  margin: '0 0 4px 0'
                }}>
                  {user.userType === 'doctor' ? monthlyStats.upcomingAppointments : monthlyStats.prescriptionsThisMonth}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {user.userType === 'doctor' 
                    ? 'Upcoming Appointments' 
                    : user.userType === 'admin' 
                    ? 'Total Prescriptions' 
                    : 'Prescriptions'
                  }
                </p>
              </div>
              {user.userType === 'doctor' && (
                <div>
                  <p style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#f59e0b',
                    margin: '0 0 4px 0'
                  }}>
                    {monthlyStats.prescriptionsThisMonth}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Prescriptions Written
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
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
                backgroundColor: '#f3e8ff',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="#7c3aed" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>
                </svg>
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                Recent Activity
              </h3>
            </div>
            {monthlyStats.recentActivity.length === 0 ? (
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0,
                textAlign: 'center',
                padding: '20px 0'
              }}>
                No recent activity to display
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {monthlyStats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: activity.type === 'appointment' ? '#dbeafe' : '#dcfce7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {activity.type === 'appointment' ? (
                        <svg width="16" height="16" fill={activity.type === 'appointment' ? '#2563eb' : '#059669'} viewBox="0 0 24 24">
                          <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="#059669" viewBox="0 0 24 24">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827',
                        margin: '0 0 2px 0'
                      }}>
                        {activity.title}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {activity.status && (
                          <span style={{
                            marginLeft: '8px',
                            padding: '2px 6px',
                            backgroundColor: activity.status === 'completed' ? '#dcfce7' : '#fef3c7',
                            color: activity.status === 'completed' ? '#059669' : '#d97706',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500',
                            textTransform: 'capitalize'
                          }}>
                            {activity.status}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Review Notifications for Patients */}
        {user.userType === 'patient' && reviewNotifications.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '2px solid #fbbf24'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#fef3c7',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="#f59e0b" viewBox="0 0 24 24">
                  <path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z"/>
                </svg>
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  Share Your Experience
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Help other patients by reviewing your recent appointments
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviewNotifications.map((notification, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#fffbeb',
                    borderRadius: '12px',
                    border: '1px solid #fed7aa'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#0d9488',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '600'
                    }}>
                      {notification.doctorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 4px 0'
                      }}>
                        {notification.doctorName}
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {notification.type} • {new Date(notification.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/leave-review/${notification.doctorId}`)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#d97706';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f59e0b';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z"/>
                    </svg>
                    Write Review
                  </button>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#0369a1',
                margin: 0,
                textAlign: 'center'
              }}>
                💡 Your reviews help other patients make informed decisions and help doctors improve their services
              </p>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;