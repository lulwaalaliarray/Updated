export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string; // NEW: Link to specific appointment
  appointmentDate: string; // NEW: Date of the visit
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  diagnosis: string;
  notes?: string;
  dateIssued: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const PRESCRIPTIONS_STORAGE_KEY = 'patientcare_prescriptions';

// Initialize demo prescriptions
export const initializeDemoPrescriptions = (): void => {
  const existingPrescriptions = prescriptionStorage.getAllPrescriptions();
  if (existingPrescriptions.length === 0) {
    const demoPrescriptions: Prescription[] = [
      {
        id: 'rx-001',
        patientId: 'patient-001',
        patientName: 'Sarah Al-Khalifa',
        patientEmail: 'patient@patientcare.bh',
        doctorId: 'doctor-001',
        doctorName: 'Dr. Ahmed Al-Mansouri',
        appointmentId: 'apt-001',
        appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        medications: [
          {
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take with food in the morning'
          }
        ],
        diagnosis: 'Hypertension',
        notes: 'Monitor blood pressure weekly. Follow up in 4 weeks.',
        dateIssued: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        status: 'active',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rx-002',
        patientId: 'patient-002',
        patientName: 'Ahmed Hassan',
        patientEmail: 'ahmed.hassan@email.com',
        doctorId: 'doctor-002',
        doctorName: 'Dr. Fatima Al-Khalifa',
        appointmentId: 'apt-002',
        appointmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        medications: [
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Three times daily',
            duration: '7 days',
            instructions: 'Take with meals'
          },
          {
            name: 'Paracetamol',
            dosage: '500mg',
            frequency: 'As needed',
            duration: '5 days',
            instructions: 'For fever and pain relief'
          }
        ],
        diagnosis: 'Upper Respiratory Tract Infection',
        notes: 'Complete the full course of antibiotics. Return if symptoms persist.',
        dateIssued: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        status: 'active',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rx-003',
        patientId: 'patient-003',
        patientName: 'Fatima Al-Zahra',
        patientEmail: 'fatima.zahra@email.com',
        doctorId: 'doctor-003',
        doctorName: 'Dr. Mohammed Al-Dosari',
        appointmentId: 'apt-003',
        appointmentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        medications: [
          {
            name: 'Ibuprofen',
            dosage: '400mg',
            frequency: 'Twice daily',
            duration: '14 days',
            instructions: 'Take with food to avoid stomach upset'
          }
        ],
        diagnosis: 'Lower Back Pain',
        notes: 'Physical therapy recommended. Avoid heavy lifting.',
        dateIssued: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        status: 'completed',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rx-004',
        patientId: 'patient-004',
        patientName: 'Omar Al-Rashid',
        patientEmail: 'omar.rashid@email.com',
        doctorId: 'doctor-004',
        doctorName: 'Dr. Aisha Al-Mannai',
        appointmentId: 'apt-004',
        appointmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        medications: [
          {
            name: 'Hydrocortisone Cream',
            dosage: '1%',
            frequency: 'Twice daily',
            duration: '10 days',
            instructions: 'Apply thin layer to affected area'
          }
        ],
        diagnosis: 'Eczema',
        notes: 'Avoid known allergens. Use fragrance-free moisturizers.',
        dateIssued: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        status: 'active',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rx-005',
        patientId: 'patient-005',
        patientName: 'Maryam Al-Bahrani',
        patientEmail: 'maryam.bahrani@email.com',
        doctorId: 'doctor-005',
        doctorName: 'Dr. Khalid Al-Thani',
        appointmentId: 'apt-005',
        appointmentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        medications: [
          {
            name: 'Gabapentin',
            dosage: '300mg',
            frequency: 'Three times daily',
            duration: '30 days',
            instructions: 'Start with one tablet daily, increase gradually'
          }
        ],
        diagnosis: 'Neuropathic Pain',
        notes: 'Monitor for dizziness. Follow up in 2 weeks for dose adjustment.',
        dateIssued: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        status: 'active',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(demoPrescriptions));
  }
};

export const prescriptionStorage = {
  // Get all prescriptions
  getAllPrescriptions: (): Prescription[] => {
    try {
      const stored = localStorage.getItem(PRESCRIPTIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      return [];
    }
  },

  // Get prescriptions for a specific doctor
  getDoctorPrescriptions: (doctorId: string): Prescription[] => {
    const prescriptions = prescriptionStorage.getAllPrescriptions();
    return prescriptions.filter(prescription => prescription.doctorId === doctorId);
  },

  // Get prescriptions for a specific patient
  getPatientPrescriptions: (patientId: string): Prescription[] => {
    const prescriptions = prescriptionStorage.getAllPrescriptions();
    return prescriptions.filter(prescription => prescription.patientId === patientId);
  },

  // Check if prescription already exists for a specific appointment
  prescriptionExistsForAppointment: (appointmentId: string): boolean => {
    const prescriptions = prescriptionStorage.getAllPrescriptions();
    return prescriptions.some(prescription => prescription.appointmentId === appointmentId);
  },

  // Get completed appointments for a doctor that don't have prescriptions yet
  getAppointmentsAvailableForPrescription: (doctorId: string): any[] => {
    try {
      // Get all completed appointments for this doctor
      const appointmentStorageData = localStorage.getItem('patientcare_appointments');
      if (!appointmentStorageData) return [];
      
      const appointments = JSON.parse(appointmentStorageData);
      const completedAppointments = appointments.filter((apt: any) => 
        apt.doctorId === doctorId && apt.status === 'completed'
      );
      
      // Filter out appointments that already have prescriptions
      const availableAppointments = completedAppointments.filter((apt: any) => 
        !prescriptionStorage.prescriptionExistsForAppointment(apt.id)
      );
      
      return availableAppointments;
    } catch (error) {
      console.error('Error loading appointments for prescription:', error);
      return [];
    }
  },

  // Get appointments for a specific patient that are available for prescription
  getPatientAppointmentsForPrescription: (doctorId: string, patientId: string): any[] => {
    const availableAppointments = prescriptionStorage.getAppointmentsAvailableForPrescription(doctorId);
    return availableAppointments.filter(apt => apt.patientId === patientId || apt.patientEmail === patientId);
  },

  // Add new prescription
  addPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Prescription => {
    const prescriptions = prescriptionStorage.getAllPrescriptions();
    const newPrescription: Prescription = {
      ...prescription,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    prescriptions.push(newPrescription);
    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(prescriptions));
    return newPrescription;
  },

  // Update prescription
  updatePrescription: (id: string, updates: Partial<Prescription>): boolean => {
    try {
      const prescriptions = prescriptionStorage.getAllPrescriptions();
      const index = prescriptions.findIndex(prescription => prescription.id === id);
      
      if (index === -1) return false;
      
      prescriptions[index] = {
        ...prescriptions[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(prescriptions));
      return true;
    } catch (error) {
      console.error('Error updating prescription:', error);
      return false;
    }
  },

  // Delete prescription
  deletePrescription: (id: string): boolean => {
    try {
      const prescriptions = prescriptionStorage.getAllPrescriptions();
      const filtered = prescriptions.filter(prescription => prescription.id !== id);
      localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting prescription:', error);
      return false;
    }
  }
};