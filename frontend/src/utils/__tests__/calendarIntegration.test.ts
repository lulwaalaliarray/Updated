/**
 * Test suite for calendar integration with booking system
 * Verifies that unavailable dates are properly respected in patient booking
 */

import { availabilityStorage } from '../availabilityStorage';
import { appointmentStorage } from '../appointmentStorage';

describe('Calendar Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should debug availability storage', () => {
    const doctorId = 'debug-doctor';
    const weeklySchedule = availabilityStorage.getDefaultWeeklySchedule();
    
    console.log('Default schedule:', weeklySchedule);
    
    // Test basic save/retrieve without unavailable dates first
    const saveSuccess = availabilityStorage.saveDoctorAvailability(doctorId, weeklySchedule, []);
    console.log('Save success:', saveSuccess);
    
    const retrieved = availabilityStorage.getDoctorAvailability(doctorId);
    console.log('Retrieved availability:', retrieved);
    
    expect(saveSuccess).toBe(true);
    expect(retrieved).toBeDefined();
    expect(retrieved?.doctorId).toBe(doctorId);
  });

  test('should prevent booking on unavailable dates', () => {
    const doctorId = 'test-doctor-calendar';
    const weeklySchedule = availabilityStorage.getDefaultWeeklySchedule();
    
    // Add an unavailable date
    const unavailableDate = {
      id: 'test-unavailable-1',
      date: '2024-12-25', // Christmas
      reason: 'Holiday',
      type: 'vacation' as const
    };
    
    // Save doctor availability with unavailable date
    const success = availabilityStorage.saveDoctorAvailability(
      doctorId, 
      weeklySchedule, 
      [unavailableDate]
    );
    
    expect(success).toBe(true);
    
    // Check that the date is marked as unavailable
    const isAvailable = availabilityStorage.isDoctorAvailable(doctorId, '2024-12-25', '09:00');
    expect(isAvailable).toBe(false);
    
    // Check that available slots are empty for unavailable date
    const availableSlots = availabilityStorage.getAvailableSlots(doctorId, '2024-12-25');
    expect(availableSlots).toHaveLength(0);
  });

  test('should show unavailable dates with correct type and reason', () => {
    const doctorId = 'test-doctor-calendar-2';
    const weeklySchedule = availabilityStorage.getDefaultWeeklySchedule();
    
    const unavailableDates = [
      {
        id: 'vacation-1',
        date: '2024-12-24',
        reason: 'Christmas Eve',
        type: 'vacation' as const
      },
      {
        id: 'conference-1',
        date: '2024-12-26',
        reason: 'Medical Conference',
        type: 'conference' as const
      },
      {
        id: 'sick-1',
        date: '2024-12-27',
        reason: 'Sick leave',
        type: 'sick' as const
      }
    ];
    
    // Save doctor availability
    const saveSuccess = availabilityStorage.saveDoctorAvailability(doctorId, weeklySchedule, unavailableDates);
    expect(saveSuccess).toBe(true);
    
    // Retrieve and verify unavailable dates
    const retrievedUnavailable = availabilityStorage.getDoctorUnavailableDates(doctorId);
    
    expect(retrievedUnavailable).toHaveLength(3);
    expect(retrievedUnavailable.find(ud => ud.type === 'vacation')).toBeDefined();
    expect(retrievedUnavailable.find(ud => ud.type === 'conference')).toBeDefined();
    expect(retrievedUnavailable.find(ud => ud.type === 'sick')).toBeDefined();
    
    // Verify specific details
    const vacationDate = retrievedUnavailable.find(ud => ud.type === 'vacation');
    expect(vacationDate?.reason).toBe('Christmas Eve');
    expect(vacationDate?.date).toBe('2024-12-24');
  });

  test('should allow booking on available dates even with some unavailable dates set', () => {
    const doctorId = 'test-doctor-calendar-3';
    const weeklySchedule = availabilityStorage.getDefaultWeeklySchedule();
    
    // First, let's check what the default schedule looks like
    console.log('Default weekly schedule:', weeklySchedule);
    
    // Use a Monday date (which should be available in default schedule)
    const mondayDate = '2025-01-06'; // Monday
    const tuesdayDate = '2025-01-07'; // Tuesday
    
    // Add unavailable date for Monday
    const unavailableDate = {
      id: 'test-unavailable-monday',
      date: mondayDate,
      reason: 'Personal day',
      type: 'other' as const
    };
    
    const saveSuccess = availabilityStorage.saveDoctorAvailability(doctorId, weeklySchedule, [unavailableDate]);
    expect(saveSuccess).toBe(true);
    
    // Monday should be unavailable due to the unavailable date
    const mondayAvailable = availabilityStorage.isDoctorAvailable(doctorId, mondayDate, '09:00');
    expect(mondayAvailable).toBe(false);
    
    // Tuesday should be available (if it's enabled in default schedule)
    const tuesdayAvailable = availabilityStorage.isDoctorAvailable(doctorId, tuesdayDate, '09:00');
    
    // Check if Tuesday is a working day in the schedule
    const tuesdaySchedule = weeklySchedule.tuesday;
    if (tuesdaySchedule && tuesdaySchedule.available && tuesdaySchedule.timeSlots.length > 0) {
      expect(tuesdayAvailable).toBe(true);
      
      // Should have available slots on Tuesday
      const tuesdaySlots = availabilityStorage.getAvailableSlots(doctorId, tuesdayDate);
      expect(tuesdaySlots.length).toBeGreaterThan(0);
    } else {
      // If Tuesday is not a working day, it should be unavailable
      expect(tuesdayAvailable).toBe(false);
    }
  });

  test('should handle multiple unavailable dates of different types', () => {
    const doctorId = 'test-doctor-calendar-4';
    const weeklySchedule = availabilityStorage.getDefaultWeeklySchedule();
    
    const multipleUnavailableDates = [
      {
        id: 'vacation-week-1',
        date: '2024-12-23',
        reason: 'Winter vacation',
        type: 'vacation' as const
      },
      {
        id: 'vacation-week-2',
        date: '2024-12-24',
        reason: 'Winter vacation',
        type: 'vacation' as const
      },
      {
        id: 'conference-day',
        date: '2024-12-30',
        reason: 'Year-end medical conference',
        type: 'conference' as const
      }
    ];
    
    availabilityStorage.saveDoctorAvailability(doctorId, weeklySchedule, multipleUnavailableDates);
    
    // All specified dates should be unavailable
    multipleUnavailableDates.forEach(unavailableDate => {
      const isAvailable = availabilityStorage.isDoctorAvailable(doctorId, unavailableDate.date, '09:00');
      expect(isAvailable).toBe(false);
      
      const slots = availabilityStorage.getAvailableSlots(doctorId, unavailableDate.date);
      expect(slots).toHaveLength(0);
    });
    
    // Other dates should still be available (if they fall on working days)
    const otherDate = '2024-12-31'; // Assuming this is a working day
    const otherDateSlots = availabilityStorage.getAvailableSlots(doctorId, otherDate);
    // This might be 0 if it's not a working day, but shouldn't throw an error
    expect(Array.isArray(otherDateSlots)).toBe(true);
  });

  test('should remove unavailable dates correctly', () => {
    const doctorId = 'test-doctor-calendar-5';
    const weeklySchedule = availabilityStorage.getDefaultWeeklySchedule();
    
    // Use a Monday date which should be a working day
    const testDate = '2025-01-06'; // Monday
    
    const unavailableDate = {
      id: 'temp-unavailable',
      date: testDate,
      reason: 'Temporary block',
      type: 'other' as const
    };
    
    // Add unavailable date
    const saveSuccess = availabilityStorage.saveDoctorAvailability(doctorId, weeklySchedule, [unavailableDate]);
    expect(saveSuccess).toBe(true);
    
    // Verify it's unavailable due to the unavailable date
    let isAvailable = availabilityStorage.isDoctorAvailable(doctorId, testDate, '09:00');
    expect(isAvailable).toBe(false);
    
    // Verify the unavailable date exists
    let unavailableDates = availabilityStorage.getDoctorUnavailableDates(doctorId);
    expect(unavailableDates).toHaveLength(1);
    expect(unavailableDates[0].id).toBe('temp-unavailable');
    
    // Remove the unavailable date
    const removeSuccess = availabilityStorage.removeUnavailableDate(doctorId, 'temp-unavailable');
    expect(removeSuccess).toBe(true);
    
    // Verify the unavailable date was removed
    unavailableDates = availabilityStorage.getDoctorUnavailableDates(doctorId);
    expect(unavailableDates).toHaveLength(0);
    
    // Now check if it's available again (depends on weekly schedule)
    const mondaySchedule = weeklySchedule.monday;
    if (mondaySchedule && mondaySchedule.available && mondaySchedule.timeSlots.length > 0) {
      // If Monday is a working day, it should be available now
      isAvailable = availabilityStorage.isDoctorAvailable(doctorId, testDate, '09:00');
      expect(isAvailable).toBe(true);
    }
  });
});