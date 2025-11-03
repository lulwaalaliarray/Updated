// Utility functions for managing user credentials in localStorage
// In a real application, this would be handled by a backend API

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In real app, this would be hashed
  userType: 'patient' | 'doctor' | 'admin';
  cpr: string;
  status: 'active' | 'pending_verification' | 'verified';
  createdAt: string;
  // Doctor-specific fields
  specialization?: string;
  specializations?: string[];
  consultationFee?: number;
  experience?: string;
  qualifications?: string;
  availability?: {
    [key: string]: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
  };
  rating?: number;
  reviewCount?: number;
  totalReviews?: number;
  profilePicture?: string;
  bio?: string;
  languages?: string[];
  phone?: string;
  hospital?: string;
  location?: string;
  clinicAddress?: string;
}

export const userStorage = {
  // Get all registered users
  getAllUsers: (): User[] => {
    try {
      return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    } catch {
      return [];
    }
  },

  // Get all doctors (for Find Doctors page)
  getAllDoctors: (): User[] => {
    try {
      const users = userStorage.getAllUsers();
      // Include both active and verified doctors so new registrations appear immediately
      return users.filter(user => 
        user.userType === 'doctor' && 
        (user.status === 'verified' || user.status === 'active')
      );
    } catch {
      return [];
    }
  },

  // Get patients with completed appointments for a specific doctor
  getDoctorPastPatients: (doctorId: string): User[] => {
    try {
      const users = userStorage.getAllUsers();
      const patients = users.filter(user => user.userType === 'patient');
      
      // Check which patients have COMPLETED appointments with this specific doctor
      const appointmentStorage = JSON.parse(localStorage.getItem('patientcare_appointments') || '[]');
      const patientsWithCompletedAppointments = patients.filter(patient => 
        appointmentStorage.some((apt: any) => 
          (apt.patientId === patient.id || apt.patientEmail === patient.email) &&
          apt.doctorId === doctorId &&
          apt.status === 'completed'
        )
      );
      
      return patientsWithCompletedAppointments;
    } catch {
      return [];
    }
  },

  // Get patients with any appointment history (for admin view)
  getPatientsWithAppointments: (): User[] => {
    try {
      const users = userStorage.getAllUsers();
      const patients = users.filter(user => user.userType === 'patient');
      
      // Check which patients have any appointments (for admin dashboard)
      const appointmentStorage = JSON.parse(localStorage.getItem('patientcare_appointments') || '[]');
      const patientsWithAppointments = patients.filter(patient => 
        appointmentStorage.some((apt: any) => 
          apt.patientId === patient.id || apt.patientEmail === patient.email
        )
      );
      
      return patientsWithAppointments;
    } catch {
      return [];
    }
  },

  // Add a new user
  addUser: (user: User): boolean => {
    try {
      const users = userStorage.getAllUsers();
      
      // Check if user already exists
      if (users.some(existingUser => existingUser.email === user.email)) {
        return false; // User already exists
      }

      users.push(user);
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
      // If it's a doctor, set up default availability schedule
      if (user.userType === 'doctor') {
        try {
          // Import availabilityStorage dynamically to avoid circular dependencies
          const availabilityStorageData = localStorage.getItem('patientcare_doctor_availability');
          const allAvailability = availabilityStorageData ? JSON.parse(availabilityStorageData) : [];
          
          // Check if doctor already has availability data
          const existingAvailability = allAvailability.find((av: any) => av.doctorId === user.id);
          
          if (!existingAvailability) {
            // Create default availability schedule
            const defaultSchedule = {
              sunday: { available: false, timeSlots: [] },
              monday: { available: true, timeSlots: [{ start: '08:00', end: '12:00', id: '1' }, { start: '14:00', end: '17:00', id: '2' }] },
              tuesday: { available: true, timeSlots: [{ start: '08:00', end: '12:00', id: '3' }, { start: '14:00', end: '17:00', id: '4' }] },
              wednesday: { available: true, timeSlots: [{ start: '08:00', end: '12:00', id: '5' }, { start: '14:00', end: '17:00', id: '6' }] },
              thursday: { available: true, timeSlots: [{ start: '08:00', end: '12:00', id: '7' }, { start: '14:00', end: '17:00', id: '8' }] },
              friday: { available: false, timeSlots: [] },
              saturday: { available: false, timeSlots: [] }
            };
            
            const doctorAvailability = {
              doctorId: user.id,
              weeklySchedule: defaultSchedule,
              unavailableDates: [],
              lastUpdated: new Date().toISOString()
            };
            
            allAvailability.push(doctorAvailability);
            localStorage.setItem('patientcare_doctor_availability', JSON.stringify(allAvailability));
          }
        } catch (error) {
          console.error('Error setting up default availability for doctor:', error);
        }
      }
      
      // Trigger event to notify components of new user registration
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userRegistered', {
          detail: { user, userType: user.userType }
        }));
        
        // If it's a doctor, trigger specific doctor registration event
        if (user.userType === 'doctor') {
          window.dispatchEvent(new CustomEvent('doctorRegistered', {
            detail: { doctor: user }
          }));
        }
      }
      
      return true;
    } catch {
      return false;
    }
  },

  // Find user by email and password
  findUser: (email: string, password: string, userType?: string): User | null => {
    try {
      const users = userStorage.getAllUsers();
      return users.find(user => 
        user.email === email && 
        user.password === password &&
        (!userType || user.userType === userType)
      ) || null;
    } catch {
      return null;
    }
  },

  // Check if user exists by email
  userExists: (email: string): boolean => {
    try {
      const users = userStorage.getAllUsers();
      return users.some(user => user.email === email);
    } catch {
      return false;
    }
  },

  // Check if CPR already exists
  cprExists: (cpr: string): boolean => {
    try {
      const users = userStorage.getAllUsers();
      return users.some(user => user.cpr === cpr);
    } catch {
      return false;
    }
  },

  // Update user status (for doctor verification)
  updateUserStatus: (email: string, status: User['status']): boolean => {
    try {
      const users = userStorage.getAllUsers();
      const userIndex = users.findIndex(user => user.email === email);
      
      if (userIndex !== -1) {
        const user = users[userIndex];
        const oldStatus = user.status;
        user.status = status;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // Trigger event to notify components of status change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('userStatusUpdated', {
            detail: { user, oldStatus, newStatus: status }
          }));
          
          // If a doctor is being verified, trigger specific event
          if (user.userType === 'doctor' && status === 'verified' && oldStatus !== 'verified') {
            window.dispatchEvent(new CustomEvent('doctorVerified', {
              detail: { doctor: user }
            }));
          }
        }
        
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // Clear all users (for testing/demo purposes)
  clearAllUsers: (): void => {
    localStorage.removeItem('registeredUsers');
  },

  // Get user count by type
  getUserCount: (): { patients: number; doctors: number; total: number } => {
    try {
      const users = userStorage.getAllUsers();
      const patients = users.filter(user => user.userType === 'patient').length;
      const doctors = users.filter(user => user.userType === 'doctor').length;
      return { patients, doctors, total: users.length };
    } catch {
      return { patients: 0, doctors: 0, total: 0 };
    }
  },

  // Format CPR number for display (adds dashes for readability)
  formatCPR: (cpr: string): string => {
    if (!cpr || cpr.length !== 9) return cpr;
    return `${cpr.slice(0, 3)}-${cpr.slice(3, 6)}-${cpr.slice(6, 9)}`;
  }
};

// Default demo users for testing
export const initializeDemoUsers = (): void => {
  const demoUsers: User[] = [
    // Patients
    {
      id: 'patient-001',
      name: 'Sarah Al-Khalifa',
      email: 'patient@patientcare.bh',
      password: 'password',
      userType: 'patient',
      cpr: '890123456',
      status: 'active',
      phone: '+973 3456 7890',
      createdAt: new Date().toISOString()
    },
    {
      id: 'patient-002',
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      password: 'patient123',
      userType: 'patient',
      cpr: '890123457',
      status: 'active',
      phone: '+973 3456 7891',
      createdAt: new Date().toISOString()
    },
    {
      id: 'patient-003',
      name: 'Fatima Al-Zahra',
      email: 'fatima.zahra@email.com',
      password: 'patient123',
      userType: 'patient',
      cpr: '890123458',
      status: 'active',
      phone: '+973 3456 7892',
      createdAt: new Date().toISOString()
    },
    {
      id: 'patient-004',
      name: 'Omar Al-Rashid',
      email: 'omar.rashid@email.com',
      password: 'patient123',
      userType: 'patient',
      cpr: '890123459',
      status: 'active',
      phone: '+973 3456 7893',
      createdAt: new Date().toISOString()
    },
    {
      id: 'patient-005',
      name: 'Maryam Al-Bahrani',
      email: 'maryam.bahrani@email.com',
      password: 'patient123',
      userType: 'patient',
      cpr: '890123460',
      status: 'active',
      phone: '+973 3456 7894',
      createdAt: new Date().toISOString()
    },

    // Doctors
    {
      id: 'doctor-001',
      name: 'Dr. Ahmed Al-Mansouri',
      email: 'doctor@patientcare.bh',
      password: 'doctor123',
      userType: 'doctor',
      cpr: '987654321',
      status: 'verified',
      specialization: 'Cardiology',
      specializations: ['Cardiology', 'Internal Medicine'],
      consultationFee: 30,
      experience: '15 years',
      qualifications: 'MD Cardiology, MBBS, Fellowship in Interventional Cardiology',
      rating: 4.8,
      reviewCount: 127,
      totalReviews: 127,
      bio: 'Experienced cardiologist specializing in interventional procedures and heart disease prevention.',
      languages: ['Arabic', 'English'],
      phone: '+973 1234 5678',
      hospital: 'Bahrain Specialist Hospital',
      location: 'Juffair, Manama',
      clinicAddress: 'Building 123, Road 456, Juffair, Manama',
      availability: {
        sunday: { available: false, startTime: '08:00', endTime: '17:00' },
        monday: { available: true, startTime: '08:00', endTime: '17:00' },
        tuesday: { available: true, startTime: '08:00', endTime: '17:00' },
        wednesday: { available: true, startTime: '08:00', endTime: '17:00' },
        thursday: { available: true, startTime: '08:00', endTime: '17:00' },
        friday: { available: false, startTime: '08:00', endTime: '17:00' },
        saturday: { available: false, startTime: '08:00', endTime: '17:00' }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor-002',
      name: 'Dr. Fatima Al-Khalifa',
      email: 'fatima.doctor@patientcare.bh',
      password: 'doctor123',
      userType: 'doctor',
      cpr: '987654322',
      status: 'verified',
      specialization: 'Pediatrics',
      specializations: ['Pediatrics', 'Child Development'],
      consultationFee: 25,
      experience: '12 years',
      qualifications: 'MD Pediatrics, MBBS, Diploma in Child Health',
      rating: 4.9,
      reviewCount: 89,
      totalReviews: 89,
      bio: 'Dedicated pediatrician with expertise in child development and preventive care.',
      languages: ['Arabic', 'English', 'French'],
      phone: '+973 1234 5679',
      hospital: 'Royal Medical Services',
      location: 'Adliya, Manama',
      clinicAddress: 'Building 456, Road 789, Adliya, Manama',
      availability: {
        sunday: { available: true, startTime: '09:00', endTime: '16:00' },
        monday: { available: true, startTime: '09:00', endTime: '16:00' },
        tuesday: { available: true, startTime: '09:00', endTime: '16:00' },
        wednesday: { available: false, startTime: '09:00', endTime: '16:00' },
        thursday: { available: true, startTime: '09:00', endTime: '16:00' },
        friday: { available: false, startTime: '09:00', endTime: '16:00' },
        saturday: { available: true, startTime: '09:00', endTime: '14:00' }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor-003',
      name: 'Dr. Mohammed Al-Dosari',
      email: 'mohammed.doctor@patientcare.bh',
      password: 'doctor123',
      userType: 'doctor',
      cpr: '987654323',
      status: 'verified',
      specialization: 'Orthopedics',
      specializations: ['Orthopedics', 'Sports Medicine'],
      consultationFee: 35,
      experience: '18 years',
      qualifications: 'MD Orthopedics, MBBS, Fellowship in Sports Medicine',
      rating: 4.7,
      reviewCount: 156,
      totalReviews: 156,
      bio: 'Orthopedic surgeon specializing in sports injuries and joint replacement.',
      languages: ['Arabic', 'English'],
      phone: '+973 1234 5680',
      hospital: 'Salmaniya Medical Complex',
      location: 'Salmaniya, Manama',
      clinicAddress: 'Building 789, Road 012, Salmaniya, Manama',
      availability: {
        sunday: { available: false, startTime: '08:00', endTime: '18:00' },
        monday: { available: true, startTime: '08:00', endTime: '18:00' },
        tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
        wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
        thursday: { available: true, startTime: '08:00', endTime: '18:00' },
        friday: { available: true, startTime: '08:00', endTime: '14:00' },
        saturday: { available: false, startTime: '08:00', endTime: '18:00' }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor-004',
      name: 'Dr. Aisha Al-Mannai',
      email: 'aisha.doctor@patientcare.bh',
      password: 'doctor123',
      userType: 'doctor',
      cpr: '987654324',
      status: 'verified',
      specialization: 'Dermatology',
      specializations: ['Dermatology', 'Cosmetic Dermatology'],
      consultationFee: 28,
      experience: '10 years',
      qualifications: 'MD Dermatology, MBBS, Diploma in Aesthetic Medicine',
      rating: 4.6,
      reviewCount: 73,
      totalReviews: 73,
      bio: 'Dermatologist specializing in skin conditions and cosmetic treatments.',
      languages: ['Arabic', 'English'],
      phone: '+973 1234 5681',
      hospital: 'Ibn Al-Nafees Hospital',
      location: 'Saar, Bahrain',
      clinicAddress: 'Building 012, Road 345, Saar, Bahrain',
      availability: {
        sunday: { available: true, startTime: '10:00', endTime: '17:00' },
        monday: { available: true, startTime: '10:00', endTime: '17:00' },
        tuesday: { available: false, startTime: '10:00', endTime: '17:00' },
        wednesday: { available: true, startTime: '10:00', endTime: '17:00' },
        thursday: { available: true, startTime: '10:00', endTime: '17:00' },
        friday: { available: false, startTime: '10:00', endTime: '17:00' },
        saturday: { available: true, startTime: '10:00', endTime: '15:00' }
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'doctor-005',
      name: 'Dr. Khalid Al-Thani',
      email: 'khalid.doctor@patientcare.bh',
      password: 'doctor123',
      userType: 'doctor',
      cpr: '987654325',
      status: 'verified',
      specialization: 'Neurology',
      specializations: ['Neurology', 'Neuropsychiatry'],
      consultationFee: 40,
      experience: '20 years',
      qualifications: 'MD Neurology, MBBS, Fellowship in Neuropsychiatry',
      rating: 4.9,
      reviewCount: 201,
      totalReviews: 201,
      bio: 'Neurologist with extensive experience in treating neurological disorders and brain health.',
      languages: ['Arabic', 'English', 'German'],
      phone: '+973 1234 5682',
      hospital: 'American Mission Hospital',
      location: 'Manama, Bahrain',
      clinicAddress: 'Building 345, Road 678, Manama, Bahrain',
      availability: {
        sunday: { available: false, startTime: '08:00', endTime: '16:00' },
        monday: { available: true, startTime: '08:00', endTime: '16:00' },
        tuesday: { available: true, startTime: '08:00', endTime: '16:00' },
        wednesday: { available: true, startTime: '08:00', endTime: '16:00' },
        thursday: { available: true, startTime: '08:00', endTime: '16:00' },
        friday: { available: false, startTime: '08:00', endTime: '16:00' },
        saturday: { available: false, startTime: '08:00', endTime: '16:00' }
      },
      createdAt: new Date().toISOString()
    }
  ];

  // Only add demo users if no users exist
  const existingUsers = userStorage.getAllUsers();
  if (existingUsers.length === 0) {
    demoUsers.forEach(user => userStorage.addUser(user));
  }
};