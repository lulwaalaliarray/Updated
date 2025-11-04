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
import { renderWithProviders, createMockUser, createMockAppointment } from '../utils/test-utils';

// Import all major components for comprehensive testing
import HomePage from '../../pages/HomePage';
import DoctorSearchPage from '../../components/DoctorSearch/DoctorSearchPage';
import AppointmentBooking from '../../components/Booking/AppointmentBooking';
import PaymentPage from '../../components/Payment/PaymentPage';
import PatientDashboard from '../../components/Dashboard/PatientDashboard';
import AdminDashboard from '../../components/AdminDashboard';
import AdminDashboardPage from '../../pages/AdminDashboardPage';
import AppointmentsPage from '../../pages/AppointmentsPage';
import MedicalHistoryPage from '../../components/MedicalHistory/MedicalHistoryPage';

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

describe('Comprehensive Frontend Validation Tests', () => {
  const mockPatientUser = createMockUser({
    role: 'patient',
    profile: {
      userId: 'validation-patient-1',
      name: 'Validation Patient',
      age: 32,
      gender: 'female',
      contactInfo: { phone: '+1234567890' },
      address: {
        street: '123 Validation St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'USA',
      },
    },
  });

  const mockDoctorUser = createMockUser({
    id: 'validation-doctor-1',
    role: 'doctor',
    email: 'validation.doctor@test.com',
    profile: {
      userId: 'validation-doctor-1',
      name: 'Dr. Validation Test',
      medicalLicenseNumber: 'VAL123456',
      licenseVerificationStatus: 'verified',
      qualifications: ['MBBS', 'MD Internal Medicine'],
      yearsOfExperience: 8,
      specializations: ['Internal Medicine', 'General Practice'],
      contactInfo: { phone: '+1234567891' },
      clinicInfo: {
        name: 'Validation Medical Center',
        address: {
          street: '456 Medical Ave',
          city: 'Medical City',
          state: 'Medical State',
          zipCode: '54321',
          country: 'USA',
        },
        contactInfo: { phone: '+1234567891' },
        facilities: ['General Consultation', 'Diagnostic Services'],
      },
      consultationFee: 500,
      rating: 4.6,
      totalReviews: 75,
      isAcceptingPatients: true,
    },
  });

  const mockAdminUser = createMockUser({
    id: 'validation-admin-1',
    role: 'admin',
    email: 'validation.admin@test.com',
    profile: {
      userId: 'validation-admin-1',
      name: 'Validation Admin',
      permissions: ['user_management', 'payment_monitoring', 'system_analytics'],
      contactInfo: { phone: '+1234567892' },
    },
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
          json: () => Promise.resolve({
            id: 'validation-appointment-1',
            patientId: 'validation-patient-1',
            doctorId: 'validation-doctor-1',
            scheduledDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            type: 'online',
            status: 'awaiting_acceptance',
            paymentStatus: 'pending',
          }),
        });
      }
      
      if (url.includes('/api/v1/payments')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'validation-payment-1',
            status: 'completed',
            amount: 500,
          }),
        });
      }
      
      if (url.includes('/api/v1/admin')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            totalUsers: 1000,
            totalAppointments: 500,
            totalRevenue: 250000,
            averageRating: 4.5,
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

  describe('Complete System Workflow Validation', () => {
    it('should validate all user requirements through complete UI workflows', async () => {
      const user = userEvent.setup();

      // Requirement 1 & 2: User Registration and Doctor Search
      const { rerender } = renderWithProviders(<DoctorSearchPage />);
      
      // Test location-based search
      const locationInput = screen.getByLabelText(/location/i);
      await user.type(locationInput, 'Medical City');
      
      const specializationSelect = screen.getByLabelText(/specialization/i);
      await user.click(specializationSelect);
      await user.click(screen.getByText('Internal Medicine'));
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Dr. Validation Test')).toBeInTheDocument();
        expect(screen.getByText('Internal Medicine')).toBeInTheDocument();
        expect(screen.getByText('4.6')).toBeInTheDocument();
      });

      // Requirement 3: Appointment Booking with Time Constraints
      const bookButton = screen.getByRole('button', { name: /book appointment/i });
      await user.click(bookButton);

      rerender(<AppointmentBooking doctorId="validation-doctor-1" />);
      
      // Test 24-hour minimum constraint
      const dateInput = screen.getByLabelText(/appointment date/i);
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      await user.type(dateInput, tomorrowDate.toISOString().split('T')[0]);
      
      const timeSelect = screen.getByLabelText(/appointment time/i);
      await user.click(timeSelect);
      await user.click(screen.getByText('2:00 PM'));
      
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      await user.click(submitButton);
      
      // Should show error for booking within 24 hours
      await waitFor(() => {
        expect(screen.getByText(/minimum 24 hours advance/i)).toBeInTheDocument();
      });
      
      // Test valid booking (48 hours advance)
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 2);
      await user.clear(dateInput);
      await user.type(dateInput, validDate.toISOString().split('T')[0]);
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/appointment request submitted/i)).toBeInTheDocument();
      });

      // Requirement 5: Payment Processing
      rerender(<PaymentPage appointmentId="validation-appointment-1" />);
      
      const cardNumberInput = screen.getByLabelText(/card number/i);
      await user.type(cardNumberInput, '4242424242424242');
      
      const expiryInput = screen.getByLabelText(/expiry/i);
      await user.type(expiryInput, '12/25');
      
      const cvvInput = screen.getByLabelText(/cvv/i);
      await user.type(cvvInput, '123');
      
      const payButton = screen.getByRole('button', { name: /pay now/i });
      await user.click(payButton);
      
      await waitFor(() => {
        expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
      });

      // Requirement 6: Video Consultation
      rerender(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Upcoming Appointments')).toBeInTheDocument();
      });
      
      // Join consultation functionality removed

      // Requirement 7: Medical History Management
      rerender(<MedicalHistoryPage />);
      
      const uploadButton = screen.getByRole('button', { name: /upload document/i });
      await user.click(uploadButton);
      
      const fileInput = screen.getByLabelText(/select file/i);
      const file = new File(['medical report'], 'test-report.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, file);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Validation test medical report');
      
      const uploadSubmitButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadSubmitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/document uploaded successfully/i)).toBeInTheDocument();
      });

      // Requirement 8: Rating and Review System
      rerender(<AppointmentsPage />);
      
      const reviewButton = screen.getByRole('button', { name: /write review/i });
      await user.click(reviewButton);
      
      const ratingStars = screen.getAllByRole('button', { name: /star/i });
      await user.click(ratingStars[4]); // 5-star rating
      
      const commentTextarea = screen.getByLabelText(/comment/i);
      await user.type(commentTextarea, 'Excellent validation test consultation');
      
      const submitReviewButton = screen.getByRole('button', { name: /submit review/i });
      await user.click(submitReviewButton);
      
      await waitFor(() => {
        expect(screen.getByText(/review submitted/i)).toBeInTheDocument();
      });

      // Requirement 9: Notification System
      const notificationBell = screen.getByRole('button', { name: /notifications/i });
      await user.click(notificationBell);
      
      await waitFor(() => {
        expect(screen.getByText(/notifications/i)).toBeInTheDocument();
      });
    });

    it('should validate doctor workflow management', async () => {
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

      // Requirement 4: Doctor Appointment Management
      await waitFor(() => {
        expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      });

      const acceptButton = screen.getByRole('button', { name: /accept/i });
      await user.click(acceptButton);
      
      await waitFor(() => {
        expect(screen.getByText(/appointment accepted/i)).toBeInTheDocument();
      });

      // Test appointment rejection
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

      // Test earnings tracking
      const earningsTab = screen.getByRole('tab', { name: /earnings/i });
      await user.click(earningsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Total Earnings')).toBeInTheDocument();
      });
    });

    it('should validate admin system management', async () => {
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

      // Requirement 10: Admin Management
      await waitFor(() => {
        expect(screen.getByText('System Analytics')).toBeInTheDocument();
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('Total Appointments')).toBeInTheDocument();
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      });

      // Test user management
      const userManagementTab = screen.getByRole('tab', { name: /user management/i });
      await user.click(userManagementTab);
      
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });

      // Test doctor verification
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

      // Test payment monitoring
      const paymentTab = screen.getByRole('tab', { name: /payments/i });
      await user.click(paymentTab);
      
      await waitFor(() => {
        expect(screen.getByText('Payment Transactions')).toBeInTheDocument();
      });
    });
  });

  describe('Security and Error Handling Validation', () => {
    it('should handle authentication and authorization properly', async () => {
      // Test unauthenticated access
      renderWithProviders(<PatientDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/please log in/i)).toBeInTheDocument();
      });

      // Test role-based access control
      const patientStore = configureStore({
        reducer: {
          auth: authReducer,
          appointments: appointmentReducer,
          user: userReducer,
        },
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: mockPatientUser,
            token: 'mock-patient-token',
            loading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={patientStore}>
          <BrowserRouter>
            <ThemeProvider theme={theme}>
              <AdminDashboardPage />
            </ThemeProvider>
          </BrowserRouter>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<DoctorSearchPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('should validate input sanitization', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<AppointmentBooking doctorId="validation-doctor-1" />);
      
      const notesInput = screen.getByLabelText(/notes/i);
      const maliciousInput = '<script>alert("xss")</script>';
      await user.type(notesInput, maliciousInput);
      
      const submitButton = screen.getByRole('button', { name: /book appointment/i });
      await user.click(submitButton);
      
      // XSS content should be sanitized
      expect(screen.queryByText(maliciousInput)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility and Usability Validation', () => {
    it('should be accessible via keyboard navigation', async () => {
      renderWithProviders(<DoctorSearchPage />);
      
      const searchInput = screen.getByLabelText(/search/i);
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);
      
      // Test tab navigation
      fireEvent.keyDown(searchInput, { key: 'Tab' });
      
      const specializationSelect = screen.getByLabelText(/specialization/i);
      expect(document.activeElement).toBe(specializationSelect);
    });

    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(<AdminDashboardPage />);
      
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label');
      
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label');
    });

    it('should support screen readers', () => {
      renderWithProviders(<AppointmentBooking doctorId="validation-doctor-1" />);
      
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});