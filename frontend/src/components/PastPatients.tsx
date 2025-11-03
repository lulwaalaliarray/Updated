import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useToast } from './Toast';
import { userStorage, User } from '../utils/userStorage';
import { appointmentStorage } from '../utils/appointmentStorage';
import { inputValidation } from '../utils/inputValidation';

const PastPatients: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current user information
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        loadPatientsWithAppointments(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        showToast('Error loading user data', 'error');
        setLoading(false);
      }
    } else {
      showToast('Please log in to view patients', 'error');
      navigate('/login');
    }
  }, [navigate, showToast]);

  const loadPatientsWithAppointments = (user: User) => {
    try {
      let patientsWithAppointments: User[] = [];
      
      if (user.userType === 'admin') {
        // Admin can see all patients with any appointments
        patientsWithAppointments = userStorage.getPatientsWithAppointments();
      } else if (user.userType === 'doctor') {
        // Doctor can only see patients with completed appointments with them
        const doctorId = user.id || user.email;
        patientsWithAppointments = userStorage.getDoctorPastPatients(doctorId);
      } else {
        // Patients shouldn't access this page
        showToast('Access denied', 'error');
        navigate('/dashboard');
        return;
      }
      
      setPatients(patientsWithAppointments);
    } catch (error) {
      console.error('Error loading patients:', error);
      showToast('Error loading patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPatientAppointmentCount = (patientId: string, patientEmail: string) => {
    if (!currentUser) return 0;
    
    const appointments = appointmentStorage.getAllAppointments();
    const doctorId = currentUser.id || currentUser.email;
    
    if (currentUser.userType === 'admin') {
      // Admin sees all appointments for this patient
      return appointments.filter(apt => 
        apt.patientId === patientId || apt.patientEmail === patientEmail
      ).length;
    } else {
      // Doctor sees only their completed appointments with this patient
      return appointments.filter(apt => 
        (apt.patientId === patientId || apt.patientEmail === patientEmail) &&
        apt.doctorId === doctorId &&
        apt.status === 'completed'
      ).length;
    }
  };

  const getLastAppointmentDate = (patientId: string, patientEmail: string) => {
    if (!currentUser) return null;
    
    const appointments = appointmentStorage.getAllAppointments();
    const doctorId = currentUser.id || currentUser.email;
    
    let patientAppointments;
    if (currentUser.userType === 'admin') {
      // Admin sees all appointments for this patient
      patientAppointments = appointments.filter(apt => 
        apt.patientId === patientId || apt.patientEmail === patientEmail
      );
    } else {
      // Doctor sees only their completed appointments with this patient
      patientAppointments = appointments.filter(apt => 
        (apt.patientId === patientId || apt.patientEmail === patientEmail) &&
        apt.doctorId === doctorId &&
        apt.status === 'completed'
      );
    }
    
    if (patientAppointments.length === 0) return null;
    
    const sortedAppointments = patientAppointments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedAppointments[0].date;
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpr.includes(searchTerm)
  );

  const handleViewPatientDetails = (patientId: string) => {
    navigate(`/patient-details/${patientId}`);
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
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading patients...</p>
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
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Past Patients
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280'
            }}>
              {currentUser?.userType === 'admin' 
                ? 'All patients who have booked appointments'
                : 'Patients who have completed appointments with you'
              }
            </p>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <svg style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                color: '#9ca3af'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or CPR..."
                value={searchTerm}
                onChange={(e) => inputValidation.handleTextInput(e, setSearchTerm, 'text')}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Patients List */}
          {filteredPatients.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 16px' }}>
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2M4 18v-4h3v4h2v-7.5c0-.83.67-1.5 1.5-1.5S12 9.67 12 10.5V11h2.5c.83 0 1.5.67 1.5 1.5V18h2v4H4v-4z"/>
              </svg>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                {searchTerm ? 'No patients found' : 'No patients with appointments yet'}
              </h3>
              <p>
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : currentUser?.userType === 'admin'
                  ? 'No patients have booked appointments yet.'
                  : 'Patients will appear here after you complete appointments with them.'
                }
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {filteredPatients.map((patient) => {
                const appointmentCount = getPatientAppointmentCount(patient.id, patient.email);
                const lastAppointment = getLastAppointmentDate(patient.id, patient.email);
                
                return (
                  <div
                    key={patient.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0d9488';
                      e.currentTarget.style.backgroundColor = '#f0fdfa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onClick={() => handleViewPatientDetails(patient.id)}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Patient Avatar */}
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: '#ecfdf5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{
                            color: '#0d9488',
                            fontWeight: '600',
                            fontSize: '16px'
                          }}>
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 4px 0'
                          }}>
                            {patient.name}
                          </h3>
                          <p style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: '0 0 4px 0'
                          }}>
                            {patient.email}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            margin: 0
                          }}>
                            CPR: {patient.cpr}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              fontSize: '20px',
                              fontWeight: '700',
                              color: '#0d9488'
                            }}>
                              {appointmentCount}
                            </div>
                            <div style={{ fontSize: '12px' }}>
                              Appointments
                            </div>
                          </div>
                          
                          {lastAppointment && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginBottom: '2px'
                              }}>
                                Last Visit
                              </div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#111827'
                              }}>
                                {new Date(lastAppointment).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Patient Status */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: patient.status === 'active' ? '#dcfce7' : '#fef3c7',
                          color: patient.status === 'active' ? '#059669' : '#d97706',
                          textTransform: 'capitalize'
                        }}>
                          {patient.status}
                        </span>
                        
                        {patient.phone && (
                          <span style={{
                            fontSize: '12px',
                            color: '#6b7280'
                          }}>
                            📞 {patient.phone}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPatientDetails(patient.id);
                        }}
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
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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

export default PastPatients;