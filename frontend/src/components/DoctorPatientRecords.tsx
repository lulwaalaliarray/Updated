import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientRecord, patientRecordsStorage } from '../utils/patientRecordsStorage';
import { inputValidation } from '../utils/inputValidation';
interface DoctorPatientRecordsProps {
  doctorId: string;
}

// Helper function to get all registered patients
const getAllRegisteredPatients = (): any[] => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  return users.filter((user: any) => user.userType === 'patient');
};

// Helper function to get patients the doctor has appointments with (all appointments, not just completed)
const getSeenPatientIds = (doctorId: string): string[] => {
  const appointments = JSON.parse(localStorage.getItem('patientcare_appointments') || '[]');
  const doctorAppointments = appointments.filter((apt: any) => apt.doctorId === doctorId);
  return [...new Set(doctorAppointments.map((apt: any) => apt.patientId || apt.patientEmail))] as string[];
};

// Enhanced function to automatically create patient records ONLY for patients with appointments
const createPatientRecordsFromAppointments = (doctorId: string): void => {
  try {
    console.log('Creating patient records for doctor:', doctorId);
    
    const { appointmentStorage } = require('../utils/appointmentStorage');
    const appointments = appointmentStorage.getAllAppointments();
    const users = getAllRegisteredPatients();
    const doctorAppointments = appointments.filter((apt: any) => apt.doctorId === doctorId);
    
    console.log('Total appointments:', appointments.length);
    console.log('Doctor appointments:', doctorAppointments.length);
    console.log('Registered patients:', users.length);
    
    // Only create records for patients who have appointments with this doctor
    doctorAppointments.forEach((appointment: any) => {
      console.log('Processing appointment:', appointment.patientName, appointment.patientEmail);
      
      // Try multiple ways to find existing record
      let existingRecord = patientRecordsStorage.getPatientRecordByPatientAndDoctor(
        appointment.patientId || appointment.patientEmail,
        doctorId
      );
      
      // Also try with email if patientId didn't work
      if (!existingRecord && appointment.patientEmail) {
        existingRecord = patientRecordsStorage.getPatientRecordByPatientAndDoctor(
          appointment.patientEmail,
          doctorId
        );
      }

      if (!existingRecord) {
        console.log('No existing record found, creating new record for:', appointment.patientName);
        
        // Find the actual user data
        const userData = users.find((user: any) => 
          user.userType === 'patient' && 
          (user.id === appointment.patientId || 
           user.email === appointment.patientEmail ||
           user.name === appointment.patientName)
        );

        if (userData) {
          console.log('Found user data, creating comprehensive record');
          // Create comprehensive patient record from user data
          try {
            patientRecordsStorage.createPatientRecordFromUserData({
              patientId: userData.id || userData.email,
              patientName: userData.name,
              patientEmail: userData.email,
              cprNumber: userData.cpr || '',
              phoneNumber: userData.phone || '',
              doctorId: doctorId
            });
            console.log('Successfully created comprehensive record');
          } catch (error) {
            console.error('Error creating comprehensive record:', error);
          }
        } else {
          console.log('No user data found, creating basic record');
          // Fallback to basic record creation if user data not found
          try {
            patientRecordsStorage.createPatientRecordFromAppointment({
              patientId: appointment.patientId || appointment.patientEmail,
              patientName: appointment.patientName,
              patientEmail: appointment.patientEmail,
              doctorId: doctorId
            });
            console.log('Successfully created basic record');
          } catch (error) {
            console.error('Error creating basic record:', error);
          }
        }
      } else {
        console.log('Existing record found for:', appointment.patientName);
      }
    });

    // Update visit counts and last visit dates for existing records
    doctorAppointments.forEach((appointment: any) => {
      const record = patientRecordsStorage.getPatientRecordByPatientAndDoctor(
        appointment.patientId || appointment.patientEmail,
        doctorId
      );
      if (record) {
        // Count actual appointments for this patient with this doctor
        const patientAppointments = doctorAppointments.filter((apt: any) => 
          (apt.patientId === appointment.patientId || apt.patientEmail === appointment.patientEmail)
        );
        
        const completedAppointments = patientAppointments.filter((apt: any) => apt.status === 'completed');
        const lastCompletedAppointment = completedAppointments
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        patientRecordsStorage.updatePatientRecord(record.id, {
          numberOfVisits: patientAppointments.length,
          lastVisit: lastCompletedAppointment ? lastCompletedAppointment.date : record.lastVisit
        });
      }
    });
    
    console.log('Finished creating patient records');
  } catch (error) {
    console.error('Error creating patient records from appointments:', error);
  }
};

const DoctorPatientRecords: React.FC<DoctorPatientRecordsProps> = ({ doctorId }) => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [modalPatient, setModalPatient] = useState<PatientRecord | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewingSinglePatient, setIsViewingSinglePatient] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [doctorId]);

  const loadPatients = () => {
    setLoading(true);
    
    try {
      // Ensure demo data is initialized
      const { appointmentStorage } = require('../utils/appointmentStorage');
      const { initializeDemoUsers } = require('../utils/userStorage');
      
      // Initialize demo users and appointments
      initializeDemoUsers();
      appointmentStorage.getAllAppointments(); // This will initialize default appointments
      
      // Initialize demo prescriptions
      const { initializeDemoPrescriptions } = require('../utils/prescriptionStorage');
      initializeDemoPrescriptions();
      
      // Auto-create patient records ONLY for patients with appointments
      createPatientRecordsFromAppointments(doctorId);
      
      // Get all patient records for this doctor
      let allRecords = patientRecordsStorage.getDoctorPatientRecords(doctorId);
      
      // If no records found, try to force create them from appointments
      if (allRecords.length === 0) {
        console.log('No patient records found, forcing creation from appointments');
        const appointments = appointmentStorage.getAllAppointments();
        const doctorAppointments = appointments.filter((apt: any) => apt.doctorId === doctorId);
        
        // Force create basic records for each appointment
        doctorAppointments.forEach((appointment: any) => {
          try {
            patientRecordsStorage.createPatientRecordFromAppointment({
              patientId: appointment.patientId || appointment.patientEmail,
              patientName: appointment.patientName,
              patientEmail: appointment.patientEmail,
              doctorId: doctorId
            });
          } catch (error) {
            console.log('Could not create record for:', appointment.patientName, error);
          }
        });
        
        // Reload records after forced creation
        allRecords = patientRecordsStorage.getDoctorPatientRecords(doctorId);
        console.log('After forced creation, found records:', allRecords.length);
      }
      
      // Get appointments for this doctor
      const appointments = appointmentStorage.getAllAppointments();
      const doctorAppointments = appointments.filter((apt: any) => apt.doctorId === doctorId);
      
      // Filter records to only include patients who have appointments with this doctor
      let filteredRecords = allRecords.filter(record => {
        // Check if this patient has any appointments with this doctor
        const hasAppointment = doctorAppointments.some((apt: any) => 
          apt.patientId === record.patientGlobalId ||
          apt.patientEmail === record.contactInfo.email ||
          apt.patientId === record.id ||
          apt.patientName === record.fullName ||
          // Also check by patient name as a fallback
          (apt.patientName && record.fullName && apt.patientName === record.fullName)
        );
        return hasAppointment;
      });
      
      // If no filtered records but we have appointments, show all records for this doctor
      // This handles cases where the matching logic might have issues
      if (filteredRecords.length === 0 && doctorAppointments.length > 0) {
        filteredRecords = allRecords;
      }
      
      // If viewing a specific patient, filter further
      if (patientId) {
        filteredRecords = filteredRecords.filter(record => 
          record.id === patientId || record.contactInfo.email === patientId
        );
        setIsViewingSinglePatient(true);
      } else {
        setIsViewingSinglePatient(false);
      }
      
      setPatients(filteredRecords);
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

  const handleViewPatientDetails = (patient: PatientRecord) => {
    setModalPatient(patient);
    
    // Load patient's appointments
    try {
      const { appointmentStorage } = require('../utils/appointmentStorage');
      const allAppointments = appointmentStorage.getAllAppointments();
      const appointments = allAppointments.filter((apt: any) => 
        (apt.patientId === patient.patientGlobalId || 
         apt.patientEmail === patient.contactInfo.email ||
         apt.patientName === patient.fullName) &&
        apt.doctorId === doctorId
      ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setPatientAppointments(appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setPatientAppointments([]);
    }
    
    // Load patient's prescriptions
    try {
      const { prescriptionStorage } = require('../utils/prescriptionStorage');
      const allPrescriptions = prescriptionStorage.getAllPrescriptions();
      const prescriptions = allPrescriptions.filter((presc: any) => 
        (presc.patientId === patient.patientGlobalId || 
         presc.patientEmail === patient.contactInfo.email ||
         presc.patientName === patient.fullName) &&
        presc.doctorId === doctorId
      ).sort((a: any, b: any) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime());
      
      setPatientPrescriptions(prescriptions);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setPatientPrescriptions([]);
    }
    
    setShowPatientModal(true);
  };

  const handleExport = () => {
    const jsonData = patientRecordsStorage.exportPatientRecords(doctorId);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-records-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatHeight = (height: PatientRecord['physicalInfo']['height']) => {
    if (height.unit === 'cm') {
      return `${height.value} cm`;
    } else {
      return `${height.feet}'${height.inches}"`;
    }
  };

  const formatWeight = (weight: PatientRecord['physicalInfo']['weight']) => {
    return `${weight.value} ${weight.unit}`;
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
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
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
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Patient Records
            </button>
          )}

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
              : 'Patient records are automatically created for all patients who book appointments with you. Complete the missing details like gender, height, weight, and medical history.'
            }
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
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
              + Add New Patient
            </button>
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
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5856eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6366f1';
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
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0d9488';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
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
              <svg width="20" height="20" fill="#2563eb" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2M4 18v-4h3v4h2v-7.5c0-.83.67-1.5 1.5-1.5S12 9.67 12 10.5V11h2.5c.83 0 1.5.67 1.5 1.5V18h2v4H4v-4z"/>
              </svg>
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
              <svg width="20" height="20" fill="#16a34a" viewBox="0 0 24 24">
                <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z"/>
              </svg>
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



      {/* Patient Records Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {patients.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <svg 
              style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#d1d5db' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              {isViewingSinglePatient ? 'Access Denied' : 'No patient records found'}
            </h3>
            <p style={{ margin: '0 0 16px 0' }}>
              {isViewingSinglePatient 
                ? 'You can only view records for patients who have appointments with you.'
                : searchQuery 
                ? 'Try adjusting your search criteria' 
                : 'Patient records are automatically created when patients book appointments with you.'
              }
            </p>
            {!isViewingSinglePatient && !searchQuery && (
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px'
              }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>
                  💡 Don't see your patients?
                </p>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#0369a1' }}>
                  To get started with sample patient data, click the "👥 Add Sample Patients" button above.
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#0369a1' }}>
                  You can also manually add new patients using the "Add New Patient" button.
                </p>
              </div>
            )}
            {isViewingSinglePatient && (
              <button
                onClick={() => navigate('/patient-records')}
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Back to All Records
              </button>
            )}
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr 
                    key={patient.id}
                    style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
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
                        <div>
                          <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
                            {patient.fullName}
                          </p>
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
                        <div style={{ 
                          fontWeight: '500',
                          color: patient.age ? '#374151' : '#ef4444'
                        }}>
                          {patient.age ? `${patient.age} years` : 'Age not set'}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: patient.gender ? '#6b7280' : '#ef4444', 
                          textTransform: 'capitalize' 
                        }}>
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
                          color: patient.physicalInfo.height.value > 0 ? '#374151' : '#ef4444' 
                        }}>
                          {patient.physicalInfo.height.value > 0 ? formatHeight(patient.physicalInfo.height) : 'Height not set'}
                        </div>
                        <div style={{ 
                          color: patient.physicalInfo.weight.value > 0 ? '#374151' : '#ef4444' 
                        }}>
                          {patient.physicalInfo.weight.value > 0 ? formatWeight(patient.physicalInfo.weight) : 'Weight not set'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#374151', fontSize: '14px' }}>
                      <div>
                        <div style={{ 
                          color: patient.contactInfo.phoneNumber ? '#374151' : '#ef4444' 
                        }}>
                          {patient.contactInfo.phoneNumber || 'Phone not set'}
                        </div>
                        <div style={{ 
                          color: patient.contactInfo.address.city ? '#6b7280' : '#ef4444' 
                        }}>
                          {patient.contactInfo.address.city || 'Address not set'}
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
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleViewPatientDetails(patient)}
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
                          👁️ View Details
                        </button>
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
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
                          ✏️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal 
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdate={loadPatients}
        />
      )}

      {/* Patient Details Modal */}
      {showPatientModal && modalPatient && (
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
            maxWidth: '900px',
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
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '16px 16px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                  fontWeight: '700'
                }}>
                  {modalPatient.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    {modalPatient.fullName}
                  </h2>
                  <p style={{ fontSize: '16px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    Patient ID: {modalPatient.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPatientModal(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '24px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              {/* Patient Information Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                {/* Personal Information */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                    📋 Personal Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>CPR Number</span>
                      <p style={{ fontSize: '14px', color: '#111827', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
                        {modalPatient.cprNumber || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Age & Gender</span>
                      <p style={{ fontSize: '14px', color: '#111827', margin: '2px 0 0 0' }}>
                        {modalPatient.age ? `${modalPatient.age} years` : 'Age not set'} • {modalPatient.gender ? modalPatient.gender.charAt(0).toUpperCase() + modalPatient.gender.slice(1) : 'Gender not specified'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Date of Birth</span>
                      <p style={{ fontSize: '14px', color: '#111827', margin: '2px 0 0 0' }}>
                        {modalPatient.dateOfBirth ? new Date(modalPatient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div style={{
                  backgroundColor: '#f0f9ff',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #bae6fd'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                    📞 Contact Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Email</span>
                      <p style={{ fontSize: '14px', color: '#111827', margin: '2px 0 0 0' }}>
                        {modalPatient.contactInfo.email}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Phone</span>
                      <p style={{ fontSize: '14px', color: '#111827', margin: '2px 0 0 0' }}>
                        {modalPatient.contactInfo.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Address</span>
                      <p style={{ fontSize: '14px', color: '#111827', margin: '2px 0 0 0' }}>
                        {modalPatient.contactInfo.address.street && `${modalPatient.contactInfo.address.street}, `}
                        {modalPatient.contactInfo.address.city || 'Address not provided'}
                        {modalPatient.contactInfo.address.governorate && `, ${modalPatient.contactInfo.address.governorate}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Physical Information */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #bbf7d0'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                    📏 Physical Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Height</span>
                      <p style={{ fontSize: '14px', color: '#111827', margin: '2px 0 0 0' }}>
                        {modalPatient.physicalInfo.height.unit === 'cm' 
                          ? `${modalPatient.physicalInfo.height.value} cm`
                          : `${modalPatient.physicalInfo.height.feet}'${modalPatient.physicalInfo.height.inches}"`
                        }
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Weight</span>
                      <p style={{ fontSize: '14px', color: '#111827', margin: '2px 0 0 0' }}>
                        {modalPatient.physicalInfo.weight.value} {modalPatient.physicalInfo.weight.unit}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Visits</span>
                      <p style={{ fontSize: '14px', color: '#111827', margin: '2px 0 0 0' }}>
                        {modalPatient.numberOfVisits} visits
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div style={{
                backgroundColor: '#fef7ff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e9d5ff',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  🏥 Medical History
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Diagnoses</span>
                    <div style={{ marginTop: '4px' }}>
                      {modalPatient.medicalHistory.diagnoses.length > 0 ? (
                        modalPatient.medicalHistory.diagnoses.map((diagnosis, index) => (
                          <span key={index} style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            backgroundColor: '#fecaca',
                            color: '#991b1b',
                            borderRadius: '12px',
                            fontSize: '12px',
                            margin: '2px 4px 2px 0'
                          }}>
                            {diagnosis}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>No diagnoses recorded</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Current Treatments</span>
                    <div style={{ marginTop: '4px' }}>
                      {modalPatient.medicalHistory.treatments.length > 0 ? (
                        modalPatient.medicalHistory.treatments.map((treatment, index) => (
                          <span key={index} style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            borderRadius: '12px',
                            fontSize: '12px',
                            margin: '2px 4px 2px 0'
                          }}>
                            {treatment}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>No treatments recorded</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Allergies</span>
                    <div style={{ marginTop: '4px' }}>
                      {modalPatient.medicalHistory.allergies.length > 0 ? (
                        modalPatient.medicalHistory.allergies.map((allergy, index) => (
                          <span key={index} style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            backgroundColor: '#fed7aa',
                            color: '#9a3412',
                            borderRadius: '12px',
                            fontSize: '12px',
                            margin: '2px 4px 2px 0'
                          }}>
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>No allergies recorded</span>
                      )}
                    </div>
                  </div>
                </div>
                {modalPatient.medicalHistory.notes && (
                  <div style={{ marginTop: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Notes</span>
                    <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                      {modalPatient.medicalHistory.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Appointment History */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  📅 Appointment History ({patientAppointments.length})
                </h3>
                {patientAppointments.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {patientAppointments.map((appointment, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                              {appointment.type}
                            </p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} at {appointment.time}
                            </p>
                          </div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '500',
                            backgroundColor: appointment.status === 'completed' ? '#dcfce7' : 
                                           appointment.status === 'confirmed' ? '#dbeafe' : '#fef3c7',
                            color: appointment.status === 'completed' ? '#166534' : 
                                   appointment.status === 'confirmed' ? '#1e40af' : '#92400e'
                          }}>
                            {appointment.status}
                          </span>
                        </div>
                        {appointment.notes && (
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                            Notes: {appointment.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                    No appointment history found
                  </p>
                )}
              </div>

              {/* Prescription History */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  💊 Prescription History ({patientPrescriptions.length})
                </h3>
                {patientPrescriptions.length > 0 ? (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {patientPrescriptions.map((prescription, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        border: '1px solid #bbf7d0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                              {prescription.medications?.map((med: any) => med.name).join(', ') || 'Prescription'}
                            </p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                              Issued: {new Date(prescription.dateIssued).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            {prescription.medications && prescription.medications.length > 0 && (
                              <div style={{ marginTop: '8px' }}>
                                {prescription.medications.map((med: any, medIndex: number) => (
                                  <div key={medIndex} style={{ marginBottom: '4px' }}>
                                    <span style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
                                      {med.name}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                                      {med.dosage} - {med.frequency}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '500',
                            backgroundColor: prescription.status === 'active' ? '#dcfce7' : '#fef3c7',
                            color: prescription.status === 'active' ? '#166534' : '#92400e'
                          }}>
                            {prescription.status || 'active'}
                          </span>
                        </div>
                        {prescription.instructions && (
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                            Instructions: {prescription.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                    No prescription history found
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f8fafc',
              borderRadius: '0 0 16px 16px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowPatientModal(false)}
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
              <button
                onClick={() => {
                  setShowPatientModal(false);
                  setSelectedPatient(modalPatient);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Edit Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Form Modal */}
      {showAddForm && (
        <AddPatientForm
          doctorId={doctorId}
          onClose={() => setShowAddForm(false)}
          onAdd={loadPatients}
        />
      )}
    </div>
  );
};

// Patient Detail Modal Component
interface PatientDetailModalProps {
  patient: PatientRecord;
  onClose: () => void;
  onUpdate: () => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ patient, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState(patient);

  // Get appointment notes and prescription data for this patient
  const getPatientMedicalNotes = () => {
    try {
      const { appointmentStorage } = require('../utils/appointmentStorage');
      const { prescriptionStorage } = require('../utils/prescriptionStorage');
      
      // Get all appointments for this patient with this doctor
      const appointments = appointmentStorage.getAllAppointments();
      const patientAppointments = appointments.filter((apt: any) => 
        (apt.patientId === patient.patientGlobalId || 
         apt.patientEmail === patient.contactInfo.email ||
         apt.patientName === patient.fullName) &&
        apt.doctorId === patient.doctorId &&
        apt.notes && apt.notes.trim() !== ''
      ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Get all prescriptions for this patient with this doctor
      const prescriptions = prescriptionStorage.getAllPrescriptions();
      const patientPrescriptions = prescriptions.filter((presc: any) => 
        (presc.patientId === patient.patientGlobalId || 
         presc.patientEmail === patient.contactInfo.email ||
         presc.patientName === patient.fullName) &&
        presc.doctorId === patient.doctorId
      ).sort((a: any, b: any) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime());

      return { appointments: patientAppointments, prescriptions: patientPrescriptions };
    } catch (error) {
      console.error('Error getting patient medical notes:', error);
      return { appointments: [], prescriptions: [] };
    }
  };

  const { appointments, prescriptions } = getPatientMedicalNotes();

  return (
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
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
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
            Patient Details
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px' }}>
          {/* Patient Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#0d9488',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '32px'
            }}>
              {patient.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                {editedPatient.fullName}
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 8px 0' }}>
                CPR: {editedPatient.cprNumber}
              </p>
              {isEditing && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Age:</label>
                    <input
                      type="number"
                      value={editedPatient.age || ''}
                      onChange={(e) => setEditedPatient({
                        ...editedPatient,
                        age: parseInt(e.target.value) || undefined
                      })}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px',
                        width: '60px',
                        marginLeft: '4px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Gender:</label>
                    <select
                      value={editedPatient.gender || ''}
                      onChange={(e) => setEditedPatient({
                        ...editedPatient,
                        gender: e.target.value as 'male' | 'female' | 'other'
                      })}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px',
                        marginLeft: '4px'
                      }}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{
                  padding: '4px 12px',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {patient.numberOfVisits} visits
                </span>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
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
                    ✏️ Edit Information
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        // Save changes
                        const success = patientRecordsStorage.updatePatientRecord(patient.id, editedPatient);
                        if (success) {
                          setIsEditing(false);
                          onUpdate();
                          onClose();
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#047857';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                      }}
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={() => {
                        setEditedPatient(patient);
                        setIsEditing(false);
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4b5563';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#6b7280';
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Information Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Physical Information */}
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Physical Information
              </h4>
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Height:</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="number"
                        value={editedPatient.physicalInfo.height.value}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          physicalInfo: {
                            ...editedPatient.physicalInfo,
                            height: {
                              ...editedPatient.physicalInfo.height,
                              value: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          width: '80px'
                        }}
                      />
                      <select
                        value={editedPatient.physicalInfo.height.unit}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          physicalInfo: {
                            ...editedPatient.physicalInfo,
                            height: {
                              ...editedPatient.physicalInfo.height,
                              unit: e.target.value as 'cm' | 'ft'
                            }
                          }
                        })}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="cm">cm</option>
                        <option value="ft">ft</option>
                      </select>
                    </div>
                  ) : (
                    <span style={{ fontSize: '16px', color: '#111827', marginLeft: '8px' }}>
                      {editedPatient.physicalInfo.height.unit === 'cm' 
                        ? `${editedPatient.physicalInfo.height.value} cm`
                        : `${editedPatient.physicalInfo.height.feet}'${editedPatient.physicalInfo.height.inches}"`
                      }
                    </span>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Weight:</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="number"
                        value={editedPatient.physicalInfo.weight.value}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          physicalInfo: {
                            ...editedPatient.physicalInfo,
                            weight: {
                              ...editedPatient.physicalInfo.weight,
                              value: parseInt(e.target.value) || 0
                            }
                          }
                        })}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px',
                          width: '80px'
                        }}
                      />
                      <select
                        value={editedPatient.physicalInfo.weight.unit}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          physicalInfo: {
                            ...editedPatient.physicalInfo,
                            weight: {
                              ...editedPatient.physicalInfo.weight,
                              unit: e.target.value as 'kg' | 'lbs'
                            }
                          }
                        })}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                  ) : (
                    <span style={{ fontSize: '16px', color: '#111827', marginLeft: '8px' }}>
                      {editedPatient.physicalInfo.weight.value} {editedPatient.physicalInfo.weight.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Contact Information
              </h4>
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Phone:</span>
                  <span style={{ fontSize: '16px', color: '#111827', marginLeft: '8px' }}>
                    {patient.contactInfo.phoneNumber}
                  </span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Email:</span>
                  <span style={{ fontSize: '16px', color: '#111827', marginLeft: '8px' }}>
                    {patient.contactInfo.email}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Address:</span>
                  <div style={{ fontSize: '16px', color: '#111827', marginTop: '4px' }}>
                    {patient.contactInfo.address.street}<br />
                    {patient.contactInfo.address.city}, {patient.contactInfo.address.governorate}<br />
                    {patient.contactInfo.address.postalCode}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              Medical History
            </h4>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Diagnoses:
                </h5>
                {isEditing ? (
                  <textarea
                    value={editedPatient.medicalHistory.diagnoses.join(', ')}
                    onChange={(e) => setEditedPatient({
                      ...editedPatient,
                      medicalHistory: {
                        ...editedPatient.medicalHistory,
                        diagnoses: e.target.value.split(',').map(d => d.trim()).filter(d => d)
                      }
                    })}
                    placeholder="Enter diagnoses separated by commas"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {editedPatient.medicalHistory.diagnoses.map((diagnosis, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '12px',
                          fontSize: '14px'
                        }}
                      >
                        {diagnosis}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Current Treatments:
                </h5>
                {isEditing ? (
                  <textarea
                    value={editedPatient.medicalHistory.treatments.join(', ')}
                    onChange={(e) => setEditedPatient({
                      ...editedPatient,
                      medicalHistory: {
                        ...editedPatient.medicalHistory,
                        treatments: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      }
                    })}
                    placeholder="Enter treatments separated by commas"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {editedPatient.medicalHistory.treatments.map((treatment, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          borderRadius: '12px',
                          fontSize: '14px'
                        }}
                      >
                        {treatment}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Allergies:
                </h5>
                {isEditing ? (
                  <textarea
                    value={editedPatient.medicalHistory.allergies.join(', ')}
                    onChange={(e) => setEditedPatient({
                      ...editedPatient,
                      medicalHistory: {
                        ...editedPatient.medicalHistory,
                        allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a)
                      }
                    })}
                    placeholder="Enter allergies separated by commas"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '60px',
                      resize: 'vertical'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {editedPatient.medicalHistory.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#fecaca',
                          color: '#991b1b',
                          borderRadius: '12px',
                          fontSize: '14px'
                        }}
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Notes:
                </h5>
                {isEditing ? (
                  <textarea
                    value={editedPatient.medicalHistory.notes || ''}
                    onChange={(e) => setEditedPatient({
                      ...editedPatient,
                      medicalHistory: {
                        ...editedPatient.medicalHistory,
                        notes: e.target.value
                      }
                    })}
                    placeholder="Enter medical notes and observations"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                  />
                ) : (
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.5',
                    margin: 0,
                    padding: '12px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}>
                    {editedPatient.medicalHistory.notes || 'No notes available'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Visit History & Symptoms */}
          {(appointments.length > 0 || prescriptions.length > 0) && (
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                📋 Visit History & Symptoms
              </h4>
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '20px'
              }}>
                {/* Appointment Notes */}
                {appointments.length > 0 && (
                  <div style={{ marginBottom: prescriptions.length > 0 ? '24px' : '0' }}>
                    <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                      🩺 Appointment Notes & Symptoms
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {appointments.map((appointment: any, index: number) => (
                        <div
                          key={appointment.id}
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            borderLeft: '4px solid #3b82f6'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#3b82f6',
                                backgroundColor: '#dbeafe',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                textTransform: 'capitalize'
                              }}>
                                {appointment.type} - {appointment.status}
                              </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })} at {appointment.time}
                            </span>
                          </div>
                          <p style={{
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.5',
                            margin: 0,
                            fontStyle: appointment.notes.toLowerCase().includes('symptom') || 
                                      appointment.notes.toLowerCase().includes('pain') ||
                                      appointment.notes.toLowerCase().includes('fever') ||
                                      appointment.notes.toLowerCase().includes('cough') ? 'normal' : 'normal'
                          }}>
                            {appointment.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prescription Diagnoses */}
                {prescriptions.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                      💊 Prescription History & Diagnoses
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {prescriptions.map((prescription: any, index: number) => (
                        <div
                          key={prescription.id}
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            borderLeft: '4px solid #059669'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#059669',
                                backgroundColor: '#dcfce7',
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}>
                                Prescription - {prescription.status}
                              </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {new Date(prescription.dateIssued).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                              Diagnosis: 
                            </span>
                            <span style={{ fontSize: '14px', color: '#dc2626', marginLeft: '4px', fontWeight: '500' }}>
                              {prescription.diagnosis}
                            </span>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                              Medications: 
                            </span>
                            <div style={{ marginTop: '4px' }}>
                              {prescription.medications.map((med: any, medIndex: number) => (
                                <span
                                  key={medIndex}
                                  style={{
                                    display: 'inline-block',
                                    fontSize: '12px',
                                    backgroundColor: '#f0fdf4',
                                    color: '#166534',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    marginRight: '6px',
                                    marginBottom: '4px'
                                  }}
                                >
                                  {med.name} ({med.dosage})
                                </span>
                              ))}
                            </div>
                          </div>
                          {prescription.notes && (
                            <p style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              lineHeight: '1.5',
                              margin: 0,
                              fontStyle: 'italic'
                            }}>
                              Notes: {prescription.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {appointments.length === 0 && prescriptions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      No visit history or symptoms recorded yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import AddPatientForm from './AddPatientForm';

export default DoctorPatientRecords;