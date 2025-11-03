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

// Default appointments for demo
const defaultAppointments: Appointment[] = [
  {
    id: '1',
    patientId: 'patient-001',
    patientName: 'Sarah Al-Khalifa',
    patientEmail: 'patient@patientcare.bh',
    doctorId: 'doctor-001',
    doctorName: 'Dr. Ahmed Al-Mansouri',
    date: new Date().toISOString().split('T')[0], // Today
    time: '09:00',
    duration: 30,
    type: 'consultation',
    status: 'pending',
    notes: 'Patient reports sharp chest pain lasting 2 days, especially when breathing deeply. No fever. Pain rated 6/10. Symptoms started after physical exercise.',
    fee: 30, // Dr. Ahmed Al-Mansouri's fee
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    patientId: 'patient-001',
    patientName: 'Sarah Al-Khalifa',
    patientEmail: 'patient@patientcare.bh',
    doctorId: 'doctor-002',
    doctorName: 'Dr. Fatima Al-Khalifa',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    time: '10:30',
    duration: 20,
    type: 'follow-up',
    status: 'completed',
    notes: 'Follow-up visit: Blood pressure improved (130/85). Patient reports occasional dizziness in mornings. No side effects from Lisinopril. Compliance good.',
    fee: 25, // Dr. Fatima Al-Khalifa's fee
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    patientId: 'patient-001',
    patientName: 'Sarah Al-Khalifa',
    patientEmail: 'patient@patientcare.bh',
    doctorId: 'doctor-003',
    doctorName: 'Dr. Mohammed Al-Dosari',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    time: '14:00',
    duration: 45,
    type: 'check-up',
    status: 'completed',
    notes: 'Annual check-up: Patient reports fatigue and mild headaches for past month. Sleep quality poor (4-5 hours/night). No significant weight changes. Vitals stable.',
    fee: 35, // Dr. Mohammed Al-Dosari's fee
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: '4',
    patientId: 'patient-002',
    patientName: 'Ahmed Hassan',
    patientEmail: 'ahmed.hassan@email.com',
    doctorId: 'doctor-004',
    doctorName: 'Dr. Aisha Al-Mannai',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: '11:00',
    duration: 30,
    type: 'consultation',
    status: 'confirmed',
    notes: 'New patient with Type 2 diabetes. Reports frequent urination, excessive thirst, and blurred vision for 3 weeks. Blood glucose levels consistently above 200 mg/dL.',
    fee: 28, // Dr. Aisha Al-Mannai's fee
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '5',
    patientId: 'patient-001',
    patientName: 'Sarah Al-Khalifa',
    patientEmail: 'patient@patientcare.bh',
    doctorId: 'doctor-005',
    doctorName: 'Dr. Khalid Al-Thani',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
    time: '16:00',
    duration: 30,
    type: 'consultation',
    status: 'completed',
    notes: 'Cardiology consultation: Patient experiencing palpitations and shortness of breath during mild activity. Episodes last 5-10 minutes. No chest pain. Family history of heart disease.',
    fee: 40, // Dr. Khalid Al-Thani's fee
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString()
  }
];

export const appointmentStorage = {
  // Get all appointments
  getAllAppointments: (): Appointment[] => {
    try {
      const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default appointments if none exist
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(defaultAppointments));
      return defaultAppointments;
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
      
      appointments[index] = {
        ...appointments[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
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