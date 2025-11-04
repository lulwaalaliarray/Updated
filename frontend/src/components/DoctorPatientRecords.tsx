import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientRecord, patientRecordsStorage } from '../utils/patientRecordsStorage';
import { inputValidation } from '../utils/inputValidation';
import Header from './Header';
import Footer from './Footer';


interface DoctorPatientRecordsProps {
  doctorId: string;
}

// Helper function to get patients the doctor has appointments with
const getSeenPatientIds = (doctorId: string): string[] => {
  const appointments = JSON.parse(localStorage.getItem('patientcare_appointments') || '[]');
  const doctorAppointments = appointments.filter((apt: any) => apt.doctorId === doctorId);
  return [...new Set(doctorAppointments.map((apt: any) => apt.patientId || apt.patientEmail))] as string[];
};

const DoctorPatientRecords: React.FC<DoctorPatientRecordsProps> = ({ doctorId }) => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [isViewingSinglePatient, setIsViewingSinglePatient] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [doctorId]);

  const loadPatients = () => {
    setLoading(true);
    
    try {
      // Initialize data
      const { appointmentStorage } = require('../utils/appointmentStorage');
      let allAppointments = appointmentStorage.getAllAppointments();

      // Force refresh data if no appointments exist
      if (allAppointments.length === 0) {
        appointmentStorage.refreshAppointments();
        allAppointments = appointmentStorage.getAllAppointments();
      }
      
      // Map the logged-in doctor to the correct doctor ID
      let actualDoctorId = doctorId;
      
      // Check if this is a doctor email and map to the correct ID
      const doctorEmailToIdMap: { [key: string]: string } = {
        'doctor@patientcare.bh': 'doctor-001',
        'fatima.doctor@patientcare.bh': 'doctor-002', 
        'mohammed.doctor@patientcare.bh': 'doctor-003',
        'aisha.doctor@patientcare.bh': 'doctor-004',
        'khalid.doctor@patientcare.bh': 'doctor-005'
      };
      
      if (doctorEmailToIdMap[doctorId]) {
        actualDoctorId = doctorEmailToIdMap[doctorId];
        console.log('Mapped doctor email to ID:', doctorId, '->', actualDoctorId);
      }
      
      // Get all appointments for the current doctor (for visit statistics)
      const doctorAppointments = allAppointments.filter((appointment: any) => {
        return appointment.doctorId === actualDoctorId || 
               appointment.doctorId === doctorId ||
               appointment.doctorEmail === doctorId;
      });

      // Get all registered users (patients) - show ALL patients, not just those with appointments
      const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const allPatients = allUsers.filter((user: any) => user.userType === 'patient');

      console.log('All patients found:', allPatients.length); // Debug log

      // Build patient records for ALL registered patients
      const patientRecords: PatientRecord[] = allPatients.map((patientUser: any) => {
        const patientId = patientUser.id || patientUser.email;
        
        // Get all appointments for this patient with this doctor
        const patientAppointments = doctorAppointments.filter((apt: any) => 
          (apt.patientId === patientId || apt.patientEmail === patientUser.email)
        );
        
        // Calculate visit statistics
        const totalVisits = patientAppointments.length;
        const completedAppointments = patientAppointments.filter((apt: any) => apt.status === 'completed');
        const lastVisit = completedAppointments.length > 0 
          ? completedAppointments.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
          : null;
        
        // Get or create patient record from storage
        let existingRecord = patientRecordsStorage.getPatientRecordByPatientAndDoctor(patientId, actualDoctorId);
        
        if (!existingRecord) {
          // Create new record from user data
          existingRecord = patientRecordsStorage.createPatientRecordFromUserData({
            patientId: patientUser.id || patientUser.email,
            patientName: patientUser.name,
            patientEmail: patientUser.email,
            cprNumber: patientUser.cpr || '',
            phoneNumber: patientUser.phone || '',
            doctorId: actualDoctorId
          });
        }
        
        // Update the record with current visit data
        if (existingRecord) {
          patientRecordsStorage.updatePatientRecord(existingRecord.id, {
            numberOfVisits: totalVisits,
            lastVisit: lastVisit
          });
          
          // Return updated record
          return {
            ...existingRecord,
            numberOfVisits: totalVisits,
            lastVisit: lastVisit
          };
        }
        
        return null;
      }).filter(Boolean) as PatientRecord[];
      
      console.log('Patient records created:', patientRecords.length); // Debug log
      
      // Sort by most recent activity, then by name
      patientRecords.sort((a, b) => {
        // First sort by whether they have visits (patients with visits first)
        if (a.numberOfVisits > 0 && b.numberOfVisits === 0) return -1;
        if (a.numberOfVisits === 0 && b.numberOfVisits > 0) return 1;
        
        // Then by most recent activity
        const aDate = new Date(a.lastVisit || a.dateCreated).getTime();
        const bDate = new Date(b.lastVisit || b.dateCreated).getTime();
        if (aDate !== bDate) return bDate - aDate;
        
        // Finally by name
        return a.fullName.localeCompare(b.fullName);
      });
      
      // Handle single patient view
      if (patientId) {
        const filteredRecords = patientRecords.filter(record => 
          record.id === patientId || record.contactInfo.email === patientId
        );
        setPatients(filteredRecords);
        setIsViewingSinglePatient(true);
      } else {
        setPatients(patientRecords);
        setIsViewingSinglePatient(false);
      }
      
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    }
    
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    const seenPatientIds = getSeenPatientIds(doctorId);
    
    if (query.trim() === '') {
      const allRecords = patientRecordsStorage.getDoctorPatientRecords(doctorId);
      const filteredRecords = allRecords.filter(record => 
        seenPatientIds.includes(record.id) || seenPatientIds.includes(record.contactInfo.email)
      );
      setPatients(filteredRecords);
    } else {
      const results = patientRecordsStorage.searchPatientRecords(doctorId, query);
      const filteredResults = results.filter(record => 
        seenPatientIds.includes(record.id) || seenPatientIds.includes(record.contactInfo.email)
      );
      setPatients(filteredResults);
    }
  };

  const handleExport = () => {
    // Export only the currently displayed patients (those with appointments)
    const exportData = {
      doctorId: doctorId,
      exportDate: new Date().toISOString(),
      totalPatients: patients.length,
      totalVisits: patients.reduce((sum, p) => sum + p.numberOfVisits, 0),
      patients: patients
    };
    
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-records-${doctorId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading patient records...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            {/* Back Button for Single Patient View */}
            {isViewingSinglePatient && (
              <button
                onClick={() => navigate('/patient-records')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '16px'
                }}
              >
                ← Back to All Patient Records
              </button>
            )}

            <div>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#111827',
                margin: 0
              }}>
                {isViewingSinglePatient ? 'Patient Details' : 'Patient Records'}
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '8px 0 0 0'
              }}>
                {isViewingSinglePatient 
                  ? 'Detailed records for this patient'
                  : 'Patient records are automatically created for all patients who book appointments with you.'
                }
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleExport}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Export Records
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name, CPR number, or email..."
              value={searchQuery}
              onChange={(e) => {
                const sanitizedValue = inputValidation.sanitizeText(e.target.value);
                handleSearch(sanitizedValue);
              }}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <svg 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#6b7280'
              }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dbeafe',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                👥
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', margin: 0 }}>
                  {patients.length}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Total Patients
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dcfce7',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                📅
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a', margin: 0 }}>
                  {patients.reduce((sum, p) => sum + p.numberOfVisits, 0)}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Total Visits
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Records Display */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {patients.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                {isViewingSinglePatient ? 'Access Denied' : 'No patients found'}
              </h3>
              <p style={{ margin: '0 0 16px 0' }}>
                {isViewingSinglePatient 
                  ? 'You can only view records for patients who have appointments with you.'
                  : searchQuery 
                  ? 'No patients match your search criteria. Try adjusting your search terms.' 
                  : 'No registered patients found in the system.'
                }
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Patient
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      CPR Number
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Age/Gender
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Visits
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Height/Weight
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Contact
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Last Visit
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr 
                      key={patient.id}
                      style={{ 
                        borderBottom: '1px solid #f3f4f6'
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#0d9488',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '16px'
                          }}>
                            {patient.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
                                {patient.fullName}
                              </p>
                              <button
                                onClick={() => setSelectedPatient(patient)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#f59e0b',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#d97706';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#f59e0b';
                                }}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                              {patient.contactInfo.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#374151' }}>
                        {patient.cprNumber || 'Not provided'}
                      </td>
                      <td style={{ padding: '16px', color: '#374151', fontSize: '14px' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {patient.age ? `${patient.age} years` : 'Age not set'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>
                            {patient.gender || 'Gender not specified'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {patient.numberOfVisits}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#374151', fontSize: '14px' }}>
                        <div>
                          <div style={{ 
                            color: patient.physicalInfo?.height?.value > 0 ? '#374151' : '#ef4444' 
                          }}>
                            {patient.physicalInfo?.height?.value > 0 
                              ? `${patient.physicalInfo.height.value}${patient.physicalInfo.height.unit === 'cm' ? 'cm' : 'ft'}`
                              : 'Height not set'
                            }
                          </div>
                          <div style={{ 
                            color: patient.physicalInfo?.weight?.value > 0 ? '#374151' : '#ef4444' 
                          }}>
                            {patient.physicalInfo?.weight?.value > 0 
                              ? `${patient.physicalInfo.weight.value}${patient.physicalInfo.weight.unit}`
                              : 'Weight not set'
                            }
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#374151', fontSize: '14px' }}>
                        <div>
                          <div style={{ 
                            color: patient.contactInfo?.phoneNumber ? '#374151' : '#ef4444' 
                          }}>
                            {patient.contactInfo?.phoneNumber || 'Phone not set'}
                          </div>
                          <div style={{ 
                            color: patient.contactInfo?.address?.city ? '#6b7280' : '#ef4444' 
                          }}>
                            {patient.contactInfo?.address?.city || 'Address not set'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#374151', fontSize: '14px' }}>
                        {patient.lastVisit 
                          ? new Date(patient.lastVisit).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'No visits'
                        }
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: patient.numberOfVisits > 0 ? '#dcfce7' : '#fef3c7',
                          color: patient.numberOfVisits > 0 ? '#166534' : '#92400e',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {patient.numberOfVisits > 0 ? 'Active Patient' : 'New Patient'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>



        {/* Simple Patient Detail Modal */}
        {selectedPatient && (
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
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {selectedPatient.fullName}
                </h2>
                <button
                  onClick={() => setSelectedPatient(null)}
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '20px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <strong>Email:</strong> {selectedPatient.contactInfo.email}
                  </div>
                  <div>
                    <strong>CPR Number:</strong> {selectedPatient.cprNumber || 'Not provided'}
                  </div>
                  <div>
                    <strong>Age:</strong> {selectedPatient.age ? `${selectedPatient.age} years` : 'Not provided'}
                  </div>
                  <div>
                    <strong>Gender:</strong> {selectedPatient.gender || 'Not specified'}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedPatient.contactInfo.phoneNumber || 'Not provided'}
                  </div>
                  <div>
                    <strong>Total Visits:</strong> {selectedPatient.numberOfVisits}
                  </div>
                  <div>
                    <strong>Last Visit:</strong> {selectedPatient.lastVisit 
                      ? new Date(selectedPatient.lastVisit).toLocaleDateString()
                      : 'No visits'
                    }
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setSelectedPatient(null)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DoctorPatientRecords;