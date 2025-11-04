// Patient Records Storage Utility

// Global patient profile that persists across all doctors
export interface GlobalPatientProfile {
  id: string;
  fullName: string;
  email: string;
  cprNumber: string;
  age: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    governorate: string;
    postalCode: string;
  };
  profileImage?: string;
  dateCreated: string;
  lastUpdated: string;
}

export interface PatientRecord {
  id: string;
  fullName: string;
  cprNumber: string;
  age: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  numberOfVisits: number;
  medicalHistory: {
    diagnoses: string[];
    treatments: string[];
    allergies: string[];
    notes: string;
  };
  physicalInfo: {
    height: {
      value: number;
      unit: 'cm' | 'ft/in';
      feet?: number;
      inches?: number;
    };
    weight: {
      value: number;
      unit: 'kg' | 'lbs';
    };
  };
  profileImage?: string;
  contactInfo: {
    phoneNumber: string;
    email: string;
    address: {
      street: string;
      city: string;
      governorate: string;
      postalCode: string;
    };
  };
  doctorId: string;
  patientGlobalId: string; // Links to global patient profile
  dateCreated: string;
  lastUpdated: string;
  lastVisit?: string;
}

class PatientRecordsStorage {
  private storageKey = 'patientRecords';
  private globalProfilesKey = 'globalPatientProfiles';

  // Get all patient records
  getAllPatientRecords(): PatientRecord[] {
    try {
      const records = localStorage.getItem(this.storageKey);
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error('Error loading patient records:', error);
      return [];
    }
  }

  // Get patient records for a specific doctor
  getDoctorPatientRecords(doctorId: string): PatientRecord[] {
    const allRecords = this.getAllPatientRecords();
    return allRecords.filter(record => record.doctorId === doctorId);
  }

  // Get a specific patient record by ID
  getPatientRecord(patientId: string): PatientRecord | null {
    const allRecords = this.getAllPatientRecords();
    return allRecords.find(record => record.id === patientId) || null;
  }

  // Get patient record by patient ID and doctor ID
  getPatientRecordByPatientAndDoctor(patientId: string, doctorId: string): PatientRecord | null {
    const allRecords = this.getAllPatientRecords();
    return allRecords.find(record => 
      (record.contactInfo.email === patientId || record.id === patientId || record.patientGlobalId === patientId) && 
      record.doctorId === doctorId
    ) || null;
  }

  // === GLOBAL PATIENT PROFILE METHODS ===

  // Get all global patient profiles
  getAllGlobalPatientProfiles(): GlobalPatientProfile[] {
    try {
      const profiles = localStorage.getItem(this.globalProfilesKey);
      return profiles ? JSON.parse(profiles) : [];
    } catch (error) {
      console.error('Error loading global patient profiles:', error);
      return [];
    }
  }

  // Get global patient profile by email or ID
  getGlobalPatientProfile(identifier: string): GlobalPatientProfile | null {
    const allProfiles = this.getAllGlobalPatientProfiles();
    return allProfiles.find(profile => 
      profile.email === identifier || profile.id === identifier
    ) || null;
  }

  // Create or update global patient profile
  createOrUpdateGlobalPatientProfile(patientData: {
    email: string;
    fullName: string;
    cprNumber?: string;
    age?: number;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    phoneNumber?: string;
    address?: {
      street: string;
      city: string;
      governorate: string;
      postalCode: string;
    };
  }): GlobalPatientProfile {
    const allProfiles = this.getAllGlobalPatientProfiles();
    const existingProfile = this.getGlobalPatientProfile(patientData.email);

    if (existingProfile) {
      // Update existing profile with new information (only if new data is provided)
      const updatedProfile: GlobalPatientProfile = {
        ...existingProfile,
        fullName: patientData.fullName || existingProfile.fullName,
        cprNumber: patientData.cprNumber || existingProfile.cprNumber,
        age: patientData.age || existingProfile.age,
        dateOfBirth: patientData.dateOfBirth || existingProfile.dateOfBirth,
        gender: patientData.gender || existingProfile.gender,
        phoneNumber: patientData.phoneNumber || existingProfile.phoneNumber,
        address: patientData.address || existingProfile.address,
        lastUpdated: new Date().toISOString()
      };

      const profileIndex = allProfiles.findIndex(p => p.id === existingProfile.id);
      allProfiles[profileIndex] = updatedProfile;
      this.saveGlobalProfiles(allProfiles);
      return updatedProfile;
    } else {
      // Create new global profile
      const newProfile: GlobalPatientProfile = {
        id: this.generateGlobalId(),
        fullName: patientData.fullName,
        email: patientData.email,
        cprNumber: patientData.cprNumber || '',
        age: patientData.age || 0,
        dateOfBirth: patientData.dateOfBirth || '',
        gender: patientData.gender || undefined,
        phoneNumber: patientData.phoneNumber || '',
        address: patientData.address || {
          street: '',
          city: '',
          governorate: '',
          postalCode: ''
        },
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      allProfiles.push(newProfile);
      this.saveGlobalProfiles(allProfiles);
      return newProfile;
    }
  }

  private saveGlobalProfiles(profiles: GlobalPatientProfile[]): void {
    try {
      localStorage.setItem(this.globalProfilesKey, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving global patient profiles:', error);
    }
  }

  private generateGlobalId(): string {
    return 'global_patient_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Create a basic patient record from appointment data
  createPatientRecordFromAppointment(patientData: {
    patientId: string;
    patientName: string;
    patientEmail: string;
    doctorId: string;
  }): PatientRecord {
    // Check if record already exists for this doctor-patient combination
    const existingDoctorRecord = this.getPatientRecordByPatientAndDoctor(
      patientData.patientEmail, // Use email as primary identifier
      patientData.doctorId
    );

    if (existingDoctorRecord) {
      // Record already exists, just return it
      return existingDoctorRecord;
    }

    // First, check if this patient has existing records with other doctors
    const allRecords = this.getAllPatientRecords();
    const existingRecord = allRecords.find(record => 
      record.contactInfo.email === patientData.patientEmail
    );

    let globalProfile: GlobalPatientProfile;

    if (existingRecord) {
      // Use existing patient information from previous records
      globalProfile = this.createOrUpdateGlobalPatientProfile({
        email: patientData.patientEmail,
        fullName: existingRecord.fullName || patientData.patientName,
        cprNumber: existingRecord.cprNumber,
        age: existingRecord.age,
        dateOfBirth: existingRecord.dateOfBirth,
        gender: existingRecord.gender,
        phoneNumber: existingRecord.contactInfo.phoneNumber,
        address: existingRecord.contactInfo.address
      });
    } else {
      // Create new global profile for first-time patient
      globalProfile = this.createOrUpdateGlobalPatientProfile({
        email: patientData.patientEmail,
        fullName: patientData.patientName
      });
    }

    // Count appointments for this doctor-patient combination to set initial visit count
    const appointments = JSON.parse(localStorage.getItem('patientcare_appointments') || '[]');
    const patientAppointments = appointments.filter((apt: any) => 
      apt.doctorId === patientData.doctorId && 
      (apt.patientId === patientData.patientId || apt.patientEmail === patientData.patientEmail)
    );

    // Create doctor-specific patient record using global profile data
    const basicRecord: Omit<PatientRecord, 'id' | 'dateCreated' | 'lastUpdated'> = {
      fullName: globalProfile.fullName,
      cprNumber: globalProfile.cprNumber,
      age: globalProfile.age || (existingRecord?.age || 0),
      dateOfBirth: globalProfile.dateOfBirth || existingRecord?.dateOfBirth,
      gender: globalProfile.gender || existingRecord?.gender,
      numberOfVisits: Math.max(patientAppointments.length, 1),
      medicalHistory: {
        diagnoses: existingRecord?.medicalHistory?.diagnoses || [],
        treatments: existingRecord?.medicalHistory?.treatments || [],
        allergies: existingRecord?.medicalHistory?.allergies || [],
        notes: existingRecord 
          ? '🔄 Auto-created: Patient record created from existing patient information. Please update medical history and physical information as needed.'
          : '🤖 Auto-created: Patient record created automatically from appointment booking. Please fill in patient details including gender, height, weight, and medical history.'
      },
      physicalInfo: existingRecord ? {
        height: existingRecord.physicalInfo.height,
        weight: existingRecord.physicalInfo.weight
      } : {
        height: { value: 0, unit: 'cm' },
        weight: { value: 0, unit: 'kg' }
      },
      contactInfo: {
        phoneNumber: globalProfile.phoneNumber || existingRecord?.contactInfo?.phoneNumber || '',
        email: globalProfile.email,
        address: globalProfile.address || existingRecord?.contactInfo?.address || {
          street: '',
          city: '',
          governorate: '',
          postalCode: ''
        }
      },
      doctorId: patientData.doctorId,
      patientGlobalId: globalProfile.id,
      lastVisit: patientAppointments.length > 0 
        ? patientAppointments
            .filter((apt: any) => apt.status === 'completed')
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || new Date().toISOString()
        : new Date().toISOString()
    };

    return this.addPatientRecord(basicRecord);
  }

  // Create a comprehensive patient record from user registration data
  createPatientRecordFromUserData(userData: {
    patientId: string;
    patientName: string;
    patientEmail: string;
    cprNumber: string;
    phoneNumber: string;
    doctorId: string;
  }): PatientRecord {
    // Check if record already exists for this doctor-patient combination
    const existingDoctorRecord = this.getPatientRecordByPatientAndDoctor(
      userData.patientEmail,
      userData.doctorId
    );

    if (existingDoctorRecord) {
      return existingDoctorRecord;
    }

    // Create or update global patient profile with comprehensive data
    const globalProfile = this.createOrUpdateGlobalPatientProfile({
      email: userData.patientEmail,
      fullName: userData.patientName,
      cprNumber: userData.cprNumber,
      phoneNumber: userData.phoneNumber
    });

    // Count appointments for this doctor-patient combination
    const appointments = JSON.parse(localStorage.getItem('patientcare_appointments') || '[]');
    const patientAppointments = appointments.filter((apt: any) => 
      apt.doctorId === userData.doctorId && 
      (apt.patientId === userData.patientId || apt.patientEmail === userData.patientEmail)
    );

    // Calculate age from CPR if possible (Bahraini CPR format: YYMMDDXXXX)
    let calculatedAge = 0;
    if (userData.cprNumber && userData.cprNumber.length >= 6) {
      try {
        const year = parseInt(userData.cprNumber.substring(0, 2));
        const currentYear = new Date().getFullYear() % 100;
        const fullYear = year <= currentYear ? 2000 + year : 1900 + year;
        calculatedAge = new Date().getFullYear() - fullYear;
      } catch (error) {
        console.log('Could not calculate age from CPR');
      }
    }

    // Create comprehensive patient record
    const comprehensiveRecord: Omit<PatientRecord, 'id' | 'dateCreated' | 'lastUpdated'> = {
      fullName: userData.patientName,
      cprNumber: userData.cprNumber,
      age: calculatedAge > 0 ? calculatedAge : 0,
      dateOfBirth: '', // Can be calculated from CPR if needed
      gender: undefined, // Will need to be filled by doctor
      numberOfVisits: patientAppointments.length,
      medicalHistory: {
        diagnoses: [],
        treatments: [],
        allergies: [],
        notes: '✅ Auto-populated: Patient record created automatically from user registration data. Basic information has been filled. Please update medical history, physical information, and other details as needed.'
      },
      physicalInfo: {
        height: { value: 0, unit: 'cm' },
        weight: { value: 0, unit: 'kg' }
      },
      contactInfo: {
        phoneNumber: userData.phoneNumber,
        email: userData.patientEmail,
        address: {
          street: '',
          city: '',
          governorate: '',
          postalCode: ''
        }
      },
      doctorId: userData.doctorId,
      patientGlobalId: globalProfile.id,
      lastVisit: patientAppointments.length > 0 
        ? patientAppointments
            .filter((apt: any) => apt.status === 'completed')
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || new Date().toISOString()
        : new Date().toISOString()
    };

    return this.addPatientRecord(comprehensiveRecord);
  }

  // Add a new patient record
  addPatientRecord(record: Omit<PatientRecord, 'id' | 'dateCreated' | 'lastUpdated'>): PatientRecord {
    const allRecords = this.getAllPatientRecords();
    const newRecord: PatientRecord = {
      ...record,
      id: this.generateId(),
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    allRecords.push(newRecord);
    this.saveRecords(allRecords);
    return newRecord;
  }

  // Update an existing patient record
  updatePatientRecord(patientId: string, updates: Partial<PatientRecord>): PatientRecord | null {
    const allRecords = this.getAllPatientRecords();
    const recordIndex = allRecords.findIndex(record => record.id === patientId);
    
    if (recordIndex === -1) return null;
    
    const currentRecord = allRecords[recordIndex];
    const updatedRecord = {
      ...currentRecord,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    allRecords[recordIndex] = updatedRecord;
    this.saveRecords(allRecords);

    // Update global profile if relevant information changed
    if (updates.fullName || updates.cprNumber || updates.age || updates.dateOfBirth || 
        updates.gender || updates.contactInfo) {
      this.createOrUpdateGlobalPatientProfile({
        email: updatedRecord.contactInfo.email,
        fullName: updatedRecord.fullName,
        cprNumber: updatedRecord.cprNumber,
        age: updatedRecord.age,
        dateOfBirth: updatedRecord.dateOfBirth,
        gender: updatedRecord.gender,
        phoneNumber: updatedRecord.contactInfo.phoneNumber,
        address: updatedRecord.contactInfo.address
      });
    }
    
    return updatedRecord;
  }

  // Sync patient records with appointment data for a specific doctor
  syncPatientRecordsWithAppointments(doctorId: string): void {
    try {
      const appointments = JSON.parse(localStorage.getItem('patientcare_appointments') || '[]');
      const doctorAppointments = appointments.filter((apt: any) => apt.doctorId === doctorId);
      const allRecords = this.getDoctorPatientRecords(doctorId);
      
      // Update each record with real appointment data
      allRecords.forEach(record => {
        const patientAppointments = doctorAppointments.filter((apt: any) => 
          apt.patientId === record.patientGlobalId ||
          apt.patientEmail === record.contactInfo.email ||
          apt.patientId === record.id ||
          apt.patientName === record.fullName
        );
        
        const completedAppointments = patientAppointments.filter((apt: any) => apt.status === 'completed');
        const lastCompletedAppointment = completedAppointments
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        
        // Update visit count and last visit
        this.updatePatientRecord(record.id, {
          numberOfVisits: patientAppointments.length,
          lastVisit: lastCompletedAppointment ? lastCompletedAppointment.date : record.lastVisit
        });
      });
    } catch (error) {
      console.error('Error syncing patient records with appointments:', error);
    }
  }

  // Delete a patient record
  deletePatientRecord(patientId: string): boolean {
    const allRecords = this.getAllPatientRecords();
    const filteredRecords = allRecords.filter(record => record.id !== patientId);
    
    if (filteredRecords.length === allRecords.length) return false;
    
    this.saveRecords(filteredRecords);
    return true;
  }

  // Search patient records by name or CPR
  searchPatientRecords(doctorId: string, query: string): PatientRecord[] {
    const doctorRecords = this.getDoctorPatientRecords(doctorId);
    const lowercaseQuery = query.toLowerCase();
    
    return doctorRecords.filter(record => 
      record.fullName.toLowerCase().includes(lowercaseQuery) ||
      record.cprNumber.includes(query) ||
      record.contactInfo.email.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Increment visit count
  incrementVisitCount(patientId: string): PatientRecord | null {
    const record = this.getPatientRecord(patientId);
    if (!record) return null;
    
    return this.updatePatientRecord(patientId, {
      numberOfVisits: record.numberOfVisits + 1,
      lastVisit: new Date().toISOString()
    });
  }

  // Export patient records to JSON
  exportPatientRecords(doctorId: string): string {
    const records = this.getDoctorPatientRecords(doctorId);
    return JSON.stringify(records, null, 2);
  }

  // Import patient records from JSON
  importPatientRecords(jsonData: string): boolean {
    try {
      const importedRecords: PatientRecord[] = JSON.parse(jsonData);
      const allRecords = this.getAllPatientRecords();
      
      // Add imported records with new IDs to avoid conflicts
      const newRecords = importedRecords.map(record => ({
        ...record,
        id: this.generateId(),
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }));
      
      allRecords.push(...newRecords);
      this.saveRecords(allRecords);
      return true;
    } catch (error) {
      console.error('Error importing patient records:', error);
      return false;
    }
  }

  // Private helper methods
  private saveRecords(records: PatientRecord[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving patient records:', error);
    }
  }

  private generateId(): string {
    return 'patient_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize with sample data (disabled in favor of automatic user data population)
  initializeSampleData(doctorId: string): void {
    // Sample data initialization is now disabled in favor of automatic patient record creation
    // from real user registration data and appointments. The enhanced system automatically
    // creates comprehensive patient records when appointments are booked.
    return;

    const sampleRecords: Omit<PatientRecord, 'id' | 'dateCreated' | 'lastUpdated'>[] = [
      {
        fullName: 'Ahmed Al-Mansouri',
        cprNumber: '850123456',
        age: 39,
        dateOfBirth: '1985-01-23',
        gender: 'male',
        numberOfVisits: 5,
        medicalHistory: {
          diagnoses: ['Hypertension', 'Type 2 Diabetes'],
          treatments: ['Metformin 500mg', 'Lisinopril 10mg'],
          allergies: ['Penicillin', 'Shellfish'],
          notes: 'Patient responds well to current medication. Regular monitoring required.'
        },
        physicalInfo: {
          height: { value: 175, unit: 'cm' },
          weight: { value: 80, unit: 'kg' }
        },
        contactInfo: {
          phoneNumber: '+973 3612 3456',
          email: 'ahmed.mansouri@email.com',
          address: {
            street: 'Building 123, Road 456',
            city: 'Manama',
            governorate: 'Capital',
            postalCode: '317'
          }
        },
        doctorId,
        patientGlobalId: this.generateGlobalId(),
        lastVisit: '2024-01-15T10:30:00.000Z'
      },
      {
        fullName: 'Fatima Al-Khalifa',
        cprNumber: '920456789',
        age: 32,
        dateOfBirth: '1992-04-15',
        gender: 'female',
        numberOfVisits: 3,
        medicalHistory: {
          diagnoses: ['Asthma', 'Seasonal Allergies'],
          treatments: ['Albuterol Inhaler', 'Cetirizine 10mg'],
          allergies: ['Dust mites', 'Pollen'],
          notes: 'Asthma well controlled with current inhaler. Avoid known allergens.'
        },
        physicalInfo: {
          height: { value: 162, unit: 'cm' },
          weight: { value: 65, unit: 'kg' }
        },
        contactInfo: {
          phoneNumber: '+973 3698 7412',
          email: 'fatima.khalifa@email.com',
          address: {
            street: 'Villa 789, Block 321',
            city: 'Riffa',
            governorate: 'Southern',
            postalCode: '901'
          }
        },
        doctorId,
        patientGlobalId: this.generateGlobalId(),
        lastVisit: '2024-01-20T14:15:00.000Z'
      },
      {
        fullName: 'Mohammed Al-Bahrani',
        cprNumber: '780987654',
        age: 46,
        dateOfBirth: '1978-09-12',
        gender: 'male',
        numberOfVisits: 8,
        medicalHistory: {
          diagnoses: ['Chronic Back Pain', 'Arthritis'],
          treatments: ['Ibuprofen 400mg', 'Physical Therapy'],
          allergies: ['None known'],
          notes: 'Chronic condition managed with medication and therapy. Regular follow-ups needed.'
        },
        physicalInfo: {
          height: { value: 180, unit: 'cm' },
          weight: { value: 90, unit: 'kg' }
        },
        contactInfo: {
          phoneNumber: '+973 3654 9871',
          email: 'mohammed.bahrani@email.com',
          address: {
            street: 'Apartment 45, Building 678',
            city: 'Muharraq',
            governorate: 'Muharraq',
            postalCode: '436'
          }
        },
        doctorId,
        patientGlobalId: this.generateGlobalId(),
        lastVisit: '2024-01-25T09:00:00.000Z'
      }
    ];

    sampleRecords.forEach(record => {
      // Create global profile first
      this.createOrUpdateGlobalPatientProfile({
        email: record.contactInfo.email,
        fullName: record.fullName,
        cprNumber: record.cprNumber,
        age: record.age,
        dateOfBirth: record.dateOfBirth,
        gender: record.gender,
        phoneNumber: record.contactInfo.phoneNumber,
        address: record.contactInfo.address
      });
      
      // Then add the patient record
      this.addPatientRecord(record);
    });
  }
}

export const patientRecordsStorage = new PatientRecordsStorage();