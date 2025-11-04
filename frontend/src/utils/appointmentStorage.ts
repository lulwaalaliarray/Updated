export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'check-up' | 'emergency';
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  notes?: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

const APPOINTMENTS_STORAGE_KEY = 'patientcare_appointments';



export const appointmentStorage = {
  // Get all appointments
  getAllAppointments: (): Appointment[] => {
    try {
      const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Return empty array if no appointments exist
      return [];
    } catch (error) {
      console.error('Error loading appointments:', error);
      return [];
    }
  },

  // Get appointments for a specific doctor
  getDoctorAppointments: (doctorId: string): Appointment[] => {
    const appointments = appointmentStorage.getAllAppointments();
    return appointments.filter(apt => apt.doctorId === doctorId);
  },

  // Get appointments for a specific patient
  getPatientAppointments: (patientId: string): Appointment[] => {
    const appointments = appointmentStorage.getAllAppointments();
    return appointments.filter(apt => apt.patientId === patientId);
  },

  // Get appointments by status
  getAppointmentsByStatus: (status: Appointment['status']): Appointment[] => {
    const appointments = appointmentStorage.getAllAppointments();
    return appointments.filter(apt => apt.status === status);
  },

  // Get appointments for a specific date
  getAppointmentsByDate: (date: string): Appointment[] => {
    const appointments = appointmentStorage.getAllAppointments();
    return appointments.filter(apt => apt.date === date);
  },

  // Get doctor's appointments by date and status
  getDoctorAppointmentsByDateAndStatus: (doctorId: string, date: string, status?: Appointment['status']): Appointment[] => {
    const appointments = appointmentStorage.getDoctorAppointments(doctorId);
    let filtered = appointments.filter(apt => apt.date === date);
    if (status) {
      filtered = filtered.filter(apt => apt.status === status);
    }
    return filtered.sort((a, b) => a.time.localeCompare(b.time));
  },

  // Add new appointment
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment => {
    const appointments = appointmentStorage.getAllAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    
    // Trigger patient record creation/update
    try {
      // Import here to avoid circular dependency
      const { patientRecordsStorage } = require('./patientRecordsStorage');
      
      // Check if patient record exists for this doctor
      const existingRecord = patientRecordsStorage.getPatientRecordByPatientAndDoctor(
        newAppointment.patientId,
        newAppointment.doctorId
      );

      if (!existingRecord) {
        // Create basic patient record
        patientRecordsStorage.createPatientRecordFromAppointment({
          patientId: newAppointment.patientId,
          patientName: newAppointment.patientName,
          patientEmail: newAppointment.patientEmail,
          doctorId: newAppointment.doctorId
        });
      } else {
        // Update visit count
        patientRecordsStorage.incrementVisitCount(existingRecord.id);
      }
    } catch (error) {
      console.error('Error managing patient record during appointment creation:', error);
      // Don't fail appointment creation if patient record management fails
    }
    
    return newAppointment;
  },

  // Update appointment
  updateAppointment: (id: string, updates: Partial<Appointment>): boolean => {
    try {
      const appointments = appointmentStorage.getAllAppointments();
      const index = appointments.findIndex(apt => apt.id === id);
      
      if (index === -1) return false;
      
      const updatedAppointment = {
        ...appointments[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      appointments[index] = updatedAppointment;
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
      
      // Sync patient records when appointment is completed
      if (updates.status === 'completed') {
        try {
          const { patientRecordsStorage } = require('./patientRecordsStorage');
          patientRecordsStorage.syncPatientRecordsWithAppointments(updatedAppointment.doctorId);
        } catch (error) {
          console.error('Error syncing patient records after appointment completion:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return false;
    }
  },

  // Delete appointment
  deleteAppointment: (id: string): boolean => {
    try {
      const appointments = appointmentStorage.getAllAppointments();
      const filtered = appointments.filter(apt => apt.id !== id);
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }
  },

  // Confirm appointment
  confirmAppointment: (id: string): boolean => {
    return appointmentStorage.updateAppointment(id, { status: 'confirmed' });
  },

  // Cancel appointment
  cancelAppointment: (id: string, reason?: string): boolean => {
    return appointmentStorage.updateAppointment(id, { 
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
    });
  },

  // Complete appointment
  completeAppointment: (id: string, notes?: string): boolean => {
    return appointmentStorage.updateAppointment(id, { 
      status: 'completed',
      notes: notes || 'Appointment completed'
    });
  },

  // Get upcoming appointments (today and future)
  getUpcomingAppointments: (doctorId?: string): Appointment[] => {
    const appointments = doctorId 
      ? appointmentStorage.getDoctorAppointments(doctorId)
      : appointmentStorage.getAllAppointments();
    
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed')
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare === 0) {
          return a.time.localeCompare(b.time);
        }
        return dateCompare;
      });
  },

  // Get past appointments
  getPastAppointments: (doctorId?: string): Appointment[] => {
    const appointments = doctorId 
      ? appointmentStorage.getDoctorAppointments(doctorId)
      : appointmentStorage.getAllAppointments();
    
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date < today || apt.status === 'completed')
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date); // Most recent first
        if (dateCompare === 0) {
          return b.time.localeCompare(a.time);
        }
        return dateCompare;
      });
  },

  // Force refresh appointments with updated data (for testing)
  refreshAppointments: (): void => {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(defaultAppointments));
  }
};