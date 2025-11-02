import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { appointmentStorage } from '../utils/appointmentStorage';
import { availabilityStorage } from '../utils/availabilityStorage';

interface BookAppointmentDemoProps {
  doctorId: string;
  doctorName: string;
  onClose: () => void;
}

const BookAppointmentDemo: React.FC<BookAppointmentDemoProps> = ({ doctorId, doctorName, onClose }) => {
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'follow-up' | 'check-up'>('consultation');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Update available time slots when date changes
  useEffect(() => {
    setAvailableTimeSlots(getAvailableTimeSlots());
    setSelectedTime(''); // Reset selected time when date changes
  }, [selectedDate, doctorId]);

  // Generate available dates (next 14 days) - based on doctor's weekly schedule, calendar overrides, and unavailable dates
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Get doctor's availability data
    const doctorAvailability = availabilityStorage.getDoctorAvailability(doctorId);
    if (!doctorAvailability) {
      // If no availability data, return empty (doctor hasn't set schedule)
      return [];
    }
    
    const unavailableDates = doctorAvailability.unavailableDates || [];
    const unavailableDateStrings = unavailableDates.map(ud => ud.date);
    const weeklySchedule = doctorAvailability.weeklySchedule;
    const calendarOverrides = doctorAvailability.calendarOverrides || {};
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const dayName = dayNames[dayOfWeek];
      
      // Skip if date is marked as unavailable
      if (unavailableDateStrings.includes(dateString)) {
        continue;
      }
      
      // Check for calendar override first
      if (calendarOverrides[dateString]) {
        // Has calendar override - include if it has time slots
        if (calendarOverrides[dateString].length > 0) {
          dates.push(dateString);
        }
      } else {
        // No override - check weekly schedule
        const dayAvailability = weeklySchedule[dayName];
        const isDoctorAvailableOnThisDay = dayAvailability && dayAvailability.available && dayAvailability.timeSlots.length > 0;
        
        if (isDoctorAvailableOnThisDay) {
          dates.push(dateString);
        }
      }
    }
    
    return dates;
  };

  // Generate available time slots based on doctor's weekly schedule, calendar overrides, and existing bookings
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    
    // Use the enhanced availabilityStorage method that handles both weekly schedule and calendar overrides
    return availabilityStorage.getAvailableSlots(doctorId, selectedDate, 30);
    
    // Get existing appointments for this doctor on the selected date
    const existingAppointments = appointmentStorage.getAllAppointments();
    const bookedTimes = existingAppointments
      .filter(apt => 
        apt.doctorId === doctorId && 
        apt.date === selectedDate && 
        (apt.status === 'confirmed' || apt.status === 'pending')
      )
      .map(apt => apt.time);
    
    // Return only unbooked time slots from doctor's available times
    return availableSlots.filter(time => !bookedTimes.includes(time));
  };

  // Helper function to generate 30-minute time slots between start and end time
  const generateTimeSlotsInRange = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    const current = new Date(start);
    
    while (current < end) {
      const timeString = current.toTimeString().slice(0, 5); // Format as HH:MM
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + 30); // 30-minute intervals
    }
    
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      showToast('Please select both date and time', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user data
      const userData = localStorage.getItem('userData');
      if (!userData) {
        showToast('Please log in to book an appointment', 'error');
        return;
      }

      const user = JSON.parse(userData);
      
      // Create new appointment
      const newAppointment = appointmentStorage.addAppointment({
        patientId: user.id || user.email,
        patientName: user.name,
        patientEmail: user.email,
        doctorId: doctorId,
        doctorName: doctorName,
        date: selectedDate,
        time: selectedTime,
        duration: 30,
        type: appointmentType,
        status: 'pending',
        notes: notes || `${appointmentType} appointment`,
        fee: 25
      });

      if (newAppointment) {
        showToast('Appointment booked successfully! Awaiting doctor approval.', 'success');
        onClose();
      } else {
        showToast('Failed to book appointment. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      showToast('Error booking appointment. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
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
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '4px'
          }}>
            Dr. {doctorName}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Select your preferred date and time
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Appointment Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Appointment Type
              </label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value as 'consultation' | 'follow-up' | 'check-up')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="check-up">Check-up</option>
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Preferred Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
                required
              >
                <option value="">Select a date</option>
                {getAvailableDates().map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
              
              {getAvailableDates().length === 0 && (
                <p style={{
                  fontSize: '14px',
                  color: '#dc2626',
                  marginTop: '8px',
                  fontWeight: '500'
                }}>
                  ⚠️ No available dates. The doctor hasn't set their working schedule yet or has no availability in the next 14 days.
                </p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Preferred Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
                required
              >
                <option value="">Select a time</option>
                {availableTimeSlots.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              
              {selectedDate && availableTimeSlots.length === 0 && (
                <p style={{
                  fontSize: '14px',
                  color: '#dc2626',
                  marginTop: '8px',
                  fontWeight: '500'
                }}>
                  ⚠️ No available time slots for this date. The doctor may not have set working hours for this day, or all slots are booked.
                </p>
              )}
              
              {selectedDate && availableTimeSlots.length > 0 && (
                <p style={{
                  fontSize: '14px',
                  color: '#059669',
                  marginTop: '8px'
                }}>
                  ✓ {availableTimeSlots.length} time slot(s) available
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
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
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Fee Information */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Consultation Fee:
                </span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827'
                }}>
                  25 BHD
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentDemo;