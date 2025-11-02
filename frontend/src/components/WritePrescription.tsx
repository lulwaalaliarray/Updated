import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import { useToast } from './Toast';
import { prescriptionStorage } from '../utils/prescriptionStorage';
import { isLoggedIn } from '../utils/navigation';

const WritePrescription: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pastPatients, setPastPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [availableAppointments, setAvailableAppointments] = useState<any[]>([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medications, setMedications] = useState([
    {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }
  ]);

  useEffect(() => {
    console.log('WritePrescription useEffect running...');
    
    // Check if user is logged in and is a doctor
    if (!isLoggedIn()) {
      console.log('User not logged in, redirecting to login');
      showToast('Please log in to write prescriptions', 'error');
      navigate('/login');
      return;
    }

    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user:', parsedUser);
        
        if (parsedUser.userType !== 'doctor') {
          console.log('User is not a doctor, redirecting to home');
          showToast('Access denied. Doctors only.', 'error');
          navigate('/');
          return;
        }
        setUser(parsedUser);
        loadPastPatients(parsedUser.id || parsedUser.email);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    }
    setLoading(false);
  }, [navigate, showToast]);

  const loadPastPatients = (doctorId: string) => {
    // Get appointments that are available for prescription (completed, no prescription yet)
    const availableAppointments = prescriptionStorage.getAppointmentsAvailableForPrescription(doctorId);
    
    // Get unique patients from these appointments
    const uniquePatients = availableAppointments.reduce((acc: any[], appointment) => {
      const existingPatient = acc.find(p => p.patientId === appointment.patientId);
      if (!existingPatient) {
        acc.push({
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          patientEmail: appointment.patientEmail,
          lastVisit: appointment.date,
          availableVisits: availableAppointments.filter(apt => 
            apt.patientId === appointment.patientId || apt.patientEmail === appointment.patientEmail
          ).length
        });
      }
      return acc;
    }, []);
    setPastPatients(uniquePatients);
  };

  // Load available appointments when patient is selected
  const handlePatientSelection = (patientId: string) => {
    setSelectedPatient(patientId);
    setSelectedAppointment('');
    
    if (patientId && user) {
      const appointments = prescriptionStorage.getPatientAppointmentsForPrescription(
        user.id || user.email, 
        patientId
      );
      setAvailableAppointments(appointments);
    } else {
      setAvailableAppointments([]);
    }
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setMedications(updatedMedications);
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate submission');
      return false;
    }
    
    setIsSubmitting(true);
    console.log('Starting prescription submission...');
    
    try {
      // Enhanced validation including appointment selection
      if (!selectedPatient || !selectedAppointment || !diagnosis.trim()) {
        showToast('Please select a patient, appointment date, and enter a diagnosis', 'error');
        return false;
      }

      // Check if prescription already exists for this appointment
      if (prescriptionStorage.prescriptionExistsForAppointment(selectedAppointment)) {
        showToast('A prescription has already been issued for this appointment', 'error');
        return false;
      }

      const validMedications = medications.filter(med => 
        med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
      );

      if (validMedications.length === 0) {
        showToast('Please add at least one complete medication', 'error');
        return false;
      }

      const selectedPatientData = pastPatients.find(p => p.patientId === selectedPatient);
      const selectedAppointmentData = availableAppointments.find(apt => apt.id === selectedAppointment);
      
      if (!selectedPatientData || !selectedAppointmentData) {
        showToast('Selected patient or appointment not found', 'error');
        return false;
      }

      const newPrescription = prescriptionStorage.addPrescription({
        patientId: selectedPatient,
        patientName: selectedPatientData.patientName,
        patientEmail: selectedPatientData.patientEmail,
        doctorId: user.id || user.email,
        doctorName: user.name,
        appointmentId: selectedAppointment, // NEW: Link to appointment
        appointmentDate: selectedAppointmentData.date, // NEW: Visit date
        medications: validMedications,
        diagnosis: diagnosis.trim(),
        notes: notes.trim(),
        dateIssued: new Date().toISOString().split('T')[0],
        status: 'active'
      });

      console.log('Prescription created successfully:', newPrescription);
      showToast('Prescription created successfully for the selected visit!', 'success');
      
      // Reset form and reload patients (to update available visits count)
      setSelectedPatient('');
      setSelectedAppointment('');
      setAvailableAppointments([]);
      setDiagnosis('');
      setNotes('');
      setMedications([{
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]);
      
      // Reload patients to reflect updated availability
      if (user) {
        loadPastPatients(user.id || user.email);
      }
      
      console.log('Prescription submission completed successfully');
      return false; // Prevent any default form behavior
    } catch (error) {
      console.error('Error creating prescription:', error);
      showToast('Error creating prescription', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
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
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</div>
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
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <Header />

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
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
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Write Prescription
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>
            Create and send prescriptions to your patients
          </p>
        </div>

        {/* Prescription Form */}
        <form 
          onSubmit={handleSubmit}
          onReset={(e) => e.preventDefault()}
          method="post"
          action="#"
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            {/* Patient Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Select Patient *
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => handlePatientSelection(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
                required
              >
                <option value="">Choose a patient...</option>
                {pastPatients.map((patient) => (
                  <option key={patient.patientId} value={patient.patientId}>
                    {patient.patientName} ({patient.patientEmail}) - {patient.availableVisits} visit(s) available
                  </option>
                ))}
              </select>
              {pastPatients.length === 0 && (
                <p style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  marginTop: '4px'
                }}>
                  No patients with completed visits available for prescription. Patients must have completed appointments to receive prescriptions.
                </p>
              )}
            </div>

            {/* Appointment Selection */}
            {selectedPatient && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Select Visit Date *
                </label>
                <select
                  value={selectedAppointment}
                  onChange={(e) => setSelectedAppointment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box'
                  }}
                  required
                >
                  <option value="">Choose a visit date...</option>
                  {availableAppointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {appointment.time} - {appointment.type}
                    </option>
                  ))}
                </select>
                
                {availableAppointments.length === 0 && (
                  <p style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '4px'
                  }}>
                    No completed visits available for prescription. All visits for this patient already have prescriptions.
                  </p>
                )}
                
                {availableAppointments.length > 0 && (
                  <p style={{
                    fontSize: '12px',
                    color: '#059669',
                    marginTop: '4px'
                  }}>
                    ✓ {availableAppointments.length} completed visit(s) available for prescription
                  </p>
                )}
                
                <div style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '8px'
                }}>
                  <p style={{
                    fontSize: '12px',
                    color: '#1e40af',
                    margin: 0,
                    fontWeight: '500'
                  }}>
                    ℹ️ You can only issue one prescription per completed visit. Select the specific visit date for this prescription.
                  </p>
                </div>
              </div>
            )}

            {/* Diagnosis */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Diagnosis *
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter the diagnosis"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                required
              />
            </div>

            {/* Medications */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  Medications *
                </label>
                <button
                  type="button"
                  onClick={addMedication}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#0d9488',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Add Medication
                </button>
              </div>

              {medications.map((medication, index) => (
                <div key={index} style={{
                  padding: '20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      Medication {index + 1}
                    </h3>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        Medication Name *
                      </label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        placeholder="e.g., Paracetamol"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        Frequency *
                      </label>
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        placeholder="e.g., 3 times daily"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        Duration *
                      </label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      Instructions
                    </label>
                    <textarea
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take with food, avoid alcohol"
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional instructions or notes for the patient"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={pastPatients.length === 0 || isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(e);
                }}
                style={{
                  padding: '12px 32px',
                  backgroundColor: (pastPatients.length === 0 || isSubmitting) ? '#9ca3af' : '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (pastPatients.length === 0 || isSubmitting) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (pastPatients.length > 0 && !isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#0f766e';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pastPatients.length > 0 && !isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#0d9488';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isSubmitting && (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.364-7.364l-2.828 2.828M9.464 18.536l-2.828 2.828m12.728 0l-2.828-2.828M9.464 5.464L6.636 2.636"/>
                  </svg>
                )}
                {isSubmitting ? 'Creating Prescription...' : 'Send Prescription'}
              </button>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '8px',
                margin: '8px 0 0 0'
              }}>
                The prescription will be sent to the patient via email
              </p>
            </div>
          </div>
        </form>
      </div>

      <Footer />
      <BackToTopButton />
    </div>
  );
};

export default WritePrescription;