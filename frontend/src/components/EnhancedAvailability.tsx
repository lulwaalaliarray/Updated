import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useToast } from './Toast';
import { availabilityStorage, WeeklyAvailability, TimeSlot as StorageTimeSlot, UnavailableDate } from '../utils/availabilityStorage';

const EnhancedAvailability: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // View mode state
  const [viewMode, setViewMode] = useState<'weekly' | 'calendar'>('weekly');

  // Simplified weekly schedule state
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyAvailability>(availabilityStorage.getDefaultWeeklySchedule());

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isSelectingDates, setIsSelectingDates] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [newUnavailableReason, setNewUnavailableReason] = useState('');
  const [newUnavailableType, setNewUnavailableType] = useState<'vacation' | 'sick' | 'conference' | 'other'>('vacation');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Only show access denied if user data is properly loaded and user is not doctor/admin
        if (parsedUser && parsedUser.userType && parsedUser.userType !== 'doctor' && parsedUser.userType !== 'admin') {
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

  // Effect to update calendar when unavailable dates change
  useEffect(() => {
    // Force re-render of calendar when unavailable dates change
    // This ensures the calendar reflects the latest unavailable dates
  }, [unavailableDates]);

  const loadDoctorAvailability = (doctorId: string) => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    if (availability) {
      setWeeklySchedule(availability.weeklySchedule || availabilityStorage.getDefaultWeeklySchedule());
      setUnavailableDates(availability.unavailableDates || []);
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
    setWeeklySchedule(prev => {
      const safePrev = prev || availabilityStorage.getDefaultWeeklySchedule();
      const currentDay = safePrev[dayKey] || { available: false, timeSlots: [] };
      return {
        ...safePrev,
        [dayKey]: {
          ...currentDay,
          available: !currentDay.available
        }
      };
    });

    // Auto-save when toggling availability
    if (user) {
      const doctorId = user.id || user.email;
      const safeSchedule = weeklySchedule || availabilityStorage.getDefaultWeeklySchedule();
      const currentDay = safeSchedule[dayKey] || { available: false, timeSlots: [] };
      const updatedSchedule = {
        ...safeSchedule,
        [dayKey]: {
          ...currentDay,
          available: !currentDay.available
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

    const safeSchedule = weeklySchedule || availabilityStorage.getDefaultWeeklySchedule();
    const currentDay = safeSchedule[dayKey] || { available: false, timeSlots: [] };
    const updatedSchedule = {
      ...safeSchedule,
      [dayKey]: {
        ...currentDay,
        timeSlots: [...currentDay.timeSlots, newSlot]
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
    const safeSchedule = weeklySchedule || availabilityStorage.getDefaultWeeklySchedule();
    const currentDay = safeSchedule[dayKey] || { available: false, timeSlots: [] };
    const updatedSchedule = {
      ...safeSchedule,
      [dayKey]: {
        ...currentDay,
        timeSlots: currentDay.timeSlots.filter(slot => slot.id !== slotId)
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
    const safeSchedule = weeklySchedule || availabilityStorage.getDefaultWeeklySchedule();
    const currentDay = safeSchedule[dayKey] || { available: false, timeSlots: [] };
    const updatedSchedule = {
      ...safeSchedule,
      [dayKey]: {
        ...currentDay,
        timeSlots: currentDay.timeSlots.map(slot =>
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

  // Calendar helper functions
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateUnavailable = (date: Date) => {
    const dateString = formatDateString(date);
    return unavailableDates.some(ud => ud.date === dateString);
  };

  const isDateSelected = (date: Date) => {
    const dateString = formatDateString(date);
    return selectedDates.includes(dateString);
  };

  const handleDateClick = (date: Date) => {
    const dateString = formatDateString(date);
    const isUnavailable = isDateUnavailable(date);
    
    if (isUnavailable && !isSelectingDates) {
      // Show details of unavailable date
      const unavailableDate = unavailableDates.find(ud => ud.date === dateString);
      if (unavailableDate) {
        const emoji = { vacation: '🏖️', sick: '🤒', conference: '🎯', other: '📝' }[unavailableDate.type];
        showToast(
          `${emoji} ${unavailableDate.type.toUpperCase()}: ${unavailableDate.reason || 'No reason provided'} (${new Date(date).toLocaleDateString()})`,
          'info'
        );
      }
      return;
    }
    
    if (!isSelectingDates) return;

    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter(d => d !== dateString));
    } else {
      setSelectedDates([...selectedDates, dateString]);
    }
  };

  const addUnavailableDates = async () => {
    if (selectedDates.length === 0 || !newUnavailableReason.trim()) {
      showToast('Please select dates and provide a reason', 'error');
      return;
    }

    setIsSaving(true);
    
    const newUnavailable = selectedDates.map(date => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date,
      reason: newUnavailableReason,
      type: newUnavailableType
    }));

    const updatedUnavailableDates = [...unavailableDates, ...newUnavailable];
    setUnavailableDates(updatedUnavailableDates);
    
    // Auto-save the unavailable dates immediately
    if (user) {
      const doctorId = user.id || user.email;
      const success = availabilityStorage.saveDoctorAvailability(doctorId, weeklySchedule, updatedUnavailableDates);
      
      if (success) {
        showToast(`Added ${selectedDates.length} unavailable date${selectedDates.length > 1 ? 's' : ''} and saved!`, 'success');
      } else {
        showToast('Added dates but failed to save. Please click Save button.', 'error');
      }
    }
    
    setSelectedDates([]);
    setNewUnavailableReason('');
    setIsSelectingDates(false);
    setIsSaving(false);
  };

  const removeUnavailableDate = async (dateId: string) => {
    setIsSaving(true);
    
    const updatedUnavailableDates = unavailableDates.filter(ud => ud.id !== dateId);
    setUnavailableDates(updatedUnavailableDates);
    
    // Auto-save the changes immediately
    if (user) {
      const doctorId = user.id || user.email;
      const success = availabilityStorage.saveDoctorAvailability(doctorId, weeklySchedule, updatedUnavailableDates);
      
      if (success) {
        showToast('Removed unavailable date and saved!', 'success');
      } else {
        showToast('Removed date but failed to save. Please click Save button.', 'error');
      }
    } else {
      showToast('Removed unavailable date', 'success');
    }
    
    setIsSaving(false);
  };

  const getUnavailableTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return { bg: '#dbeafe', color: '#1d4ed8' };
      case 'sick': return { bg: '#fee2e2', color: '#dc2626' };
      case 'conference': return { bg: '#f3e8ff', color: '#7c3aed' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const handleSave = () => {
    if (!user) return;

    const doctorId = user.id || user.email;
    const safeSchedule = weeklySchedule || availabilityStorage.getDefaultWeeklySchedule();
    
    // Save both weekly schedule and unavailable dates
    const success = availabilityStorage.saveDoctorAvailability(doctorId, safeSchedule, unavailableDates);

    if (success) {
      showToast('Availability and unavailable dates saved successfully!', 'success');
      
      // Also update user data for backward compatibility
      try {
        const allUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = allUsers.findIndex((u: any) => u.email === user.email);
        
        if (userIndex !== -1) {
          allUsers[userIndex] = {
            ...allUsers[userIndex],
            enhancedAvailability: safeSchedule,
            unavailableDates: unavailableDates
          };
          
          localStorage.setItem('registeredUsers', JSON.stringify(allUsers));
          localStorage.setItem('userData', JSON.stringify(allUsers[userIndex]));
        }
      } catch (error) {
        console.error('Error updating user data:', error);
      }
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

          {/* View Mode Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: '8px',
            marginBottom: '32px'
          }}>
            <button
              onClick={() => setViewMode('weekly')}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: viewMode === 'weekly' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: viewMode === 'weekly' ? '#0d9488' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                boxShadow: viewMode === 'weekly' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📋 Weekly Schedule
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: viewMode === 'calendar' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: viewMode === 'calendar' ? '#0d9488' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                boxShadow: viewMode === 'calendar' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📅 Calendar View
            </button>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'weekly' ? (
            /* Weekly Schedule */
            <div>
              <div style={{
                display: 'grid',
                gap: '16px'
              }}>
                {daysOfWeek.map((day) => {
                const daySchedule = (weeklySchedule && weeklySchedule[day.key]) || { available: false, timeSlots: [] };
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
            </div>
          ) : (
            /* Calendar View */
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth >= 1024 ? '2fr 1fr' : '1fr', gap: '32px' }}>
              {/* Calendar */}
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: '0 0 4px 0'
                    }}>
                      Calendar View
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {isSelectingDates 
                        ? 'Click dates to select for marking as unavailable'
                        : 'Click unavailable dates (🏖️🤒🎯📝) to view details'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSelectingDates(!isSelectingDates)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isSelectingDates ? '#dc2626' : '#0d9488',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {isSelectingDates ? '❌ Cancel Selection' : '📅 Select Dates'}
                  </button>
                </div>

                {/* Calendar Navigation */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#0d9488';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    ← Previous
                  </button>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0
                  }}>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#0d9488';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  >
                    Next →
                  </button>
                </div>

                {/* Calendar Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '2px',
                  marginBottom: '16px'
                }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{
                      padding: '12px 4px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      backgroundColor: 'white',
                      borderRadius: '4px'
                    }}>
                      {day}
                    </div>
                  ))}

                  {generateCalendarDays().map((date, index) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isUnavailable = isDateUnavailable(date);
                    const isSelected = isDateSelected(date);
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                    
                    // Get unavailable date details if it exists
                    const unavailableDate = unavailableDates.find(ud => ud.date === formatDateString(date));
                    const unavailableTypeEmoji = unavailableDate ? {
                      'vacation': '🏖️',
                      'sick': '🤒',
                      'conference': '🎯',
                      'other': '📝'
                    }[unavailableDate.type] : '';

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        disabled={isPast}
                        title={
                          isUnavailable && unavailableDate 
                            ? `${unavailableDate.type.toUpperCase()}: ${unavailableDate.reason || 'No reason provided'}`
                            : isToday 
                              ? 'Today'
                              : isPast 
                                ? 'Past date'
                                : isSelectingDates 
                                  ? 'Click to select'
                                  : 'Available date'
                        }
                        style={{
                          padding: '8px 4px',
                          textAlign: 'center',
                          fontSize: '12px',
                          fontWeight: '500',
                          border: isUnavailable ? '2px solid #dc2626' : isSelected ? '2px solid #0d9488' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: !isPast ? 'pointer' : 'default',
                          backgroundColor:
                            isSelected ? '#0d9488' :
                              isUnavailable ? '#fee2e2' :
                                isToday ? '#f0fdfa' :
                                  'white',
                          color:
                            isSelected ? 'white' :
                              isUnavailable ? '#dc2626' :
                                isToday ? '#0d9488' :
                                  isCurrentMonth ? '#111827' : '#9ca3af',
                          opacity: isPast ? 0.5 : 1,
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 2px 4px rgba(13, 148, 136, 0.3)' : 
                                    isUnavailable ? '0 2px 4px rgba(220, 38, 38, 0.2)' : 'none',
                          position: 'relative',
                          minHeight: '40px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if ((isSelectingDates && !isPast && !isSelected) || isUnavailable) {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            if (!isUnavailable && !isSelected) {
                              e.currentTarget.style.backgroundColor = '#f0fdfa';
                              e.currentTarget.style.color = '#0d9488';
                            }
                          }
                        }}
                        onMouseLeave={(e) => {
                          if ((isSelectingDates && !isPast && !isSelected) || isUnavailable) {
                            e.currentTarget.style.transform = 'scale(1)';
                            if (!isUnavailable && !isSelected) {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.color = isCurrentMonth ? '#111827' : '#9ca3af';
                            }
                          }
                        }}
                      >
                        <div>{date.getDate()}</div>
                        {isUnavailable && unavailableTypeEmoji && (
                          <div style={{ fontSize: '10px', lineHeight: '1' }}>
                            {unavailableTypeEmoji}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#f0fdfa', border: '1px solid #5eead4', borderRadius: '3px' }}></div>
                    <span style={{ color: '#6b7280' }}>Today</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '3px' }}></div>
                    <span style={{ color: '#6b7280' }}>Unavailable</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#0d9488', borderRadius: '3px' }}></div>
                    <span style={{ color: '#6b7280' }}>Selected</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '3px' }}></div>
                    <span style={{ color: '#6b7280' }}>Available</span>
                  </div>
                </div>

                {/* Selection Info */}
                {isSelectingDates && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f0fdfa',
                    borderRadius: '8px',
                    border: '1px solid #5eead4',
                    marginBottom: '16px'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#0d9488',
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {selectedDates.length === 0 
                        ? '📅 Click on dates to select them as unavailable'
                        : `✅ ${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''} selected`
                      }
                    </p>
                    {selectedDates.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <p style={{ fontSize: '12px', color: '#047857', margin: '0 0 4px 0', fontWeight: '500' }}>
                          Selected dates:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {selectedDates.map(date => (
                            <span key={date} style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              backgroundColor: '#ecfdf5',
                              color: '#065f46',
                              borderRadius: '4px',
                              border: '1px solid #a7f3d0'
                            }}>
                              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Add Unavailable Dates Form */}
                {isSelectingDates && selectedDates.length > 0 && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '16px'
                    }}>
                      Mark Selected Dates as Unavailable
                    </h4>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Type of Unavailability
                      </label>
                      <select
                        value={newUnavailableType}
                        onChange={(e) => setNewUnavailableType(e.target.value as any)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="vacation">🏖️ Vacation</option>
                        <option value="sick">🤒 Sick Leave</option>
                        <option value="conference">🎯 Conference/Meeting</option>
                        <option value="other">📝 Other</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Reason
                      </label>
                      <input
                        type="text"
                        value={newUnavailableReason}
                        onChange={(e) => setNewUnavailableReason(e.target.value)}
                        placeholder="Enter reason for unavailability..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <button
                      onClick={addUnavailableDates}
                      disabled={isSaving}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: isSaving ? '#9ca3af' : '#0d9488',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.backgroundColor = '#0f766e';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSaving) {
                          e.currentTarget.style.backgroundColor = '#0d9488';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {isSaving && (
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid transparent',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      )}
                      {isSaving 
                        ? 'Saving...' 
                        : `✅ Mark ${selectedDates.length} Date${selectedDates.length > 1 ? 's' : ''} as Unavailable`
                      }
                    </button>
                  </div>
                )}
              </div>

              {/* Unavailable Dates List */}
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111827',
                      margin: 0
                    }}>
                      Unavailable Dates
                    </h3>
                    {isSaving && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: '#0d9488'
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid transparent',
                          borderTop: '2px solid #0d9488',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Saving...
                      </div>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
                      borderRadius: '12px',
                      fontWeight: '500'
                    }}>
                      {unavailableDates.filter(ud => new Date(ud.date) >= new Date(new Date().setHours(0, 0, 0, 0))).length} upcoming
                    </span>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '12px',
                      fontWeight: '500'
                    }}>
                      {unavailableDates.length} total
                    </span>
                  </div>
                </div>

                {unavailableDates.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '32px 16px',
                    color: '#6b7280'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                    <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                      No unavailable dates set
                    </p>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                      Use the calendar to select dates when you're not available
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Type Summary */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      {['vacation', 'sick', 'conference', 'other'].map(type => {
                        const count = unavailableDates.filter(ud => ud.type === type).length;
                        const typeStyle = getUnavailableTypeColor(type);
                        const emoji = { vacation: '🏖️', sick: '🤒', conference: '🎯', other: '📝' }[type];
                        
                        return count > 0 ? (
                          <div key={type} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 8px',
                            backgroundColor: typeStyle.bg,
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}>
                            <span>{emoji}</span>
                            <span style={{ color: typeStyle.color, fontWeight: '500' }}>
                              {count} {type}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>

                    {/* Dates List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                      {unavailableDates
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((unavailable) => {
                          const typeStyle = getUnavailableTypeColor(unavailable.type);
                          const isUpcoming = new Date(unavailable.date) >= new Date(new Date().setHours(0, 0, 0, 0));
                          const emoji = { vacation: '🏖️', sick: '🤒', conference: '🎯', other: '📝' }[unavailable.type];
                          const daysFromNow = Math.ceil((new Date(unavailable.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          
                          return (
                            <div key={unavailable.id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              padding: '12px',
                              backgroundColor: 'white',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb',
                              opacity: isUpcoming ? 1 : 0.7,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  marginBottom: '4px'
                                }}>
                                  <span style={{ fontSize: '14px' }}>{emoji}</span>
                                  <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#111827'
                                  }}>
                                    {new Date(unavailable.date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                  {isUpcoming && daysFromNow <= 7 && (
                                    <span style={{
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      backgroundColor: '#fef3c7',
                                      color: '#92400e',
                                      borderRadius: '8px',
                                      fontWeight: '500'
                                    }}>
                                      {daysFromNow === 0 ? 'Today' : daysFromNow === 1 ? 'Tomorrow' : `${daysFromNow}d`}
                                    </span>
                                  )}
                                  {!isUpcoming && (
                                    <span style={{
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      backgroundColor: '#f3f4f6',
                                      color: '#6b7280',
                                      borderRadius: '8px',
                                      fontWeight: '500'
                                    }}>
                                      Past
                                    </span>
                                  )}
                                </div>
                                {unavailable.reason && (
                                  <div style={{
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    marginBottom: '6px',
                                    lineHeight: '1.3'
                                  }}>
                                    {unavailable.reason}
                                  </div>
                                )}
                                <span style={{
                                  display: 'inline-block',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: '500',
                                  textTransform: 'capitalize',
                                  backgroundColor: typeStyle.bg,
                                  color: typeStyle.color
                                }}>
                                  {unavailable.type}
                                </span>
                              </div>
                              <button
                                onClick={() => removeUnavailableDate(unavailable.id)}
                                title="Remove this unavailable date"
                                style={{
                                  padding: '4px 6px',
                                  backgroundColor: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #dc2626',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  marginLeft: '8px'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#dc2626';
                                  e.currentTarget.style.color = 'white';
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fee2e2';
                                  e.currentTarget.style.color = '#dc2626';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

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