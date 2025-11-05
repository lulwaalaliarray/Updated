// Debug utility to check user storage
import { userStorage } from './userStorage';

export const debugUserStorage = () => {
  console.log('=== USER STORAGE DEBUG ===');
  
  try {
    const allUsers = userStorage.getAllUsers();
    console.log('Total users:', allUsers.length);
    
    const doctors = allUsers.filter(user => user.userType === 'doctor');
    console.log('Total doctors:', doctors.length);
    
    const activeDoctors = doctors.filter(user => user.status === 'active');
    console.log('Active doctors:', activeDoctors.length);
    
    const doctorsWithSpecialization = activeDoctors.filter(user => user.specialization);
    console.log('Active doctors with specialization:', doctorsWithSpecialization.length);
    
    console.log('\n=== ALL DOCTORS ===');
    doctors.forEach((doctor, index) => {
      console.log(`Doctor ${index + 1}:`, {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        userType: doctor.userType,
        status: doctor.status,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee,
        experience: doctor.experience,
        qualifications: doctor.qualifications
      });
    });
    
    console.log('\n=== FILTERED DOCTORS (shown in Find Doctors) ===');
    doctorsWithSpecialization.forEach((doctor, index) => {
      console.log(`Visible Doctor ${index + 1}:`, {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        status: doctor.status
      });
    });
    
    return {
      totalUsers: allUsers.length,
      totalDoctors: doctors.length,
      activeDoctors: activeDoctors.length,
      visibleDoctorsCount: doctorsWithSpecialization.length,
      doctors: doctors,
      visibleDoctors: doctorsWithSpecialization
    };
  } catch (error) {
    console.error('Error debugging user storage:', error);
    return null;
  }
};

// Create a test appointment for testing
export const createTestAppointment = () => {
  try {
    const allUsers = userStorage.getAllUsers();
    const doctors = allUsers.filter(user => user.userType === 'doctor');
    const patients = allUsers.filter(user => user.userType === 'patient');
    
    if (doctors.length === 0 || patients.length === 0) {
      console.log('Need at least one doctor and one patient to create test appointment');
      return false;
    }
    
    const doctor = doctors[0];
    const patient = patients[0];
    
    // Import appointmentStorage dynamically
    import('./appointmentStorage').then(({ appointmentStorage }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const testAppointment = appointmentStorage.addAppointment({
        patientId: patient.id,
        patientName: patient.name,
        patientEmail: patient.email,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        duration: 30,
        type: 'consultation',
        status: 'pending',
        notes: 'Test appointment',
        fee: doctor.consultationFee || 25
      });
      
      console.log('Test appointment created:', testAppointment);
    });
    
    return true;
  } catch (error) {
    console.error('Error creating test appointment:', error);
    return false;
  }
};

// Auto-run debug when this module is imported
if (typeof window !== 'undefined') {
  (window as any).debugUsers = debugUserStorage;
  (window as any).createTestAppointment = createTestAppointment;
  console.log('Debug functions available: window.debugUsers(), window.createTestAppointment()');
}