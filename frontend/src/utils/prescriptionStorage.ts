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
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  createdAt: string;
  updatedAt: string;
}

const PRESCRIPTIONS_STORAGE_KEY = 'patientcare_prescriptions';




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
  },

  // Check and update expired prescriptions
  updateExpiredPrescriptions: (): number => {
    try {
      const prescriptions = prescriptionStorage.getAllPrescriptions();
      let updatedCount = 0;
      const currentDate = new Date();

      const updatedPrescriptions = prescriptions.map(prescription => {
        // Only check active prescriptions
        if (prescription.status !== 'active') {
          return prescription;
        }

        // Calculate expiration date based on the longest duration medication
        let maxDurationDays = 0;
        prescription.medications.forEach(medication => {
          const durationMatch = medication.duration.match(/(\d+)\s*(day|days|week|weeks|month|months)/i);
          if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            
            let durationInDays = 0;
            if (unit.startsWith('day')) {
              durationInDays = value;
            } else if (unit.startsWith('week')) {
              durationInDays = value * 7;
            } else if (unit.startsWith('month')) {
              durationInDays = value * 30; // Approximate month as 30 days
            }
            
            maxDurationDays = Math.max(maxDurationDays, durationInDays);
          }
        });

        // If we found a valid duration, check if it's expired
        if (maxDurationDays > 0) {
          const issuedDate = new Date(prescription.dateIssued);
          const expirationDate = new Date(issuedDate);
          expirationDate.setDate(expirationDate.getDate() + maxDurationDays);

          if (currentDate > expirationDate) {
            updatedCount++;
            return {
              ...prescription,
              status: 'expired' as const,
              updatedAt: new Date().toISOString()
            };
          }
        }

        return prescription;
      });

      // Save updated prescriptions if any were expired
      if (updatedCount > 0) {
        localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(updatedPrescriptions));
      }

      return updatedCount;
    } catch (error) {
      console.error('Error updating expired prescriptions:', error);
      return 0;
    }
  },

  // Get prescriptions with automatic expiration check
  getPatientPrescriptionsWithExpiration: (patientId: string): Prescription[] => {
    // First update any expired prescriptions
    prescriptionStorage.updateExpiredPrescriptions();
    // Then return the updated list
    return prescriptionStorage.getPatientPrescriptions(patientId);
  }
};