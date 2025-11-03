import { availabilityStorage } from '../availabilityStorage';
import { appointmentStorage } from '../appointmentStorage';

describe('Availability Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should save and retrieve doctor availability', () => {
    const doctorId = 'test-doctor-1';
    const weeklySchedule = availabilityStorage.getDefaultWeeklySchedule();
    const unavailableDates = [
      {
        id: '1',
        date: '2024-12-25',
        reason: 'Christmas Holiday',
        type: 'vacation' as const
      }
    ];

    // Save availability
    const success = availabilityStorage.saveDoctorAvailability(
      doctorId,
      weeklySchedule,
      unavailableDates
    );

    expect(success).toBe(true);

    // Retrieve availability
    const retrieved = availabilityStorage.getDoctorAvailability(doctorId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.doctorId).toBe(doctorId);
    expect(retrieved?.unavailableDates).toHaveLength(1);
    expect(retrieved?.unavailableDates[0].reason).toBe('Christmas Holiday');
  });

  test('should check doctor availability correctly', () => {
    const doctorId = 'test-doctor-2';
    const weeklySchedule = availabilityStorage.getDefaultWeeklySchedule();
    const unavailableDates = [
      {
        id: '1',
        date: '2024-01-01',
        reason: 'New Year',
        type: 'vacation' as const
      }
    ];

    availabilityStorage.saveDoctorAvailability(
      doctorId,
      weeklySchedule,
      unavailableDates
    );

    // Test available day and time
    expect(availabilityStorage.isDoctorAvailable(doctorId, '2024-01-02', '09:00')).toBe(true); // Tuesday
    
    // Test unavailable date
    expect(availabilityStorage.isDoctorAvailable(doctorId, '2024-01-01', '09:00')).toBe(false); // New Year
    
    // Test unavailable day of week
    expect(availabilityStorage.isDoctorAvailable(doctorId, '2024-01-07', '09:00')).toBe(false); // Sunday
  });

  test('should get available slots excluding booked appointments', () => {
    const doctorId = 'test-doctor-3';
    const testDate = '2024-01-03'; // Wednesday
    
    // Set up availability
    const weeklySchedule = availabilityStorage.getDefaultWeeklySchedule();
    availabilityStorage.saveDoctorAvailability(doctorId, weeklySchedule, []);

    // Add a booked appointment
    appointmentStorage.addAppointment({
      patientId: 'patient-1',
      patientName: 'Test Patient',
      patientEmail: 'test@example.com',
      doctorId: doctorId,
      doctorName: 'Test Doctor',
      date: testDate,
      time: '09:00',
      duration: 30,
      type: 'consultation',
      status: 'confirmed',
      fee: 25
    });

    // Get available slots
    const availableSlots = availabilityStorage.getAvailableSlots(doctorId, testDate);
    
    // Should have slots but not include the booked 09:00 slot
    expect(availableSlots.length).toBeGreaterThan(0);
    expect(availableSlots).not.toContain('09:00');
  });

  test('should export calendar data correctly', () => {
    const doctorId = 'test-doctor-4';
    const unavailableDates = [
      {
        id: '1',
        date: '2024-06-15',
        reason: 'Conference',
        type: 'conference' as const
      }
    ];

    availabilityStorage.saveDoctorAvailability(
      doctorId,
      availabilityStorage.getDefaultWeeklySchedule(),
      unavailableDates
    );

    const startDate = new Date('2024-06-01');
    const endDate = new Date('2024-06-30');
    const icsContent = availabilityStorage.exportToCalendar(doctorId, startDate, endDate);

    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('Conference');
    expect(icsContent).toContain('20240615');
    expect(icsContent).toContain('END:VCALENDAR');
  });

  test('should handle time conversion utilities correctly', () => {
    expect(availabilityStorage.timeToMinutes('09:30')).toBe(570);
    expect(availabilityStorage.timeToMinutes('14:15')).toBe(855);
    
    expect(availabilityStorage.minutesToTime(570)).toBe('09:30');
    expect(availabilityStorage.minutesToTime(855)).toBe('14:15');
  });
});