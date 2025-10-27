import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { appointmentStorage } from '../../utils/appointmentStorage';
import { User } from '../../utils/userStorage';

interface BookingModalProps {
  doctor: User;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ doctor, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'follow-up' | 'check-up'>('consultation');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  // Load available slots for selected date
  useEffect(() => {
    if (selectedDate) {
      const allSlots = generateTimeSlots();
      const bookedAppointments = appointmentStorage.getDoctorAppointmentsByDateAndStatus(
        doctor.id, 
        selectedDate, 
        'confirmed'
      );
      const bookedTimes = bookedAppointments.map(apt => apt.time);
      const available = allSlots.filter(slot => !bookedTimes.includes(slot));
      setAvailableSlots(available);
      
      // Reset selected time if it's no longer available
      if (selectedTime && !available.includes(selectedTime)) {
        setSelectedTime('');
      }
    }
  }, [selectedDate, doctor.id, selectedTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      showToast('Please select date and time', 'error');
      return;
    }

    setLoading(true);

    try {
      // Get current user data
      const userData = localStorage.getItem('userData');
      if (!userData) {
        showToast('Please log in to book appointment', 'error');
        return;
      }

      const user = JSON.parse(userData);

      // Create appointment
      const appointment = appointmentStorage.addAppointment({
        patientId: user.id || user.email,
        patientName: user.name,
        patientEmail: user.email,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: selectedDate,
        time: selectedTime,
        duration: 30,
        type: appointmentType,
        status: 'pending',
        notes: notes.trim() || undefined,
        fee: doctor.consultationFee || 25
      });

      if (appointment) {
        onSuccess();
      } else {
        showToast('Failed to book appointment', 'error');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      showToast('Failed to book appointment', 'error');
    } finally {
      setLoading(false);
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
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>
            Book Appointment
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Doctor Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
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
              fontSize: '18px'
            }}>
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              {doctor.name}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              {doctor.specialization} • BHD {doctor.consultationFee || 25}
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit}>
          {/* Date Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Select Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0d9488'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Time Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Select Time *
            </label>
            {selectedDate ? (
              availableSlots.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '8px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
                }}>
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        padding: '8px 12px',
                        border: selectedTime === slot ? '2px solid #0d9488' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: selectedTime === slot ? '#ecfdf5' : 'white',
                        color: selectedTime === slot ? '#0d9488' : '#374151',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTime !== slot) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTime !== slot) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#dc2626',
                    margin: 0
                  }}>
                    No available slots for this date. Please select another date.
                  </p>
                </div>
              )
            ) : (
              <div style={{
                padding: '16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Please select a date first
                </p>
              </div>
            )}
          </div>

          {/* Appointment Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Appointment Type *
            </label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value as any)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: 'white',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0d9488'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="check-up">Check-up</option>
            </select>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your symptoms or reason for visit..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0d9488'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Summary */}
          {selectedDate && selectedTime && (
            <div style={{
              padding: '16px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #d1fae5',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#065f46',
                margin: '0 0 8px 0'
              }}>
                Appointment Summary
              </h4>
              <div style={{ fontSize: '14px', color: '#047857', lineHeight: '1.5' }}>
                <p style={{ margin: '0 0 4px 0' }}>
                  <strong>Date:</strong> {formatDate(selectedDate)}
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                  <strong>Time:</strong> {formatTime(selectedTime)}
                </p>
                <p style={{ margin: '0 0 4px 0' }}>
                  <strong>Type:</strong> {appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1)}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Fee:</strong> BHD {doctor.consultationFee || 25}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              style={{
                padding: '12px 24px',
                background: (loading || !selectedDate || !selectedTime) 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (loading || !selectedDate || !selectedTime) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading && selectedDate && selectedTime) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && selectedDate && selectedTime) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>

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

export default BookingModal;