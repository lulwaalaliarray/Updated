import { appointmentStorage } from '../appointmentStorage';

describe('Appointment Booking Rules', () => {
  beforeEach(() => {
    // Clear appointments before each test
    appointmentStorage.clearAllAppointments();
  });

  describe('Rule 1: No two appointments at the same date and time', () => {
    it('should prevent booking when time slot is already taken', () => {
      // First appointment
      const appointment1 = {
        patientId: 'patient1',
        patientName: 'John Doe',
        patientEmail: 'john@example.com',
        doctorId: 'doctor1',
        doctorName: 'Dr. Smith',
        date: '2024-12-01',
        time: '10:00',
        duration: 30,
        type: 'consultation' as const,
        status: 'confirmed' as const,
        fee: 25
      };

      // Book first appointment
      const result1 = appointmentStorage.addAppointment(appointment1);
      expect(result1).toBeTruthy();

      // Try to book second appointment at same time (different patient)
      const appointment2 = {
        ...appointment1,
        patientId: 'patient2',
        patientName: 'Jane Doe',
        patientEmail: 'jane@example.com'
      };

      expect(() => {
        appointmentStorage.addAppointment(appointment2);
      }).toThrow('This time slot is already booked. Please select a different time.');
    });

    it('should allow booking when previous appointment is cancelled', () => {
      // First appointment
      const appointment1 = {
        patientId: 'patient1',
        patientName: 'John Doe',
        patientEmail: 'john@example.com',
        doctorId: 'doctor1',
        doctorName: 'Dr. Smith',
        date: '2024-12-01',
        time: '10:00',
        duration: 30,
        type: 'consultation' as const,
        status: 'cancelled' as const,
        fee: 25
      };

      // Book and cancel first appointment
      const result1 = appointmentStorage.addAppointment(appointment1);
      expect(result1).toBeTruthy();

      // Try to book second appointment at same time (different patient)
      const appointment2 = {
        ...appointment1,
        patientId: 'patient2',
        patientName: 'Jane Doe',
        patientEmail: 'jane@example.com',
        status: 'pending' as const
      };

      const result2 = appointmentStorage.addAppointment(appointment2);
      expect(result2).toBeTruthy();
    });
  });

  describe('Rule 2: One appointment per patient per day', () => {
    it('should prevent patient from booking multiple appointments on same day', () => {
      // First appointment
      const appointment1 = {
        patientId: 'patient1',
        patientName: 'John Doe',
        patientEmail: 'john@example.com',
        doctorId: 'doctor1',
        doctorName: 'Dr. Smith',
        date: '2024-12-01',
        time: '10:00',
        duration: 30,
        type: 'consultation' as const,
        status: 'confirmed' as const,
        fee: 25
      };

      // Book first appointment
      const result1 = appointmentStorage.addAppointment(appointment1);
      expect(result1).toBeTruthy();

      // Try to book second appointment same day, different time
      const appointment2 = {
        ...appointment1,
        time: '14:00',
        doctorId: 'doctor2',
        doctorName: 'Dr. Johnson'
      };

      expect(() => {
        appointmentStorage.addAppointment(appointment2);
      }).toThrow('You already have an appointment scheduled for this date. Please cancel your existing appointment or choose a different date.');
    });

    it('should allow patient to book on different days', () => {
      // First appointment
      const appointment1 = {
        patientId: 'patient1',
        patientName: 'John Doe',
        patientEmail: 'john@example.com',
        doctorId: 'doctor1',
        doctorName: 'Dr. Smith',
        date: '2024-12-01',
        time: '10:00',
        duration: 30,
        type: 'consultation' as const,
        status: 'confirmed' as const,
        fee: 25
      };

      // Book first appointment
      const result1 = appointmentStorage.addAppointment(appointment1);
      expect(result1).toBeTruthy();

      // Book second appointment different day
      const appointment2 = {
        ...appointment1,
        date: '2024-12-02'
      };

      const result2 = appointmentStorage.addAppointment(appointment2);
      expect(result2).toBeTruthy();
    });

    it('should allow patient to book on same day if previous appointment is cancelled', () => {
      // First appointment (cancelled)
      const appointment1 = {
        patientId: 'patient1',
        patientName: 'John Doe',
        patientEmail: 'john@example.com',
        doctorId: 'doctor1',
        doctorName: 'Dr. Smith',
        date: '2024-12-01',
        time: '10:00',
        duration: 30,
        type: 'consultation' as const,
        status: 'cancelled' as const,
        fee: 25
      };

      // Book cancelled appointment
      const result1 = appointmentStorage.addAppointment(appointment1);
      expect(result1).toBeTruthy();

      // Book new appointment same day
      const appointment2 = {
        ...appointment1,
        time: '14:00',
        status: 'pending' as const
      };

      const result2 = appointmentStorage.addAppointment(appointment2);
      expect(result2).toBeTruthy();
    });
  });

  describe('Helper functions', () => {
    it('should correctly identify patient appointments on specific date', () => {
      const appointment = {
        patientId: 'patient1',
        patientName: 'John Doe',
        patientEmail: 'john@example.com',
        doctorId: 'doctor1',
        doctorName: 'Dr. Smith',
        date: '2024-12-01',
        time: '10:00',
        duration: 30,
        type: 'consultation' as const,
        status: 'confirmed' as const,
        fee: 25
      };

      appointmentStorage.addAppointment(appointment);

      expect(appointmentStorage.hasPatientAppointmentOnDate('patient1', '2024-12-01')).toBe(true);
      expect(appointmentStorage.hasPatientAppointmentOnDate('patient1', '2024-12-02')).toBe(false);
      expect(appointmentStorage.hasPatientAppointmentOnDate('patient2', '2024-12-01')).toBe(false);
    });
  });
});