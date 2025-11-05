import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useToast } from './Toast';
import { prescriptionStorage } from '../utils/prescriptionStorage';
import { appointmentStorage } from '../utils/appointmentStorage';

interface MedicalRecord {
  id: string;
  date: string;
  type: 'appointment' | 'prescription';
  title: string;
  doctor: string;
  details: string;
  status?: string;
}

const PersonalMedicalRecords: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'appointments' | 'prescriptions'>('all');

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  const loadMedicalRecords = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        showToast('Please log in to view your medical records', 'error');
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      const userId = parsedUser.id || parsedUser.email;

      // Get patient's appointments
      const allAppointments = appointmentStorage.getAllAppointments();
      const userAppointments = allAppointments.filter(
        apt => apt.patientId === userId || apt.patientEmail === parsedUser.email
      );

      // Get patient's prescriptions
      const userPrescriptions = prescriptionStorage.getPatientPrescriptionsWithExpiration(userId);

      // Combine into medical records
      const medicalRecords: MedicalRecord[] = [];

      // Add appointments as medical records
      userAppointments.forEach(appointment => {
        medicalRecords.push({
          id: `apt-${appointment.id}`,
          date: appointment.date,
          type: 'appointment',
          title: `${appointment.type} Appointment`,
          doctor: `Dr. ${appointment.doctorName}`,
          details: appointment.notes || 'No additional notes',
          status: appointment.status
        });
      });

      // Add prescriptions as medical records
      userPrescriptions.forEach(prescription => {
        const medicationList = prescription.medications.map(med => med.name).join(', ');
        medicalRecords.push({
          id: `presc-${prescription.id}`,
          date: prescription.dateIssued,
          type: 'prescription',
          title: `Prescription: ${medicationList}`,
          doctor: `Dr. ${prescription.doctorName}`,
          details: prescription.diagnosis || 'No diagnosis provided',
          status: prescription.status
        });
      });

      // Sort by date (newest first)
      medicalRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setRecords(medicalRecords);
      setLoading(false);
    } catch (error) {
      console.error('Error loading medical records:', error);
      showToast('Error loading medical records', 'error');
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    if (filterType === 'all') return true;
    return record.type === filterType.slice(0, -1); // Remove 's' from 'appointments'/'prescriptions'
  });

  const getRecordIcon = (type: string) => {
    if (type === 'appointment') {
      return (
        <svg width="20" height="20" fill="#2563eb" viewBox="0 0 24 24">
          <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" fill="#059669" viewBox="0 0 24 24">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      );
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: '#dcfce7', color: '#059669' };
      case 'active':
        return { bg: '#dcfce7', color: '#059669' };
      case 'pending':
        return { bg: '#fef3c7', color: '#d97706' };
      case 'cancelled':
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
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading your medical records...</p>
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
          {/* Header Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#0d9488',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                {user?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 4px 0'
                }}>
                  My Medical Records
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {user?.name} - Personal Health History
                </p>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All Records', count: records.length },
              { key: 'appointments', label: 'Appointments', count: records.filter(r => r.type === 'appointment').length },
              { key: 'prescriptions', label: 'Prescriptions', count: records.filter(r => r.type === 'prescription').length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: filterType === filter.key ? '#0d9488' : 'white',
                  color: filterType === filter.key ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (filterType !== filter.key) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterType !== filter.key) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          {/* Records List */}
          {filteredRecords.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 16px' }}>
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                No medical records found
              </h3>
              <p>You don't have any medical records matching the selected filter.</p>
              <button
                onClick={() => navigate('/doctors')}
                style={{
                  marginTop: '16px',
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
                Find a Doctor
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {filteredRecords.map((record) => {
                const statusStyle = getStatusColor(record.status);
                
                return (
                  <div
                    key={record.id}
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
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: record.type === 'appointment' ? '#dbeafe' : '#dcfce7',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {getRecordIcon(record.type)}
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 4px 0'
                          }}>
                            {record.title}
                          </h3>
                          <p style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: 0
                          }}>
                            {record.doctor} • {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {record.status && (
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          textTransform: 'capitalize'
                        }}>
                          {record.status}
                        </span>
                      )}
                    </div>
                    
                    <div style={{
                      backgroundColor: 'white',
                      padding: '12px',
                      borderRadius: '8px'
                    }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#374151',
                        margin: 0,
                        lineHeight: '1.5'
                      }}>
                        {record.details}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary Stats */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '12px'
            }}>
              Health Summary
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2563eb',
                  margin: '0 0 4px 0'
                }}>
                  {records.filter(r => r.type === 'appointment').length}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Total Appointments
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#059669',
                  margin: '0 0 4px 0'
                }}>
                  {records.filter(r => r.type === 'prescription').length}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Total Prescriptions
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#f59e0b',
                  margin: '0 0 4px 0'
                }}>
                  {records.length > 0 ? new Date(records[0].date).getFullYear() : 'N/A'}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Latest Record
                </p>
              </div>
            </div>
          </div>
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

export default PersonalMedicalRecords;