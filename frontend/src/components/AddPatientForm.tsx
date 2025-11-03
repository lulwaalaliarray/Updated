import React, { useState } from 'react';
import { PatientRecord, patientRecordsStorage } from '../utils/patientRecordsStorage';
import { inputValidation } from '../utils/inputValidation';

interface AddPatientFormProps {
  doctorId: string;
  onClose: () => void;
  onAdd: () => void;
}



const AddPatientForm: React.FC<AddPatientFormProps> = ({ doctorId, onClose, onAdd }) => {
  
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



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
          notes: formData.notes.trim()
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
        doctorId,
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
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Add New Patient
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
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
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientForm;