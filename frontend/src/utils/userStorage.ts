// Utility functions for managing user credentials in localStorage
// In a real application, this would be handled by a backend API

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In real app, this would be hashed
  userType: 'patient' | 'doctor';
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

  // Update user status (for doctor verification)
  updateUserStatus: (email: string, status: User['status']): boolean => {
    try {
      const users = userStorage.getAllUsers();
      const userIndex = users.findIndex(user => user.email === email);
      
      if (userIndex !== -1) {
        users[userIndex].status = status;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
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
  }
};

// Default demo users for testing
export const initializeDemoUsers = (): void => {
  const demoUsers: User[] = [
    {
      id: 'demo-patient-1',
      name: 'Sarah Al-Khalifa',
      email: 'patient@patientcare.bh',
      password: 'password',
      userType: 'patient',
      cpr: '123456789',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo-doctor-1',
      name: 'Dr. Ahmed Al-Mansouri',
      email: 'doctor@patientcare.bh',
      password: 'doctor123',
      userType: 'doctor',
      cpr: '987654321',
      status: 'verified',
      createdAt: new Date().toISOString()
    }
  ];

  // Only add demo users if no users exist
  const existingUsers = userStorage.getAllUsers();
  if (existingUsers.length === 0) {
    demoUsers.forEach(user => userStorage.addUser(user));
  }
};