import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ToastProvider } from '../../components/Toast';
import MyAppointmentsPage from '../../pages/MyAppointmentsPage';
import { appointmentStorage } from '../../utils/appointmentStorage';
import { reviewStorage } from '../../utils/reviewStorage';

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the storage modules
vi.mock('../../utils/appointmentStorage', () => ({
  appointmentStorage: {
    getPatientAppointments: vi.fn(),
  },
}));

vi.mock('../../utils/reviewStorage', () => ({
  reviewStorage: {
    getPatientReviews: vi.fn(),
    updateReview: vi.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        {component}
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('MyAppointmentsPage - Review Editing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'userData') {
        return JSON.stringify({
          id: 'patient1',
          name: 'John Doe',
          email: 'john@example.com',
          userType: 'patient'
        });
      }
      if (key === 'patientcare_users') {
        return JSON.stringify([
          {
            id: 'dr-smith',
            name: 'Dr. Smith',
            userType: 'doctor',
            specialization: 'Cardiology'
          }
        ]);
      }
      return null;
    });
  });

  it('shows "Write Review" button for completed appointments without reviews', async () => {
    const mockAppointments = [
      {
        id: 'apt1',
        doctorId: 'dr-smith',
        patientId: 'patient1',
        date: '2024-01-15',
        time: '10:00',
        status: 'completed',
        doctorName: 'Dr. Smith',
        type: 'consultation'
      }
    ];

    (appointmentStorage.getPatientAppointments as any).mockReturnValue(mockAppointments);
    (reviewStorage.getPatientReviews as any).mockReturnValue([]);

    renderWithProviders(<MyAppointmentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Write Review')).toBeInTheDocument();
    });
  });

  it('shows "Edit Review" button for completed appointments with existing reviews', async () => {
    const mockAppointments = [
      {
        id: 'apt1',
        doctorId: 'dr-smith',
        patientId: 'patient1',
        date: '2024-01-15',
        time: '10:00',
        status: 'completed',
        doctorName: 'Dr. Smith',
        type: 'consultation'
      }
    ];

    const mockReviews = [
      {
        id: 'review1',
        doctorId: 'dr-smith',
        patientId: 'patient1',
        patientName: 'John Doe',
        rating: 5,
        comment: 'Excellent doctor!',
        date: '2024-01-15T10:30:00Z',
        verified: true
      }
    ];

    (appointmentStorage.getPatientAppointments as any).mockReturnValue(mockAppointments);
    (reviewStorage.getPatientReviews as any).mockReturnValue(mockReviews);

    renderWithProviders(<MyAppointmentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Edit Review')).toBeInTheDocument();
    });
  });

  it('opens edit modal when "Edit Review" button is clicked', async () => {
    const mockAppointments = [
      {
        id: 'apt1',
        doctorId: 'dr-smith',
        patientId: 'patient1',
        date: '2024-01-15',
        time: '10:00',
        status: 'completed',
        doctorName: 'Dr. Smith',
        type: 'consultation'
      }
    ];

    const mockReviews = [
      {
        id: 'review1',
        doctorId: 'dr-smith',
        patientId: 'patient1',
        patientName: 'John Doe',
        rating: 5,
        comment: 'Excellent doctor!',
        date: '2024-01-15T10:30:00Z',
        verified: true
      }
    ];

    (appointmentStorage.getPatientAppointments as any).mockReturnValue(mockAppointments);
    (reviewStorage.getPatientReviews as any).mockReturnValue(mockReviews);

    renderWithProviders(<MyAppointmentsPage />);

    await waitFor(() => {
      const editButton = screen.getByText('Edit Review');
      fireEvent.click(editButton);
      
      expect(screen.getByText('Edit Your Review')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Excellent doctor!')).toBeInTheDocument();
    });
  });

  it('navigates to review page when "Write Review" button is clicked', async () => {
    const mockAppointments = [
      {
        id: 'apt1',
        doctorId: 'dr-smith',
        patientId: 'patient1',
        date: '2024-01-15',
        time: '10:00',
        status: 'completed',
        doctorName: 'Dr. Smith',
        type: 'consultation'
      }
    ];

    (appointmentStorage.getPatientAppointments as any).mockReturnValue(mockAppointments);
    (reviewStorage.getPatientReviews as any).mockReturnValue([]);

    renderWithProviders(<MyAppointmentsPage />);

    await waitFor(() => {
      const writeButton = screen.getByText('Write Review');
      fireEvent.click(writeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/leave-review/dr-smith');
    });
  });

  it('switches to completed tab and shows appointments', async () => {
    const mockAppointments = [
      {
        id: 'apt1',
        doctorId: 'dr-smith',
        patientId: 'patient1',
        date: '2024-01-15',
        time: '10:00',
        status: 'completed',
        doctorName: 'Dr. Smith',
        type: 'consultation'
      }
    ];

    (appointmentStorage.getPatientAppointments as any).mockReturnValue(mockAppointments);
    (reviewStorage.getPatientReviews as any).mockReturnValue([]);

    renderWithProviders(<MyAppointmentsPage />);

    // Click on completed tab
    const completedTab = screen.getByText('Completed');
    fireEvent.click(completedTab);

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Write Review')).toBeInTheDocument();
    });
  });
});