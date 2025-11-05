import React, { useState, useEffect } from 'react';
import { dateUtils } from '../utils/dateUtils';
import { appointmentStorage } from '../utils/appointmentStorage';

interface AppointmentCalendarProps {
  doctorId?: string;
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  doctorId,
  onDateSelect,
  selectedDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [, setAppointments] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<any>(null);

  useEffect(() => {
    loadAppointments();
  }, [doctorId, currentDate]);

  const loadAppointments = () => {
    try {
      let allAppointments = appointmentStorage.getAllAppointments();
      
      // Filter by doctor if specified
      if (doctorId) {
        allAppointments = allAppointments.filter(apt => apt.doctorId === doctorId);
      }
      
      // Validate and fix appointment dates
      const validatedAppointments = allAppointments.map(apt => 
        dateUtils.validateAppointmentDate(apt)
      );
      
      setAppointments(validatedAppointments);
      
      // Generate calendar data for current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const calendar = dateUtils.generateCalendarData(year, month, validatedAppointments);
      setCalendarData(calendar);
    } catch (error) {
      console.error('Error loading appointments for calendar:', error);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: string) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#d97706';
      case 'confirmed': return '#059669';
      case 'completed': return '#2563eb';
      case 'cancelled': return '#dc2626';
      case 'rejected': return '#dc2626';
      default: return '#6b7280';
    }
  };

  if (!calendarData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading calendar...
      </div>
    );
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      maxWidth: '400px'
    }}>
      {/* Calendar Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => navigateMonth('prev')}
          style={{
            padding: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 4px 0'
          }}>
            {calendarData.monthName} {calendarData.year}
          </h3>
          <button
            onClick={goToToday}
            style={{
              fontSize: '12px',
              color: '#0d9488',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Today
          </button>
        </div>

        <button
          onClick={() => navigateMonth('next')}
          style={{
            padding: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week Days Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        marginBottom: '8px'
      }}>
        {weekDays.map(day => (
          <div
            key={day}
            style={{
              padding: '8px 4px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px'
      }}>
        {calendarData.calendar.map((dayData: any, index: number) => {
          if (!dayData) {
            return <div key={index} style={{ padding: '8px' }}></div>;
          }

          const isSelected = selectedDate === dayData.date;
          const hasAppointments = dayData.appointments.length > 0;

          return (
            <div
              key={dayData.date}
              onClick={() => handleDateClick(dayData.date)}
              style={{
                padding: '8px 4px',
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '6px',
                backgroundColor: isSelected 
                  ? '#0d9488' 
                  : dayData.isToday 
                    ? '#f0fdfa' 
                    : 'transparent',
                color: isSelected 
                  ? 'white' 
                  : dayData.isToday 
                    ? '#0d9488' 
                    : dayData.isPast 
                      ? '#9ca3af' 
                      : '#111827',
                border: dayData.isToday && !isSelected ? '1px solid #0d9488' : '1px solid transparent',
                fontSize: '14px',
                fontWeight: dayData.isToday ? '600' : '400',
                position: 'relative',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = dayData.isToday ? '#f0fdfa' : 'transparent';
                }
              }}
            >
              <span>{dayData.day}</span>
              
              {/* Appointment indicators */}
              {hasAppointments && (
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '2px'
                }}>
                  {dayData.appointments.slice(0, 3).map((apt: any, aptIndex: number) => (
                    <div
                      key={aptIndex}
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: getAppointmentStatusColor(apt.status)
                      }}
                    />
                  ))}
                  {dayData.appointments.length > 3 && (
                    <div style={{
                      fontSize: '8px',
                      color: isSelected ? 'white' : '#6b7280'
                    }}>
                      +{dayData.appointments.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          Selected date
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d97706' }}></div>
            <span>Pending</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></div>
            <span>Confirmed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></div>
            <span>Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;