import { describe, it, expect } from 'vitest';
import { dateUtils } from '../../utils/dateUtils';

describe('dateUtils', () => {
  describe('getCurrentDate', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const currentDate = dateUtils.getCurrentDate();
      expect(currentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getCurrentYear', () => {
    it('should return current year as number', () => {
      const currentYear = dateUtils.getCurrentYear();
      expect(typeof currentYear).toBe('number');
      expect(currentYear).toBeGreaterThan(2020);
    });
  });

  describe('parseDate', () => {
    it('should parse valid date strings', () => {
      const date = dateUtils.parseDate('2024-11-05');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2024);
      expect(date?.getMonth()).toBe(10); // November is month 10 (0-indexed)
      expect(date?.getDate()).toBe(5);
    });

    it('should return null for invalid date strings', () => {
      expect(dateUtils.parseDate('invalid-date')).toBeNull();
      expect(dateUtils.parseDate('')).toBeNull();
    });
  });

  describe('fixAppointmentDate', () => {
    it('should fix dates that are too far in the future', () => {
      const currentYear = new Date().getFullYear();
      const farFutureDate = `${currentYear + 5}-11-05`;
      const fixedDate = dateUtils.fixAppointmentDate(farFutureDate);
      
      expect(fixedDate).toMatch(new RegExp(`^${currentYear}-`));
    });

    it('should not change dates that are reasonable', () => {
      const currentYear = new Date().getFullYear();
      const reasonableDate = `${currentYear}-11-05`;
      const fixedDate = dateUtils.fixAppointmentDate(reasonableDate);
      
      expect(fixedDate).toBe(reasonableDate);
    });

    it('should not change dates for next year', () => {
      const nextYear = new Date().getFullYear() + 1;
      const nextYearDate = `${nextYear}-11-05`;
      const fixedDate = dateUtils.fixAppointmentDate(nextYearDate);
      
      expect(fixedDate).toBe(nextYearDate);
    });
  });

  describe('isPastDate', () => {
    it('should return true for past dates', () => {
      const pastDate = '2020-01-01';
      expect(dateUtils.isPastDate(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = '2030-01-01';
      expect(dateUtils.isPastDate(futureDate)).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      const futureDate = '2030-01-01';
      expect(dateUtils.isFutureDate(futureDate)).toBe(true);
    });

    it('should return false for past dates', () => {
      const pastDate = '2020-01-01';
      expect(dateUtils.isFutureDate(pastDate)).toBe(false);
    });
  });

  describe('validateAppointmentDate', () => {
    it('should fix appointment dates that are too far in the future', () => {
      const currentYear = new Date().getFullYear();
      const appointment = {
        id: '1',
        date: `${currentYear + 5}-11-05`,
        patientName: 'Test Patient'
      };

      const validated = dateUtils.validateAppointmentDate(appointment);
      expect(validated.date).toMatch(new RegExp(`^${currentYear}-`));
      expect(validated.patientName).toBe('Test Patient');
    });
  });

  describe('formatDateToString', () => {
    it('should format date to YYYY-MM-DD without timezone issues', () => {
      const testDate = new Date(2024, 10, 5); // November 5, 2024 (month is 0-indexed)
      const formatted = dateUtils.formatDateToString(testDate);
      
      expect(formatted).toBe('2024-11-05');
    });

    it('should handle single digit months and days correctly', () => {
      const testDate = new Date(2024, 0, 5); // January 5, 2024
      const formatted = dateUtils.formatDateToString(testDate);
      
      expect(formatted).toBe('2024-01-05');
    });
  });

  describe('generateCalendarData', () => {
    it('should generate calendar data for a given month', () => {
      const calendarData = dateUtils.generateCalendarData(2024, 10); // November 2024
      
      expect(calendarData.year).toBe(2024);
      expect(calendarData.month).toBe(10);
      expect(calendarData.monthName).toBe('November');
      expect(calendarData.totalDays).toBe(30); // November has 30 days
      expect(calendarData.calendar).toHaveLength(35); // 5 weeks * 7 days
    });

    it('should include appointment data in calendar', () => {
      const appointments = [
        { id: '1', date: '2024-11-05', patientName: 'Test Patient' }
      ];
      
      const calendarData = dateUtils.generateCalendarData(2024, 10, appointments);
      const day5 = calendarData.calendar.find((day: any) => day && day.day === 5);
      
      expect(day5).toBeDefined();
      expect(day5.appointments).toHaveLength(1);
      expect(day5.appointments[0].patientName).toBe('Test Patient');
    });
  });
});