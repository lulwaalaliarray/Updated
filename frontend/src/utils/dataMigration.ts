// Data migration utilities to fix date-related issues in existing data

import { dateUtils } from './dateUtils';
import { appointmentStorage } from './appointmentStorage';

export const dataMigration = {
  // Fix appointment dates that might be in the wrong year
  fixAppointmentDates: (): { fixed: number; total: number } => {
    try {
      const appointments = appointmentStorage.getAllAppointments();
      let fixedCount = 0;
      
      const fixedAppointments = appointments.map(appointment => {
        const originalDate = appointment.date;
        const fixedDate = dateUtils.fixAppointmentDate(originalDate);
        
        if (originalDate !== fixedDate) {
          fixedCount++;
          console.log(`Fixed appointment date: ${originalDate} -> ${fixedDate}`);
          
          return {
            ...appointment,
            date: fixedDate,
            updatedAt: new Date().toISOString()
          };
        }
        
        return appointment;
      });
      
      // Save the fixed appointments back to localStorage
      if (fixedCount > 0) {
        localStorage.setItem('patientcare_appointments', JSON.stringify(fixedAppointments));
        console.log(`Fixed ${fixedCount} appointment dates out of ${appointments.length} total appointments`);
      }
      
      return { fixed: fixedCount, total: appointments.length };
    } catch (error) {
      console.error('Error fixing appointment dates:', error);
      return { fixed: 0, total: 0 };
    }
  },

  // Validate all appointment data and fix common issues
  validateAndFixAppointmentData: (): { 
    datesFixed: number; 
    statusFixed: number; 
    total: number; 
    issues: string[] 
  } => {
    try {
      const appointments = appointmentStorage.getAllAppointments();
      let datesFixed = 0;
      let statusFixed = 0;
      const issues: string[] = [];
      
      const fixedAppointments = appointments.map(appointment => {
        let fixed = { ...appointment };
        
        // Fix date issues
        const originalDate = appointment.date;
        const fixedDate = dateUtils.fixAppointmentDate(originalDate);
        if (originalDate !== fixedDate) {
          fixed.date = fixedDate;
          datesFixed++;
          issues.push(`Fixed date for appointment ${appointment.id}: ${originalDate} -> ${fixedDate}`);
        }
        
        // Fix status issues - completed appointments in the future should be pending/confirmed
        if (appointment.status === 'completed' && dateUtils.isFutureDate(fixed.date)) {
          fixed.status = 'confirmed';
          statusFixed++;
          issues.push(`Fixed status for future appointment ${appointment.id}: completed -> confirmed`);
        }
        
        // Update timestamp if any fixes were made
        if (fixed.date !== appointment.date || fixed.status !== appointment.status) {
          fixed.updatedAt = new Date().toISOString();
        }
        
        return fixed;
      });
      
      // Save the fixed appointments back to localStorage
      if (datesFixed > 0 || statusFixed > 0) {
        localStorage.setItem('patientcare_appointments', JSON.stringify(fixedAppointments));
        console.log(`Data migration completed: ${datesFixed} dates fixed, ${statusFixed} statuses fixed`);
      }
      
      return { 
        datesFixed, 
        statusFixed, 
        total: appointments.length, 
        issues 
      };
    } catch (error) {
      console.error('Error validating and fixing appointment data:', error);
      return { datesFixed: 0, statusFixed: 0, total: 0, issues: ['Error during migration'] };
    }
  },

  // Check for data inconsistencies without fixing them
  checkDataConsistency: (): {
    futureCompletedAppointments: number;
    invalidDates: number;
    farFutureDates: number;
    total: number;
    issues: string[];
  } => {
    try {
      const appointments = appointmentStorage.getAllAppointments();
      let futureCompletedAppointments = 0;
      let invalidDates = 0;
      let farFutureDates = 0;
      const issues: string[] = [];
      
      appointments.forEach(appointment => {
        // Check for invalid dates
        const date = dateUtils.parseDate(appointment.date);
        if (!date) {
          invalidDates++;
          issues.push(`Invalid date in appointment ${appointment.id}: ${appointment.date}`);
          return;
        }
        
        // Check for far future dates (likely data errors)
        const currentYear = dateUtils.getCurrentYear();
        if (date.getFullYear() > currentYear + 1) {
          farFutureDates++;
          issues.push(`Far future date in appointment ${appointment.id}: ${appointment.date}`);
        }
        
        // Check for completed appointments in the future
        if (appointment.status === 'completed' && dateUtils.isFutureDate(appointment.date)) {
          futureCompletedAppointments++;
          issues.push(`Completed appointment in future ${appointment.id}: ${appointment.date}`);
        }
      });
      
      return {
        futureCompletedAppointments,
        invalidDates,
        farFutureDates,
        total: appointments.length,
        issues
      };
    } catch (error) {
      console.error('Error checking data consistency:', error);
      return {
        futureCompletedAppointments: 0,
        invalidDates: 0,
        farFutureDates: 0,
        total: 0,
        issues: ['Error during consistency check']
      };
    }
  },

  // Run all data migrations and return a summary
  runAllMigrations: (): {
    success: boolean;
    summary: string;
    details: any;
  } => {
    try {
      console.log('Starting data migration...');
      
      // Check consistency first
      const consistencyCheck = dataMigration.checkDataConsistency();
      console.log('Data consistency check:', consistencyCheck);
      
      // Run fixes
      const migrationResult = dataMigration.validateAndFixAppointmentData();
      console.log('Migration result:', migrationResult);
      
      const summary = `Migration completed: ${migrationResult.datesFixed} dates fixed, ${migrationResult.statusFixed} statuses fixed out of ${migrationResult.total} total appointments.`;
      
      return {
        success: true,
        summary,
        details: {
          before: consistencyCheck,
          after: migrationResult
        }
      };
    } catch (error) {
      console.error('Error running data migrations:', error);
      return {
        success: false,
        summary: 'Migration failed due to error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
};

export default dataMigration;