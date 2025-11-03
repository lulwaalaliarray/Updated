import { patientRecordsStorage } from '../patientRecordsStorage';

describe('Patient Records Auto-Creation', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('should automatically create patient record from appointment data', () => {
    const doctorId = 'test-doctor-001';
    const patientData = {
      patientId: 'test-patient-001',
      patientName: 'John Doe',
      patientEmail: 'john.doe@test.com',
      doctorId: doctorId
    };

    // Create patient record from appointment
    const patientRecord = patientRecordsStorage.createPatientRecordFromAppointment(patientData);

    // Verify record was created
    expect(patientRecord).toBeDefined();
    expect(patientRecord.fullName).toBe('John Doe');
    expect(patientRecord.contactInfo.email).toBe('john.doe@test.com');
    expect(patientRecord.doctorId).toBe(doctorId);
    expect(patientRecord.medicalHistory.notes).toContain('Auto-created');
    expect(patientRecord.numberOfVisits).toBeGreaterThan(0);
  });

  test('should create global patient profile', () => {
    const patientData = {
      patientId: 'test-patient-001',
      patientName: 'John Doe',
      patientEmail: 'john.doe@test.com',
      doctorId: 'test-doctor-001'
    };

    // Create patient record
    patientRecordsStorage.createPatientRecordFromAppointment(patientData);

    // Verify global profile was created
    const globalProfile = patientRecordsStorage.getGlobalPatientProfile('john.doe@test.com');
    expect(globalProfile).toBeDefined();
    expect(globalProfile?.fullName).toBe('John Doe');
    expect(globalProfile?.email).toBe('john.doe@test.com');
  });

  test('should handle appointments data for visit count', () => {
    const doctorId = 'test-doctor-001';
    const patientId = 'test-patient-001';
    const patientEmail = 'john.doe@test.com';

    // Mock appointments in localStorage
    const mockAppointments = [
      {
        id: '1',
        doctorId: doctorId,
        patientId: patientId,
        patientEmail: patientEmail,
        patientName: 'John Doe',
        date: '2024-01-01',
        time: '10:00',
        status: 'completed'
      },
      {
        id: '2',
        doctorId: doctorId,
        patientId: patientId,
        patientEmail: patientEmail,
        patientName: 'John Doe',
        date: '2024-01-15',
        time: '14:00',
        status: 'confirmed'
      }
    ];

    localStorage.setItem('patientcare_appointments', JSON.stringify(mockAppointments));

    // Create patient record
    const patientRecord = patientRecordsStorage.createPatientRecordFromAppointment({
      patientId: patientId,
      patientName: 'John Doe',
      patientEmail: patientEmail,
      doctorId: doctorId
    });

    // Should have visit count based on appointments
    expect(patientRecord.numberOfVisits).toBe(2);
  });
});