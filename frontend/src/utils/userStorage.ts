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

  // Check if email exists (alias for userExists for clarity)
  emailExists: (email: string): boolean => {
    return userStorage.userExists(email);
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

  // Clear all users
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

