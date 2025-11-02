import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useToast } from './Toast';
import { availabilityStorage, WeeklyAvailability, TimeSlot as StorageTimeSlot } from '../utils/availabilityStorage';

const EnhancedAvailability: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simplified weekly schedule state
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyAvailability>(availabilityStorage.getDefaultWeeklySchedule());

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.userType !== 'doctor' && parsedUser.userType !== 'admin') {
          showToast('Access denied. Doctors and admins only.', 'error');
          navigate('/');
          return;
        }
        setUser(parsedUser);
        loadDoctorAvailability(parsedUser.id || parsedUser.email);
      } catch (error) {
        console.error('Error parsing user data:', error);
        showToast('Error loading user data', 'error');
      }
    }
    setLoading(false);
  }, [navigate, showToast]);

  const loadDoctorAvailability = (doctorId: string) => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    if (availability) {
      setWeeklySchedule(availability.weeklySchedule);
    }
  };

  // Simplified day management
  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];
  const toggleDayAvailability = (dayKey: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        available: !prev[dayKey].available
      }
    }));

    // Auto-save when toggling availability
    if (user) {
      const doctorId = user.id || user.email;
      const updatedSchedule = {
        ...weeklySchedule,
        [dayKey]: {
          ...weeklySchedule[dayKey],
          available: !weeklySchedule[dayKey].available
        }
      };
      availabilityStorage.saveDoctorAvailability(doctorId, updatedSchedule, []);
      showToast(`${daysOfWeek.find(d => d.key === dayKey)?.label} availability updated`, 'success');
    }
  };

  const addTimeSlotToDay = (dayKey: string) => {
    const newSlot: StorageTimeSlot = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      start: '09:00',
      end: '10:00'
    };

    const updatedSchedule = {
      ...weeklySchedule,
      [dayKey]: {
        ...weeklySchedule[dayKey],
        timeSlots: [...weeklySchedule[dayKey].timeSlots, newSlot]
      }
    };

    setWeeklySchedule(updatedSchedule);

    // Auto-save when adding time slot
    if (user) {
      const doctorId = user.id || user.email;
      availabilityStorage.saveDoctorAvailability(doctorId, updatedSchedule, []);
    }
  };

  const removeTimeSlotFromDay = (dayKey: string, slotId: string) => {
    const updatedSchedule = {
      ...weeklySchedule,
      [dayKey]: {
        ...weeklySchedule[dayKey],
        timeSlots: weeklySchedule[dayKey].timeSlots.filter(slot => slot.id !== slotId)
      }
    };

    setWeeklySchedule(updatedSchedule);

    // Auto-save when removing time slot
    if (user) {
      const doctorId = user.id || user.email;
      availabilityStorage.saveDoctorAvailability(doctorId, updatedSchedule, []);
    }
  };

  const updateDayTimeSlot = (dayKey: string, slotId: string, field: 'start' | 'end', value: string) => {
    const updatedSchedule = {
      ...weeklySchedule,
      [dayKey]: {
        ...weeklySchedule[dayKey],
        timeSlots: weeklySchedule[dayKey].timeSlots.map(slot =>
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
    };

    setWeeklySchedule(updatedSchedule);

    // Auto-save when updating time slot
    if (user) {
      const doctorId = user.id || user.email;
      availabilityStorage.saveDoctorAvailability(doctorId, updatedSchedule, []);
    }
  };

  const handleSave = () => {
    if (!user) return;

    const doctorId = user.id || user.email;
    const success = availabilityStorage.saveDoctorAvailability(doctorId, weeklySchedule, []);

    if (success) {
      showToast('Availability saved successfully!', 'success');
    } else {
      showToast('Failed to save availability', 'error');
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
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading availability...</p>
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
              Manage Availability
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280'
            }}>
              Set your schedule and manage your availability for appointments
            </p>
          </div>

          {/* Simple Weekly Schedule */}
          <div>
            {/* Weekly Schedule Grid */}
            <div style={{
              display: 'grid',
              gap: '16px'
            }}>
              {daysOfWeek.map((day) => {
                const daySchedule = weeklySchedule[day.key];
                const hasTimeSlots = daySchedule.available && daySchedule.timeSlots.length > 0;

                return (
                  <div
                    key={day.key}
                    style={{
                      border: hasTimeSlots ? '2px solid #a7f3d0' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      backgroundColor: hasTimeSlots ? '#f8fafc' : 'white',
                      transition: 'all 0.2s',
                      position: 'relative',
                      boxShadow: hasTimeSlots ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
                    }}
                  >

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#111827',
                          margin: 0
                        }}>
                          {day.label}
                        </h4>
                        {hasTimeSlots && (
                          <span style={{
                            fontSize: '12px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            {daySchedule.timeSlots.length} slot{daySchedule.timeSlots.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={daySchedule.available}
                          onChange={() => toggleDayAvailability(day.key)}
                          style={{
                            width: '16px',
                            height: '16px',
                            accentColor: '#0d9488'
                          }}
                        />
                        <span style={{
                          fontSize: '14px',
                          color: daySchedule.available ? '#059669' : '#6b7280',
                          fontWeight: '500'
                        }}>
                          {daySchedule.available ? 'Available' : 'Unavailable'}
                        </span>
                      </label>
                    </div>

                    {daySchedule.available && (
                      <div>
                        {daySchedule.timeSlots.map((slot, index) => (
                          <div
                            key={slot.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginBottom: '12px',
                              padding: '14px',
                              backgroundColor: '#f0fdfa',
                              borderRadius: '8px',
                              border: '1px solid #a7f3d0',
                              position: 'relative'
                            }}
                          >
                            <div style={{
                              position: 'absolute',
                              left: '8px',
                              top: '8px',
                              fontSize: '10px',
                              color: '#0d9488',
                              fontWeight: '600',
                              backgroundColor: 'white',
                              padding: '2px 4px',
                              borderRadius: '3px'
                            }}>
                              #{index + 1}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '20px' }}>
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateDayTimeSlot(day.key, slot.id, 'start', e.target.value)}
                                style={{
                                  padding: '10px',
                                  border: '2px solid #0d9488',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  backgroundColor: 'white',
                                  color: '#0d9488'
                                }}
                              />
                              <span style={{
                                color: '#0d9488',
                                fontSize: '14px',
                                fontWeight: '600',
                                padding: '0 4px'
                              }}>
                                →
                              </span>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateDayTimeSlot(day.key, slot.id, 'end', e.target.value)}
                                style={{
                                  padding: '10px',
                                  border: '2px solid #0d9488',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  backgroundColor: 'white',
                                  color: '#0d9488'
                                }}
                              />
                              <button
                                onClick={() => removeTimeSlotFromDay(day.key, slot.id)}
                                type="button"
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  outline: 'none',
                                  WebkitTapHighlightColor: 'transparent',
                                  pointerEvents: 'auto',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#b91c1c';
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#dc2626';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                ✕ Remove
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() => addTimeSlotToDay(day.key)}
                          type="button"
                          style={{
                            padding: '12px 20px',
                            backgroundColor: '#0d9488',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            outline: 'none',
                            WebkitTapHighlightColor: 'transparent',
                            pointerEvents: 'auto',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '8px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0f766e';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#0d9488';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <span>➕</span>
                          Add Time Slot
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div style={{
              marginTop: '32px',
              textAlign: 'center'
            }}>
              <button
                onClick={handleSave}
                style={{
                  padding: '16px 32px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f766e';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0d9488';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                💾 Save Availability Schedule
              </button>
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

export default EnhancedAvailability;