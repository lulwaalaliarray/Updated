// Utility functions for handling dates consistently across the application

export const dateUtils = {
  // Convert Date object to YYYY-MM-DD format (timezone-safe)
  formatDateToString: (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Get current date in YYYY-MM-DD format (timezone-safe)
  getCurrentDate: (): string => {
    return dateUtils.formatDateToString(new Date());
  },

  // Get current year
  getCurrentYear: (): number => {
    return new Date().getFullYear();
  },

  // Parse date string and ensure it's valid
  parseDate: (dateString: string): Date | null => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch {
      return null;
    }
  },

  // Format date for display (e.g., "Nov 5, 2024")
  formatDateForDisplay: (dateString: string): string => {
    const date = dateUtils.parseDate(dateString);
    if (!date) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Format date for calendar display (e.g., "November 2024")
  formatMonthYear: (dateString: string): string => {
    const date = dateUtils.parseDate(dateString);
    if (!date) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  },

  // Check if a date is in the past
  isPastDate: (dateString: string): boolean => {
    const date = dateUtils.parseDate(dateString);
    if (!date) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    return date < today;
  },

  // Check if a date is today
  isToday: (dateString: string): boolean => {
    const date = dateUtils.parseDate(dateString);
    if (!date) return false;
    
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  // Check if a date is in the future
  isFutureDate: (dateString: string): boolean => {
    const date = dateUtils.parseDate(dateString);
    if (!date) return false;
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return date > today;
  },

  // Fix appointment dates that might be in the wrong year
  fixAppointmentDate: (dateString: string): string => {
    const date = dateUtils.parseDate(dateString);
    if (!date) return dateString;
    
    const currentYear = dateUtils.getCurrentYear();
    const appointmentYear = date.getFullYear();
    
    // If appointment is more than 1 year in the future, it's likely a data error
    if (appointmentYear > currentYear + 1) {
      // Set it to current year
      date.setFullYear(currentYear);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return dateString;
  },

  // Validate and fix appointment data
  validateAppointmentDate: (appointment: any): any => {
    if (!appointment.date) return appointment;
    
    const fixedDate = dateUtils.fixAppointmentDate(appointment.date);
    
    return {
      ...appointment,
      date: fixedDate
    };
  },

  // Get appointments for a specific month/year
  getAppointmentsForMonth: (appointments: any[], year: number, month: number): any[] => {
    return appointments.filter(appointment => {
      const date = dateUtils.parseDate(appointment.date);
      if (!date) return false;
      
      return date.getFullYear() === year && date.getMonth() === month;
    });
  },

  // Generate calendar data for a specific month
  generateCalendarData: (year: number, month: number, appointments: any[] = []) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendar = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(apt => apt.date === dateString);
      
      calendar.push({
        day,
        date: dateString,
        appointments: dayAppointments,
        isToday: dateUtils.isToday(dateString),
        isPast: dateUtils.isPastDate(dateString),
        isFuture: dateUtils.isFutureDate(dateString)
      });
    }
    
    return {
      year,
      month,
      monthName: new Date(year, month).toLocaleDateString('en-US', { month: 'long' }),
      calendar,
      totalDays: daysInMonth,
      firstDayOfWeek: startingDayOfWeek
    };
  }
};

export default dateUtils;