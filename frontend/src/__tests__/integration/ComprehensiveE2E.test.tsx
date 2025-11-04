import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import appointmentReducer from '../../store/slices/appointmentSlice';
import authReducer from '../../store/slices/authSlice';
import userReducer from '../../store/slices/userSlice';
import { theme } from '../../utils/theme';
import { renderWithProviders, createMockUser, createMockAppointment, VIEWPORT_SIZES, setViewportSize } from '../utils/test-utils';

// Import components for testing
import HomePage from '../../pages/HomePage';
import DoctorSearchPage from '../../components/DoctorSearch/DoctorSearchPage';
import AppointmentBooking from '../../components/Booking/AppointmentBooking';
import PaymentPage from '../../components/Payment/PaymentPage';
import PatientDashboard from '../../components/Dashboard/PatientDashboard';
import AdminDashboard from '../../components/AdminDashboard';
import AdminDashboardPage from '../../pages/AdminDashboardPage';
import AppointmentsPage from '../../pages/AppointmentsPage';

// Mock external services
global.fetch = vi.fn();
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// Mock Google Maps
const mockGoogleMaps = {
  Map: vi.fn(),
  Marker: vi.fn(),
  InfoWindow: vi.fn(),
  places: {
    PlacesService: vi.fn(),
    AutocompleteService: vi.fn(),
  },
};
(global as any).google = { maps: mockGoogleMaps };

// Mock Zoom SDK
const mockZoomSdk = {
  init: vi.fn(),
  join: vi.fn(),
  leave: vi.fn(),
};
(global as any).ZoomMtg = mockZoomSdk;

describe('Comprehensive Frontend End-to-End Tests', () => {
  const mockPatientUser = createMockUser({
    role: 'patient',
    profile: {
      userId: 'patient-1',
      name: 'John Patient',
      age: 35,
      gender: 'male',
      contactInfo: { phone: '+1234567890' },
      address: {
        street: '123 Patient St',
        city: 'Patient City',
        state: 'Patient State',
        zipCode: '12345',
        country: 'USA',
      },
    },
  });

  const mockDoctorUser = createMockUser({
    id: 'doctor-1',
    role: 'doctor',
    email: 'doctor@test.com',
    profile: {
      userId: 'doctor-1',
      name: 'Dr. Sarah Wilson',
      profilePicture: 'doctor.jpg',
      medicalLicenseNumber: 'MD123456',
      licenseVerificationStatus: 'verified',
      qualifications: ['MBBS', 'MD', 'Cardiology'],
      yearsOfExperience: 12,
      specializations: ['Cardiology', 'Internal Medicine'],
      contactInfo: { phone: '+1234567891' },
      clinicInfo: {
        name: 'Heart Care Clinic',
        address: {
          street: '456 Medical St',
          city: 'Medical City',
          state: 'Medical State',
          zipCode: '54321',
          country: 'USA',
        },
        contactInfo: { phone: '+1234567891' },
        facilities: ['ECG', 'Echo', 'Stress Test'],
      },
      consultationFee: 600,
      rating: 4.7,
      totalReviews: 150,
      isAcceptingPatients: true,
    },
  });

  const mockAdminUser = createMockUser({
    id: 'admin-1',
    role: 'admin',
    email: 'admin@test.com',
    profile: {
      userId: 'admin-1',
      name: 'Admin User',
      permissions: ['user_management', 'payment_monitoring', 'system_analytics'],
      contactInfo: { phone: '+1234567892' },
    },
  });

  const mockAppointment = createMockAppointment({
    id: 'appointment-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    scheduledDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    type: 'online',
    status: 'confirmed',
    paymentStatus: 'completed',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/v1/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            token: 'mock-jwt-token',
            user: mockPatientUser,
          }),
        });
      }
      
      if (url.includes('/api/v1/users/doctors/search')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            doctors: [mockDoctorUser],
            total: 1,
          }),
        });
      }
      
      if (url.includes('/api/v1/appointments')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAppointment),
        });
      }
      
      if (url.includes('/api/v1/payments')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'payment-1',
            status: 'completed',
            amount: 600,
          }),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Mock geolocation
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
      });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Patient Appointment Booking Journey', () => {
    it('should complete the entire patient journey from search to appointment completion', async () => {
      const user = userEvent.setup();

      // Step 1: Patient searches for doctors
      const { rerender } = renderWithProviders(<DoctorSearchPage />);
      
      // Search by specialization
      const specializationSelect = screen.getByLabelText(/specialization/i);
      await user.click(specializationSelect);
      await user.click(screen.getByText('Cardiology'));
      
      // Search by location
      const locationInput = screen.getByLabelText(/location/i);
      await user.type(locationInput, 'Medical City');
      
      // Apply filters
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Wilson')).toBeInTheDocument();
        expect(screen.getByText('Cardiology')).toBeInTheDocument();
        expect(screen.getByText('4.7')).toBeInTheDocument();
      });

      // Step 2: Patient selects doctor and books appointment
      const bookButton = screen.getByRole('button', { name: /book appointment/i });
      await user.click(bookButton);

      // Render appointment booking component
      rerender(<AppointmentBooking doctorId="doctor-1" />);
      
      // Select appointment type
      const onlineOption = screen.getByLabelText(/online consultation/i);
      await user.click(onlineOption);
      
      // Select date and time
      const dateInput = screen.getByLabelText(/appointment date/i);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      await user.type(dateInput, futureDate.toISOString().split('T')[0]);
      
      const timeSelect = screen.getByLabelText(/appointment time/i);
      await user.click(timeSelect);
      await user.click(screen.getByText('2:00 PM'));
      
      // Add notes
      const notesInput = screen.getByLabelText(/notes/i);
      await user.type(notesInput, 'Experiencing chest pain and irregular heartbeat');
      
      // Submit booking
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/appointment request submitted/i)).toBeInTheDocument();
      });

      // Step 3: Process payment after doctor acceptance
      rerender(<PaymentPage appointmentId="appointment-1" />);
      
      // Enter payment details
      const cardNumberInput = screen.getByLabelText(/card number/i);
      await user.type(cardNumberInput, '4242424242424242');
      
      const expiryInput = screen.getByLabelText(/expiry/i);
      await user.type(expiryInput, '12/25');
      
      const cvvInput = screen.getByLabelText(/cvv/i);
      await user.type(cvvInput, '123');
      
      // Process payment
      const payButton = screen.getByRole('button', { name: /pay now/i });
      await user.click(payButton);
      
      await waitFor(() => {
        expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
      });

      // Step 4: View appointment in patient dashboard
      rerender(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument();
        expect(screen.getByText('Dr. Sarah Wilson')).toBeInTheDocument();
        expect(screen.getByText('Online Consultation')).toBeInTheDocument();
      });

      // Step 5: Join video consultation functionality removed

      // Step 6: Test medical history upload during appointment booking
      rerender(<AppointmentBooking doctorId="doctor-1" />);
      
      const uploadButton = screen.getByRole('button', { name: /upload medical history/i });
      await user.click(uploadButton);
      
      const fileInput = screen.getByLabelText(/select file/i);
      const file = new File(['medical report content'], 'medical-report.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, file);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Recent blood test results');
      
      const uploadSubmitButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/file uploaded successfully/i)).toBeInTheDocument();
      });

      // Step 7: Test appointment reminder notifications
      rerender(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });
      
      const notificationBell = screen.getByRole('button', { name: /notifications/i });
      await user.click(notificationBell);
      
      await waitFor(() => {
        expect(screen.getByText(/appointment reminder/i)).toBeInTheDocument();
        expect(screen.getByText(/your appointment is in 1 hour/i)).toBeInTheDocument();
      });
    });

    it('should handle appointment cancellation and rescheduling', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<AppointmentsPage />);
      
      await waitFor(() => {
        expect(screen.getByText('My Appointments')).toBeInTheDocument();
      });
      
      // Test cancellation
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      const confirmButton = screen.getByRole('button', { name: /confirm cancellation/i });
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(screen.getByText(/appointment cancelled/i)).toBeInTheDocument();
      });
      
      // Test rescheduling
      const rescheduleButton = screen.getByRole('button', { name: /reschedule/i });
      await user.click(rescheduleButton);
      
      const newDateInput = screen.getByLabelText(/new date/i);
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 5);
      await user.type(newDateInput, newDate.toISOString().split('T')[0]);
      
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/appointment rescheduled/i)).toBeInTheDocument();
      });
    });
  });

  describe('Doctor Appointment Management Workflow', () => {
    it('should complete doctor workflow from appointment acceptance to completion', async () => {
      const user = userEvent.setup();
      
      // Mock doctor user in store
      const store = configureStore({
        reducer: {
          auth: authReducer,
          appointments: appointmentReducer,
          user: userReducer,
        },
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockDoctorUser,
            token: 'mock-doctor-token',
            loading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <ThemeProvider theme={theme}>
              <AdminDashboard />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>
      );

      // Step 1: View pending appointment requests
      await waitFor(() => {
        expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      });

      // Step 2: Accept appointment request
      const acceptButton = screen.getByRole('button', { name: /accept/i });
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(screen.getByText(/appointment accepted/i)).toBeInTheDocument();
      });

      // Step 3: View patient medical history
      const viewHistoryButton = screen.getByRole('button', { name: /view history/i });
      await user.click(viewHistoryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Medical History')).toBeInTheDocument();
      });

      // Step 4: Complete appointment with notes
      const completeButton = screen.getByRole('button', { name: /complete appointment/i });
      await user.click(completeButton);
      
      const notesTextarea = screen.getByLabelText(/consultation notes/i);
      await user.type(notesTextarea, 'Patient examined thoroughly. Prescribed medication for chest pain.');
      
      const prescriptionInput = screen.getByLabelText(/prescription/i);
      await user.type(prescriptionInput, 'Aspirin 75mg daily for 30 days');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/appointment completed/i)).toBeInTheDocument();
      });

      // Step 5: View earnings summary
      const earningsTab = screen.getByRole('tab', { name: /earnings/i });
      await user.click(earningsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Total Earnings')).toBeInTheDocument();
        expect(screen.getByText('₹600')).toBeInTheDocument();
      });

      // Step 6: Doctor manages patient reviews and ratings
      const reviewsTab = screen.getByRole('tab', { name: /reviews/i });
      await user.click(reviewsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Patient Reviews')).toBeInTheDocument();
        expect(screen.getByText('Average Rating: 4.7')).toBeInTheDocument();
      });
      
      const reviewResponse = screen.getByRole('button', { name: /respond to review/i });
      await user.click(reviewResponse);
      
      const responseTextarea = screen.getByLabelText(/response/i);
      await user.type(responseTextarea, 'Thank you for your feedback. I appreciate your trust in my care.');
      
      const submitResponseButton = screen.getByRole('button', { name: /submit response/i });
      await user.click(submitResponseButton);
      
      await waitFor(() => {
        expect(screen.getByText(/response submitted/i)).toBeInTheDocument();
      });

      // Step 7: Doctor updates consultation fees and availability
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      await user.click(settingsTab);
      
      const consultationFeeInput = screen.getByLabelText(/consultation fee/i);
      await user.clear(consultationFeeInput);
      await user.type(consultationFeeInput, '650');
      
      const availabilityCheckbox = screen.getByLabelText(/accepting new patients/i);
      await user.click(availabilityCheckbox);
      
      const saveSettingsButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveSettingsButton);
      
      await waitFor(() => {
        expect(screen.getByText(/settings updated/i)).toBeInTheDocument();
      });
    });

    it('should handle appointment rejection with reason', async () => {
      const user = userEvent.setup();
      
      const store = configureStore({
        reducer: {
          auth: authReducer,
          appointments: appointmentReducer,
          user: userReducer,
        },
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockDoctorUser,
            token: 'mock-doctor-token',
            loading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <ThemeProvider theme={theme}>
              <AdminDashboard />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>
      );

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);
      
      const reasonSelect = screen.getByLabelText(/rejection reason/i);
      await user.click(reasonSelect);
      await user.click(screen.getByText('Schedule conflict'));
      
      const confirmRejectButton = screen.getByRole('button', { name: /confirm rejection/i });
      await user.click(confirmRejectButton);
      
      await waitFor(() => {
        expect(screen.getByText(/appointment rejected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Admin User and System Management Functions', () => {
    it('should complete admin workflow for comprehensive system management', async () => {
      const user = userEvent.setup();
      
      // Mock admin user in store
      const store = configureStore({
        reducer: {
          auth: authReducer,
          appointments: appointmentReducer,
          user: userReducer,
        },
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockAdminUser,
            token: 'mock-admin-token',
            loading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <ThemeProvider theme={theme}>
              <AdminDashboardPage />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>
      );

      // Step 1: View system analytics
      await waitFor(() => {
        expect(screen.getByText('System Analytics')).toBeInTheDocument();
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('Total Appointments')).toBeInTheDocument();
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      });

      // Step 2: Manage user accounts
      const userManagementTab = screen.getByRole('tab', { name: /user management/i });
      await user.click(userManagementTab);
      
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });

      // Step 3: Verify doctor licenses
      const doctorVerificationTab = screen.getByRole('tab', { name: /doctor verification/i });
      await user.click(doctorVerificationTab);
      
      await waitFor(() => {
        expect(screen.getByText('Pending Verifications')).toBeInTheDocument();
      });

      const verifyButton = screen.getByRole('button', { name: /verify/i });
      await user.click(verifyButton);
      
      await waitFor(() => {
        expect(screen.getByText(/doctor verified/i)).toBeInTheDocument();
      });

      // Step 4: Monitor payment transactions
      const paymentMonitoringTab = screen.getByRole('tab', { name: /payments/i });
      await user.click(paymentMonitoringTab);
      
      await waitFor(() => {
        expect(screen.getByText('Payment Transactions')).toBeInTheDocument();
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      });

      // Step 5: View system health
      const systemHealthTab = screen.getByRole('tab', { name: /system health/i });
      await user.click(systemHealthTab);
      
      await waitFor(() => {
        expect(screen.getByText('System Status')).toBeInTheDocument();
        expect(screen.getByText('Database')).toBeInTheDocument();
        expect(screen.getByText('API Services')).toBeInTheDocument();
      });

      // Step 6: Generate reports
      const generateReportButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateReportButton);
      
      const reportTypeSelect = screen.getByLabelText(/report type/i);
      await user.click(reportTypeSelect);
      await user.click(screen.getByText('Monthly Summary'));
      
      const downloadButton = screen.getByRole('button', { name: /download/i });
      await user.click(downloadButton);
      
      await waitFor(() => {
        expect(screen.getByText(/report generated/i)).toBeInTheDocument();
      });

      // Step 7: Admin manages system notifications and announcements
      const announcementsTab = screen.getByRole('tab', { name: /announcements/i });
      await user.click(announcementsTab);
      
      const createAnnouncementButton = screen.getByRole('button', { name: /create announcement/i });
      await user.click(createAnnouncementButton);
      
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'System Maintenance Notice');
      
      const messageTextarea = screen.getByLabelText(/message/i);
      await user.type(messageTextarea, 'Scheduled maintenance will occur on Sunday from 2-4 AM.');
      
      const targetAudienceSelect = screen.getByLabelText(/target audience/i);
      await user.click(targetAudienceSelect);
      await user.click(screen.getByText('All Users'));
      
      const publishButton = screen.getByRole('button', { name: /publish/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText(/announcement published/i)).toBeInTheDocument();
      });

      // Step 8: Admin handles emergency system controls
      const emergencyTab = screen.getByRole('tab', { name: /emergency controls/i });
      await user.click(emergencyTab);
      
      const maintenanceModeToggle = screen.getByRole('switch', { name: /maintenance mode/i });
      await user.click(maintenanceModeToggle);
      
      const confirmMaintenanceButton = screen.getByRole('button', { name: /confirm maintenance mode/i });
      await user.click(confirmMaintenanceButton);
      
      await waitFor(() => {
        expect(screen.getByText(/maintenance mode activated/i)).toBeInTheDocument();
      });
      
      // Disable maintenance mode
      await user.click(maintenanceModeToggle);
      
      await waitFor(() => {
        expect(screen.getByText(/maintenance mode deactivated/i)).toBeInTheDocument();
      });
    });

    it('should handle dispute resolution and user support', async () => {
      const user = userEvent.setup();
      
      const store = configureStore({
        reducer: {
          auth: authReducer,
          appointments: appointmentReducer,
          user: userReducer,
        },
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockAdminUser,
            token: 'mock-admin-token',
            loading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <BrowserRouter>
            <ThemeProvider theme={theme}>
              <AdminDashboardPage />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>
      );

      const disputesTab = screen.getByRole('tab', { name: /disputes/i });
      await user.click(disputesTab);
      
      await waitFor(() => {
        expect(screen.getByText('Active Disputes')).toBeInTheDocument();
      });

      const resolveButton = screen.getByRole('button', { name: /resolve/i });
      await user.click(resolveButton);
      
      const resolutionNotes = screen.getByLabelText(/resolution notes/i);
      await user.type(resolutionNotes, 'Dispute resolved in favor of patient. Refund processed.');
      
      const submitResolutionButton = screen.getByRole('button', { name: /submit resolution/i });
      await user.click(submitResolutionButton);
      
      await waitFor(() => {
        expect(screen.getByText(/dispute resolved/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Platform Responsive Design Tests', () => {
    it('should work correctly on mobile devices', async () => {
      // Set mobile viewport
      setViewportSize(VIEWPORT_SIZES.mobile);
      
      const user = userEvent.setup();
      
      renderWithProviders(<HomePage />);
      
      // Test mobile navigation
      const menuButton = screen.getByRole('button', { name: /menu/i });
      await user.click(menuButton);
      
      await waitFor(() => {
        expect(screen.getByText('Find Doctors')).toBeInTheDocument();
        expect(screen.getByText('My Appointments')).toBeInTheDocument();
      });
      
      // Test touch interactions
      const findDoctorsLink = screen.getByText('Find Doctors');
      fireEvent.touchStart(findDoctorsLink);
      fireEvent.touchEnd(findDoctorsLink);
      
      await waitFor(() => {
        expect(screen.getByText('Search Doctors')).toBeInTheDocument();
      });
    });

    it('should work correctly on tablet devices', async () => {
      // Set tablet viewport
      setViewportSize(VIEWPORT_SIZES.tablet);
      
      renderWithProviders(<DoctorSearchPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Find Healthcare Providers')).toBeInTheDocument();
      });
      
      // Verify responsive layout
      const searchContainer = screen.getByTestId('search-container');
      expect(searchContainer).toHaveClass('tablet-layout');
    });

    it('should work correctly on desktop devices', async () => {
      // Set desktop viewport
      setViewportSize(VIEWPORT_SIZES.desktop);
      
      renderWithProviders(<AdminDashboardPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
      
      // Verify desktop-specific features
      const sidebarNavigation = screen.getByTestId('sidebar-navigation');
      expect(sidebarNavigation).toBeVisible();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<DoctorSearchPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('should handle invalid user input', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<AppointmentBooking doctorId="doctor-1" />);
      
      // Try to submit without required fields
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please select a date/i)).toBeInTheDocument();
        expect(screen.getByText(/please select a time/i)).toBeInTheDocument();
      });
    });

    it('should handle session expiration', async () => {
      // Mock 401 unauthorized response
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Token expired' }),
      });
      
      renderWithProviders(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/session expired/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login again/i })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and Usability Tests', () => {
    it('should be accessible via keyboard navigation', async () => {
      renderWithProviders(<DoctorSearchPage />);
      
      // Test tab navigation
      const searchInput = screen.getByLabelText(/search/i);
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);
      
      // Test keyboard shortcuts
      fireEvent.keyDown(searchInput, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Search Results')).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(<AdminDashboardPage />);
      
      // Check for proper ARIA attributes
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Admin navigation');
      
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Admin dashboard content');
    });

    it('should support screen readers', () => {
      renderWithProviders(<AppointmentBooking doctorId="doctor-1" />);
      
      // Check for screen reader announcements
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});