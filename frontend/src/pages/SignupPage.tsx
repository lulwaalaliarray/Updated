import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { routes } from '../utils/navigation';
import { userStorage, User } from '../utils/userStorage';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'patient',
    cpr: '',
    certification: null as File | null,
    specialization: '',
    consultationFee: '',
    experience: '',
    qualifications: '',
    availability: {
      monday: { available: false, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
      thursday: { available: false, startTime: '09:00', endTime: '17:00' },
      friday: { available: false, startTime: '09:00', endTime: '17:00' },
      saturday: { available: false, startTime: '09:00', endTime: '17:00' },
      sunday: { available: false, startTime: '09:00', endTime: '17:00' }
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day as keyof typeof formData.availability],
          [field]: value
        }
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({
      ...formData,
      certification: file
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.cpr) {
      showToast('Please fill in all required fields', 'error');
      setIsLoading(false);
      return;
    }

    // Doctor-specific validation
    if (formData.userType === 'doctor') {
      if (!formData.specialization || !formData.consultationFee || !formData.experience || !formData.qualifications) {
        showToast('Please fill in all doctor-specific fields', 'error');
        setIsLoading(false);
        return;
      }
      
      if (isNaN(Number(formData.consultationFee)) || Number(formData.consultationFee) <= 0) {
        showToast('Please enter a valid consultation fee', 'error');
        setIsLoading(false);
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      setIsLoading(false);
      return;
    }

    // CPR validation for Bahrain (9 digits)
    if (!/^\d{9}$/.test(formData.cpr)) {
      showToast('CPR must be exactly 9 digits', 'error');
      setIsLoading(false);
      return;
    }

    // Doctor-specific validation
    if (formData.userType === 'doctor' && !formData.certification) {
      showToast('Please upload your medical certification', 'error');
      setIsLoading(false);
      return;
    }

    try {
      // Check if user already exists
      if (userStorage.userExists(formData.email)) {
        showToast('An account with this email already exists', 'error');
        setIsLoading(false);
        return;
      }

      // Create user credentials object
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        password: formData.password, // In real app, this would be hashed
        userType: formData.userType as 'patient' | 'doctor',
        cpr: formData.cpr,
        status: 'active',
        createdAt: new Date().toISOString(),
        ...(formData.userType === 'doctor' && {
          specialization: formData.specialization,
          consultationFee: Number(formData.consultationFee),
          experience: formData.experience,
          qualifications: formData.qualifications,
          availability: formData.availability,
          rating: 0,
          reviewCount: 0
        })
      };

      // Store user credentials
      const success = userStorage.addUser(newUser);
      
      if (!success) {
        showToast('Failed to create account. Please try again.', 'error');
        setIsLoading(false);
        return;
      }

      // Show success message
      showToast('Account created successfully! Please log in to access your account.', 'success');
      
      // Clear form data
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'patient',
        cpr: '',
        certification: null,
        specialization: '',
        consultationFee: '',
        experience: '',
        qualifications: '',
        availability: {
          monday: { available: false, startTime: '09:00', endTime: '17:00' },
          tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
          wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
          thursday: { available: false, startTime: '09:00', endTime: '17:00' },
          friday: { available: false, startTime: '09:00', endTime: '17:00' },
          saturday: { available: false, startTime: '09:00', endTime: '17:00' },
          sunday: { available: false, startTime: '09:00', endTime: '17:00' }
        }
      });

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate(routes.login);
      }, 1500);
      
    } catch (error) {
      showToast('Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#0d9488',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4h4v4zm0-6h-4V7h4v4z"/>
              </svg>
            </div>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Join PatientCare
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Create your account to get started
          </p>
        </div>

        {/* Signup Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Account Type
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="patient">I am a Patient</option>
                <option value="doctor">I am a Doctor</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
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
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
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
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
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
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                CPR Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="cpr"
                value={formData.cpr}
                onChange={handleChange}
                placeholder="Enter your 9-digit CPR number"
                maxLength={9}
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
                onInput={(e) => {
                  // Only allow numbers
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/[^0-9]/g, '');
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                Your Civil Personal Record number (required for verification)
              </p>
            </div>

            {formData.userType === 'doctor' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  Medical Certification <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  transition: 'border-color 0.2s',
                  cursor: 'pointer'
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#0d9488';
                  e.currentTarget.style.backgroundColor = '#f0fdfa';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    setFormData({ ...formData, certification: files[0] });
                  }
                }}>
                  <input
                    type="file"
                    name="certification"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    id="certification-upload"
                  />
                  <label htmlFor="certification-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    {formData.certification ? (
                      <div>
                        <svg width="24" height="24" fill="#10b981" viewBox="0 0 24 24" style={{ margin: '0 auto 8px' }}>
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <p style={{ color: '#10b981', fontWeight: '500', margin: '0 0 4px' }}>
                          {formData.certification.name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div>
                        <svg width="24" height="24" fill="#9ca3af" viewBox="0 0 24 24" style={{ margin: '0 auto 8px' }}>
                          <path d="M7 14l5-5 5 5m-5-5v12"/>
                        </svg>
                        <p style={{ color: '#374151', fontWeight: '500', margin: '0 0 4px' }}>
                          Upload Medical License
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          PDF, JPG, PNG up to 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px'
                }}>
                  Upload your NHRA medical license or certification. This will be reviewed by our team.
                </p>
              </div>
            )}

            {formData.userType === 'doctor' && (
              <>
                {/* Specialization */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Specialization <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select your specialization</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Pulmonology">Pulmonology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Urology">Urology</option>
                    <option value="Emergency Medicine">Emergency Medicine</option>
                    <option value="Family Medicine">Family Medicine</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="ENT">ENT (Ear, Nose, Throat)</option>
                    <option value="Anesthesiology">Anesthesiology</option>
                  </select>
                </div>

                {/* Consultation Fee */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Consultation Fee (BHD) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    placeholder="e.g., 25"
                    min="1"
                    step="0.5"
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
                  />
                </div>

                {/* Experience */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Years of Experience <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 5 years"
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
                  />
                </div>

                {/* Qualifications */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Qualifications <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    placeholder="e.g., MBBS, MD, Board Certified in Cardiology"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.2s',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Availability */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '12px'
                  }}>
                    Weekly Availability
                  </label>
                  <div style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f9fafb'
                  }}>
                    {Object.entries(formData.availability).map(([day, schedule]) => (
                      <div key={day} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          minWidth: '100px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={schedule.available}
                            onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                            style={{
                              width: '16px',
                              height: '16px',
                              accentColor: '#0d9488'
                            }}
                          />
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            textTransform: 'capitalize'
                          }}>
                            {day}
                          </span>
                        </label>
                        {schedule.available && (
                          <>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                              style={{
                                padding: '6px 8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                            />
                            <span style={{ color: '#6b7280', fontSize: '14px' }}>to</span>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                              style={{
                                padding: '6px 8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Set your weekly availability. You can modify this later in your profile.
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Sign In Link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link 
              to={routes.login}
              style={{
                color: '#0d9488',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link 
            to={routes.home}
            style={{
              fontSize: '14px',
              color: '#9ca3af',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>

      {/* Add spinning animation */}
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

export default SignupPage;