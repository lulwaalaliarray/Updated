import React, { useState, useEffect } from 'react';
import { PatientRecord, patientRecordsStorage } from '../utils/patientRecordsStorage';
import { inputValidation } from '../utils/inputValidation';

interface AddPatientFormProps {
  doctorId: string;
  onClose: () => void;
  onAdd: () => void;
}

interface RegisteredPatient {
  id: string;
  name: string;
  email: string;
  cpr?: string;
  phone?: string;
  userType: string;
}



const AddPatientForm: React.FC<AddPatientFormProps> = ({ doctorId, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'registered' | 'new'>('registered');
  const [registeredPatients, setRegisteredPatients] = useState<RegisteredPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<RegisteredPatient | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    cprNumber: '',
    age: '',
    dateOfBirth: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    email: '',
    phoneNumber: '',
    height: '',
    heightUnit: 'cm' as 'cm' | 'ft/in',
    feet: '',
    inches: '',
    weight: '',
    weightUnit: 'kg' as 'kg' | 'lbs',
    street: '',
    city: '',
    governorate: '',
    postalCode: '',
    diagnoses: '',
    treatments: '',
    allergies: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load registered patients who have appointments but no patient record with this doctor
  useEffect(() => {
    loadRegisteredPatients();
  }, [doctorId]);

  const loadRegisteredPatients = () => {
    try {
      // Map the logged-in doctor to the correct doctor ID
      let actualDoctorId = doctorId;

      const doctorEmailToIdMap: { [key: string]: string } = {
        'doctor@patientcare.bh': 'doctor-001',
        'fatima.doctor@patientcare.bh': 'doctor-002',
        'mohammed.doctor@patientcare.bh': 'doctor-003',
        'aisha.doctor@patientcare.bh': 'doctor-004',
        'khalid.doctor@patientcare.bh': 'doctor-005'
      };

      if (doctorEmailToIdMap[doctorId]) {
        actualDoctorId = doctorEmailToIdMap[doctorId];
      }

      // Get all appointments for this doctor
      const appointments = JSON.parse(localStorage.getItem('patientcare_appointments') || '[]');
      const doctorAppointments = appointments.filter((apt: any) =>
        apt.doctorId === actualDoctorId || apt.doctorId === doctorId
      );

      if (doctorAppointments.length === 0) {
        setRegisteredPatients([]);
        return;
      }

      // Get unique patient IDs from appointments
      const patientIds = [...new Set(doctorAppointments.map((apt: any) => apt.patientId || apt.patientEmail))];

      // Get all registered users
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const allPatients = users.filter((user: any) => user.userType === 'patient');

      // Find patients who have appointments but no complete patient record with this doctor
      const availablePatients = patientIds.map((patientId: any) => {
        // Find the patient user data
        const patientUser = allPatients.find((user: any) =>
          user.id === patientId || user.email === patientId
        );

        if (!patientUser) return null;

        // Check if patient already has a complete record with this doctor
        const existingRecord = patientRecordsStorage.getPatientRecordByPatientAndDoctor(
          patientId,
          actualDoctorId
        );

        // Only include if no existing record or record is incomplete
        if (!existingRecord ||
          !existingRecord.physicalInfo.height.value ||
          !existingRecord.physicalInfo.weight.value ||
          !existingRecord.gender) {
          return {
            id: patientUser.id,
            name: patientUser.name,
            email: patientUser.email,
            cpr: patientUser.cpr,
            phone: patientUser.phone,
            userType: patientUser.userType
          };
        }

        return null;
      }).filter(Boolean) as RegisteredPatient[];

      setRegisteredPatients(availablePatients);

    } catch (error) {
      console.error('Error loading registered patients:', error);
      setRegisteredPatients([]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let sanitizedValue = value;

    // Apply appropriate validation based on field type
    switch (field) {
      case 'fullName':
        sanitizedValue = inputValidation.sanitizeName(value);
        break;
      case 'email':
        sanitizedValue = inputValidation.sanitizeEmail(value);
        break;
      case 'cprNumber':
      case 'phoneNumber':
      case 'age':
      case 'height':
      case 'weight':
      case 'feet':
      case 'inches':
        sanitizedValue = inputValidation.sanitizeNumber(value);
        break;
      case 'street':
      case 'city':
        sanitizedValue = inputValidation.sanitizeText(value);
        break;
      case 'diagnoses':
      case 'treatments':
      case 'allergies':
      case 'notes':
        sanitizedValue = inputValidation.sanitizeMedicalText(value);
        break;
      default:
        sanitizedValue = inputValidation.sanitizeText(value);
    }

    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.cprNumber.trim()) newErrors.cprNumber = 'CPR number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.height.trim()) newErrors.height = 'Height is required';
    if (!formData.weight.trim()) newErrors.weight = 'Weight is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // CPR validation (basic format check)
    if (formData.cprNumber && !/^\d{9}$/.test(formData.cprNumber)) {
      newErrors.cprNumber = 'CPR number must be 9 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleAddRegisteredPatient = () => {
    if (!selectedPatient) return;

    try {
      // Map doctor ID
      let actualDoctorId = doctorId;
      const doctorEmailToIdMap: { [key: string]: string } = {
        'doctor@patientcare.bh': 'doctor-001',
        'fatima.doctor@patientcare.bh': 'doctor-002',
        'mohammed.doctor@patientcare.bh': 'doctor-003',
        'aisha.doctor@patientcare.bh': 'doctor-004',
        'khalid.doctor@patientcare.bh': 'doctor-005'
      };

      if (doctorEmailToIdMap[doctorId]) {
        actualDoctorId = doctorEmailToIdMap[doctorId];
      }

      // Create patient record from registered user data
      patientRecordsStorage.createPatientRecordFromUserData({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientEmail: selectedPatient.email,
        cprNumber: selectedPatient.cpr || '',
        phoneNumber: selectedPatient.phone || '',
        doctorId: actualDoctorId
      });

      onAdd();
      onClose();
    } catch (error) {
      console.error('Error adding registered patient:', error);
      setErrors({ submit: 'Failed to add patient. Please try again.' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'registered') {
      handleAddRegisteredPatient();
      return;
    }

    if (!validateForm()) return;

    try {
      const newPatient: Omit<PatientRecord, 'id' | 'dateCreated' | 'lastUpdated'> = {
        fullName: formData.fullName.trim(),
        cprNumber: formData.cprNumber.trim(),
        age: parseInt(formData.age) || 0,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        numberOfVisits: 0,
        medicalHistory: {
          diagnoses: formData.diagnoses ? formData.diagnoses.split(',').map(d => d.trim()).filter(d => d) : [],
          treatments: formData.treatments ? formData.treatments.split(',').map(t => t.trim()).filter(t => t) : [],
          allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(a => a) : ['None known'],
          notes: formData.notes.trim() || '👤 Manually added: Patient record created manually by doctor. Please verify and update all information as needed.'
        },
        physicalInfo: {
          height: formData.heightUnit === 'cm'
            ? { value: parseFloat(formData.height), unit: 'cm' }
            : {
              value: 0,
              unit: 'ft/in',
              feet: parseInt(formData.feet) || 0,
              inches: parseInt(formData.inches) || 0
            },
          weight: {
            value: parseFloat(formData.weight),
            unit: formData.weightUnit
          }
        },
        contactInfo: {
          phoneNumber: formData.phoneNumber.trim(),
          email: formData.email.trim(),
          address: {
            street: formData.street.trim(),
            city: formData.city.trim(),
            governorate: formData.governorate.trim(),
            postalCode: formData.postalCode.trim()
          }
        },
        doctorId: (() => {
          const doctorEmailToIdMap: { [key: string]: string } = {
            'doctor@patientcare.bh': 'doctor-001',
            'fatima.doctor@patientcare.bh': 'doctor-002',
            'mohammed.doctor@patientcare.bh': 'doctor-003',
            'aisha.doctor@patientcare.bh': 'doctor-004',
            'khalid.doctor@patientcare.bh': 'doctor-005'
          };
          return doctorEmailToIdMap[doctorId] || doctorId;
        })(),
        patientGlobalId: '' // Will be set by the storage system
      };

      patientRecordsStorage.addPatientRecord(newPatient);
      onAdd();
      onClose();
    } catch (error) {
      console.error('Error adding patient:', error);
      setErrors({ submit: 'Failed to add patient. Please try again.' });
    }
  };

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
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Add New Patient
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Add patients who have booked appointments or create new patient records
            </p>
          </div>
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

        {/* Tabs */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              onClick={() => setActiveTab('registered')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'registered' ? '2px solid #0d9488' : '2px solid transparent',
                color: activeTab === 'registered' ? '#0d9488' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📋 Registered Patients ({registeredPatients.length})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'new' ? '2px solid #0d9488' : '2px solid transparent',
                color: activeTab === 'new' ? '#0d9488' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              👤 New Patient (Walk-in)
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {errors.submit && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#991b1b',
              marginBottom: '20px'
            }}>
              {errors.submit}
            </div>
          )}

          {activeTab === 'registered' ? (
            /* Registered Patients Tab */
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Select a Registered Patient
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  These patients have booked appointments with you but don't have a patient record yet.
                </p>
              </div>

              {registeredPatients.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    No available patients
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    All patients who have booked appointments with you already have patient records, or no appointments have been booked yet.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {registeredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      style={{
                        padding: '16px',
                        border: selectedPatient?.id === patient.id ? '2px solid #0d9488' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedPatient?.id === patient.id ? '#f0fdfa' : 'white',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: selectedPatient?.id === patient.id ? '#0d9488' : '#6b7280',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '16px'
                        }}>
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                            {patient.name}
                          </h4>
                          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 2px 0' }}>
                            {patient.email}
                          </p>
                          {patient.cpr && (
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                              CPR: {patient.cpr}
                            </p>
                          )}
                        </div>
                        {selectedPatient?.id === patient.id && (
                          <div style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#0d9488',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons for Registered Tab */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddRegisteredPatient}
                  disabled={!selectedPatient}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: selectedPatient ? '#0d9488' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: selectedPatient ? 'pointer' : 'not-allowed',
                    opacity: selectedPatient ? 1 : 0.6
                  }}
                >
                  Add Selected Patient
                </button>
              </div>
            </div>
          ) : (
            /* New Patient Form Tab */
            <form onSubmit={handleSubmit}>

              {/* Personal Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Personal Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${errors.fullName ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Enter full name"
                    />
                    {errors.fullName && (
                      <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0 0' }}>
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      CPR Number *
                    </label>
                    <input
                      type="text"
                      value={formData.cprNumber}
                      onChange={(e) => handleInputChange('cprNumber', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${errors.cprNumber ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="9-digit CPR number"
                      maxLength={9}
                    />
                    {errors.cprNumber && (
                      <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0 0' }}>
                        {errors.cprNumber}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Age in years"
                      min="0"
                      max="150"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Contact Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="patient@email.com"
                    />
                    {errors.email && (
                      <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0 0' }}>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${errors.phoneNumber ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="+973 XXXX XXXX"
                    />
                    {errors.phoneNumber && (
                      <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0 0' }}>
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Building, Road, Block"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: `1px solid ${errors.city ? '#ef4444' : '#d1d5db'}`,
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Manama"
                    />
                    {errors.city && (
                      <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0 0' }}>
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Governorate
                    </label>
                    <select
                      value={formData.governorate}
                      onChange={(e) => handleInputChange('governorate', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select</option>
                      <option value="Capital">Capital</option>
                      <option value="Muharraq">Muharraq</option>
                      <option value="Northern">Northern</option>
                      <option value="Southern">Southern</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Physical Information */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Physical Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Height *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {formData.heightUnit === 'cm' ? (
                        <input
                          type="number"
                          value={formData.height}
                          onChange={(e) => handleInputChange('height', e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: `1px solid ${errors.height ? '#ef4444' : '#d1d5db'}`,
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                          placeholder="170"
                        />
                      ) : (
                        <>
                          <input
                            type="number"
                            value={formData.feet}
                            onChange={(e) => handleInputChange('feet', e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                            placeholder="5"
                          />
                          <input
                            type="number"
                            value={formData.inches}
                            onChange={(e) => handleInputChange('inches', e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                            placeholder="8"
                          />
                        </>
                      )}
                      <select
                        value={formData.heightUnit}
                        onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="cm">cm</option>
                        <option value="ft/in">ft/in</option>
                      </select>
                    </div>
                    {errors.height && (
                      <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0 0' }}>
                        {errors.height}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Weight *
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: `1px solid ${errors.weight ? '#ef4444' : '#d1d5db'}`,
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                        placeholder="70"
                      />
                      <select
                        value={formData.weightUnit}
                        onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                    {errors.weight && (
                      <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0 0' }}>
                        {errors.weight}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Medical History (Optional)
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Diagnoses (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.diagnoses}
                      onChange={(e) => handleInputChange('diagnoses', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Hypertension, Diabetes, etc."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Current Treatments (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.treatments}
                      onChange={(e) => handleInputChange('treatments', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Metformin 500mg, Lisinopril 10mg, etc."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Allergies (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                      placeholder="Penicillin, Shellfish, None known, etc."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                      placeholder="Any additional medical notes or observations..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#0d9488',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Add New Patient
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPatientForm;