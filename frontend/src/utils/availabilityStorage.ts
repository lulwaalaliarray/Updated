export interface TimeSlot {
  start: string;
  end: string;
  id: string;
}

export interface DayAvailability {
  available: boolean;
  timeSlots: TimeSlot[];
}

export interface WeeklyAvailability {
  [key: string]: DayAvailability;
}

export interface UnavailableDate {
  date: string;
  reason: string;
  type: 'vacation' | 'sick' | 'conference' | 'other';
  id: string;
}

export interface CalendarOverrides {
  [date: string]: TimeSlot[]; // Date in YYYY-MM-DD format -> array of time slots
}

export interface DoctorAvailability {
  doctorId: string;
  weeklySchedule: WeeklyAvailability;
  calendarOverrides: CalendarOverrides; // New: specific date overrides
  unavailableDates: UnavailableDate[];
  lastUpdated: string;
}

const AVAILABILITY_STORAGE_KEY = 'patientcare_doctor_availability';

// Import appointmentStorage to avoid circular dependency
import { appointmentStorage } from './appointmentStorage';

export const availabilityStorage = {
  // Get all doctor availability data
  getAllAvailability: (): DoctorAvailability[] => {
    try {
      const stored = localStorage.getItem(AVAILABILITY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading availability data:', error);
      return [];
    }
  },

  // Get availability for a specific doctor
  getDoctorAvailability: (doctorId: string): DoctorAvailability | null => {
    const allAvailability = availabilityStorage.getAllAvailability();
    return allAvailability.find(av => av.doctorId === doctorId) || null;
  },

  // Save or update doctor availability
  saveDoctorAvailability: (doctorId: string, weeklySchedule: WeeklyAvailability, unavailableDates: UnavailableDate[], calendarOverrides?: CalendarOverrides): boolean => {
    try {
      const allAvailability = availabilityStorage.getAllAvailability();
      const existingIndex = allAvailability.findIndex(av => av.doctorId === doctorId);
      
      // Get existing calendar overrides if not provided
      const existingCalendarOverrides = existingIndex >= 0 ? allAvailability[existingIndex].calendarOverrides || {} : {};
      
      const doctorAvailability: DoctorAvailability = {
        doctorId,
        weeklySchedule,
        calendarOverrides: calendarOverrides || existingCalendarOverrides,
        unavailableDates,
        lastUpdated: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        allAvailability[existingIndex] = doctorAvailability;
      } else {
        allAvailability.push(doctorAvailability);
      }

      localStorage.setItem(AVAILABILITY_STORAGE_KEY, JSON.stringify(allAvailability));
      return true;
    } catch (error) {
      console.error('Error saving availability:', error);
      return false;
    }
  },

  // Check if a doctor is available on a specific date and time
  isDoctorAvailable: (doctorId: string, date: string, time: string): boolean => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    if (!availability) return false;

    // Check if date is marked as unavailable
    const isDateUnavailable = availability.unavailableDates.some(ud => ud.date === date);
    if (isDateUnavailable) return false;

    // Get day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = availability.weeklySchedule[dayOfWeek];
    
    if (!daySchedule || !daySchedule.available) return false;

    // Check if time falls within any available time slot
    const timeMinutes = availabilityStorage.timeToMinutes(time);
    return daySchedule.timeSlots.some(slot => {
      const startMinutes = availabilityStorage.timeToMinutes(slot.start);
      const endMinutes = availabilityStorage.timeToMinutes(slot.end);
      return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    });
  },

  // Get available time slots for a doctor on a specific date
  getAvailableSlots: (doctorId: string, date: string, slotDuration: number = 30): string[] => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    if (!availability) return [];

    // Check if date is marked as unavailable
    const isDateUnavailable = availability.unavailableDates.some(ud => ud.date === date);
    if (isDateUnavailable) return [];

    let timeSlots: TimeSlot[] = [];

    // Check for calendar override first
    if (availability.calendarOverrides && availability.calendarOverrides[date]) {
      timeSlots = availability.calendarOverrides[date];
    } else {
      // Fall back to weekly schedule
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = availability.weeklySchedule[dayOfWeek];
      
      if (!daySchedule || !daySchedule.available) return [];
      timeSlots = daySchedule.timeSlots;
    }

    // Generate all possible slots from time slots
    const allSlots: string[] = [];
    timeSlots.forEach(slot => {
      const startMinutes = availabilityStorage.timeToMinutes(slot.start);
      const endMinutes = availabilityStorage.timeToMinutes(slot.end);
      
      for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
        allSlots.push(availabilityStorage.minutesToTime(minutes));
      }
    });

    // Filter out booked appointments
    const bookedAppointments = appointmentStorage.getDoctorAppointmentsByDateAndStatus(
      doctorId, 
      date, 
      'confirmed'
    );
    const bookedTimes = bookedAppointments.map((apt: any) => apt.time);
    
    return allSlots.filter(slot => !bookedTimes.includes(slot)).sort();
  },

  // Get unavailable dates for a doctor
  getDoctorUnavailableDates: (doctorId: string): UnavailableDate[] => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    return availability ? availability.unavailableDates : [];
  },

  // Add unavailable date
  addUnavailableDate: (doctorId: string, date: string, reason: string, type: UnavailableDate['type']): boolean => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    if (!availability) return false;

    const newUnavailableDate: UnavailableDate = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date,
      reason,
      type
    };

    availability.unavailableDates.push(newUnavailableDate);
    return availabilityStorage.saveDoctorAvailability(
      doctorId, 
      availability.weeklySchedule, 
      availability.unavailableDates
    );
  },

  // Remove unavailable date
  removeUnavailableDate: (doctorId: string, dateId: string): boolean => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    if (!availability) return false;

    availability.unavailableDates = availability.unavailableDates.filter(ud => ud.id !== dateId);
    return availabilityStorage.saveDoctorAvailability(
      doctorId, 
      availability.weeklySchedule, 
      availability.unavailableDates
    );
  },

  // Utility functions
  timeToMinutes: (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  minutesToTime: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  },

  // Get default weekly schedule
  getDefaultWeeklySchedule: (): WeeklyAvailability => {
    return {
      sunday: { available: false, timeSlots: [] },
      monday: { available: true, timeSlots: [{ start: '08:00', end: '12:00', id: '1' }, { start: '14:00', end: '17:00', id: '2' }] },
      tuesday: { available: true, timeSlots: [{ start: '08:00', end: '12:00', id: '3' }, { start: '14:00', end: '17:00', id: '4' }] },
      wednesday: { available: true, timeSlots: [{ start: '08:00', end: '12:00', id: '5' }, { start: '14:00', end: '17:00', id: '6' }] },
      thursday: { available: true, timeSlots: [{ start: '08:00', end: '12:00', id: '7' }, { start: '14:00', end: '17:00', id: '8' }] },
      friday: { available: false, timeSlots: [] },
      saturday: { available: false, timeSlots: [] }
    };
  },

  // Calendar override management
  setCalendarOverride: (doctorId: string, date: string, timeSlots: TimeSlot[]): boolean => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    if (!availability) return false;

    const updatedOverrides = { ...availability.calendarOverrides };
    if (timeSlots.length === 0) {
      // Remove override if no time slots (revert to weekly schedule)
      delete updatedOverrides[date];
    } else {
      updatedOverrides[date] = timeSlots;
    }

    return availabilityStorage.saveDoctorAvailability(
      doctorId,
      availability.weeklySchedule,
      availability.unavailableDates,
      updatedOverrides
    );
  },

  // Get calendar override for a specific date
  getCalendarOverride: (doctorId: string, date: string): TimeSlot[] | null => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    if (!availability || !availability.calendarOverrides) return null;
    
    return availability.calendarOverrides[date] || null;
  },

  // Remove calendar override for a specific date
  removeCalendarOverride: (doctorId: string, date: string): boolean => {
    return availabilityStorage.setCalendarOverride(doctorId, date, []);
  },

  // Check if a date has calendar override
  hasCalendarOverride: (doctorId: string, date: string): boolean => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    return !!(availability?.calendarOverrides?.[date]);
  },

  // Get all calendar overrides for a doctor
  getAllCalendarOverrides: (doctorId: string): CalendarOverrides => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    return availability?.calendarOverrides || {};
  },

  // Validate time slot (no overlaps, start < end)
  validateTimeSlots: (timeSlots: TimeSlot[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check each slot individually
    timeSlots.forEach((slot, index) => {
      const startMinutes = availabilityStorage.timeToMinutes(slot.start);
      const endMinutes = availabilityStorage.timeToMinutes(slot.end);
      
      if (startMinutes >= endMinutes) {
        errors.push(`Slot ${index + 1}: Start time must be before end time`);
      }
      
      if (endMinutes - startMinutes < 30) {
        errors.push(`Slot ${index + 1}: Minimum slot duration is 30 minutes`);
      }
    });
    
    // Check for overlaps
    for (let i = 0; i < timeSlots.length; i++) {
      for (let j = i + 1; j < timeSlots.length; j++) {
        const slot1Start = availabilityStorage.timeToMinutes(timeSlots[i].start);
        const slot1End = availabilityStorage.timeToMinutes(timeSlots[i].end);
        const slot2Start = availabilityStorage.timeToMinutes(timeSlots[j].start);
        const slot2End = availabilityStorage.timeToMinutes(timeSlots[j].end);
        
        if ((slot1Start < slot2End && slot1End > slot2Start)) {
          errors.push(`Slots ${i + 1} and ${j + 1} overlap`);
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  },

  // Export schedule to calendar format (for Google Calendar, Outlook, etc.)
  exportToCalendar: (doctorId: string, startDate: Date, endDate: Date): string => {
    const availability = availabilityStorage.getDoctorAvailability(doctorId);
    if (!availability) return '';

    // Generate ICS format for calendar export
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PatientCare//Doctor Availability//EN\n';
    
    // Add unavailable dates as events
    availability.unavailableDates.forEach(unavailable => {
      const eventDate = new Date(unavailable.date);
      if (eventDate >= startDate && eventDate <= endDate) {
        const dateStr = eventDate.toISOString().split('T')[0].replace(/-/g, '');
        icsContent += `BEGIN:VEVENT\n`;
        icsContent += `UID:${unavailable.id}@patientcare.com\n`;
        icsContent += `DTSTART;VALUE=DATE:${dateStr}\n`;
        icsContent += `DTEND;VALUE=DATE:${dateStr}\n`;
        icsContent += `SUMMARY:${unavailable.type.toUpperCase()}: ${unavailable.reason}\n`;
        icsContent += `DESCRIPTION:Doctor unavailable - ${unavailable.reason}\n`;
        icsContent += `END:VEVENT\n`;
      }
    });

    icsContent += 'END:VCALENDAR';
    return icsContent;
  }
};