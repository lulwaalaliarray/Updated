import { appointmentStorage, Appointment } from './appointmentStorage';

export interface AppointmentUpdateEvent {
  appointmentId: string;
  oldStatus: Appointment['status'];
  newStatus: Appointment['status'];
  updatedBy: string;
  timestamp: string;
}

// Enhanced appointment management with real-time updates
export const appointmentManager = {
  // Update appointment status with automatic notifications
  updateAppointmentStatus: (
    appointmentId: string, 
    newStatus: Appointment['status'], 
    updatedBy: string,
    notes?: string
  ): boolean => {
    try {
      const appointments = appointmentStorage.getAllAppointments();
      const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
      
      if (appointmentIndex === -1) {
        return false;
      }
      
      const appointment = appointments[appointmentIndex];
      
      // Update the appointment
      const success = appointmentStorage.updateAppointment(appointmentId, {
        status: newStatus,
        notes: notes || appointment.notes,
        updatedAt: new Date().toISOString()
      });
      
      if (success) {
        // Trigger custom event for real-time updates
        const updateEvent: AppointmentUpdateEvent = {
          appointmentId,
          oldStatus: appointment.status,
          newStatus,
          updatedBy,
          timestamp: new Date().toISOString()
        };
        
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('appointmentStatusChanged', {
          detail: updateEvent
        }));
        
        // Store notification for the patient/doctor
        appointmentManager.createNotification(appointment, appointment.status, newStatus, updatedBy);
      }
      
      return success;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }
  },

  // Create notification for appointment status changes
  createNotification: (
    appointment: Appointment,
    oldStatus: Appointment['status'],
    newStatus: Appointment['status'],
    updatedBy: string
  ): void => {
    try {
      const notifications = JSON.parse(localStorage.getItem('appointmentNotifications') || '[]');
      
      const notification = {
        id: Date.now().toString(),
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        message: appointmentManager.getStatusChangeMessage(oldStatus, newStatus, appointment),
        type: newStatus === 'confirmed' ? 'success' : newStatus === 'rejected' ? 'error' : 'info',
        read: false,
        createdAt: new Date().toISOString(),
        updatedBy
      };
      
      notifications.push(notification);
      localStorage.setItem('appointmentNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  },

  // Get status change message
  getStatusChangeMessage: (
    _oldStatus: Appointment['status'],
    newStatus: Appointment['status'],
    appointment: Appointment
  ): string => {
    const doctorName = appointment.doctorName;
    const date = new Date(appointment.date).toLocaleDateString();
    const time = appointment.time;
    
    switch (newStatus) {
      case 'confirmed':
        return `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been approved.`;
      case 'rejected':
        return `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been declined.`;
      case 'cancelled':
        return `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been cancelled.`;
      case 'completed':
        return `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been completed.`;
      default:
        return `Your appointment status has been updated to ${newStatus}.`;
    }
  },

  // Get notifications for a user
  getUserNotifications: (userId: string, userType: 'patient' | 'doctor'): any[] => {
    try {
      const notifications = JSON.parse(localStorage.getItem('appointmentNotifications') || '[]');
      
      return notifications.filter((notification: any) => {
        if (userType === 'patient') {
          return notification.patientId === userId;
        } else {
          return notification.doctorId === userId;
        }
      }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  // Mark notification as read
  markNotificationAsRead: (notificationId: string): boolean => {
    try {
      const notifications = JSON.parse(localStorage.getItem('appointmentNotifications') || '[]');
      const notificationIndex = notifications.findIndex((n: any) => n.id === notificationId);
      
      if (notificationIndex !== -1) {
        notifications[notificationIndex].read = true;
        localStorage.setItem('appointmentNotifications', JSON.stringify(notifications));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },



  // Get appointment statistics for dashboard
  getAppointmentStats: (userId: string, userType: 'patient' | 'doctor' | 'admin') => {
    try {
      const appointments = appointmentStorage.getAllAppointments();
      let userAppointments: Appointment[] = [];
      
      if (userType === 'admin') {
        userAppointments = appointments;
      } else if (userType === 'doctor') {
        userAppointments = appointments.filter(apt => apt.doctorId === userId);
      } else {
        userAppointments = appointments.filter(apt => apt.patientId === userId);
      }
      
      const stats = {
        total: userAppointments.length,
        pending: userAppointments.filter(apt => apt.status === 'pending').length,
        confirmed: userAppointments.filter(apt => apt.status === 'confirmed').length,
        completed: userAppointments.filter(apt => apt.status === 'completed').length,
        cancelled: userAppointments.filter(apt => apt.status === 'cancelled').length,
        rejected: userAppointments.filter(apt => apt.status === 'rejected').length
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0
      };
    }
  }
};

