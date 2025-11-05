import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ToastProvider } from '../../components/Toast';
import MyReviewsPage from '../../pages/MyReviewsPage';
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

// Mock the review storage
vi.mock('../../utils/reviewStorage', () => ({
  reviewStorage: {
    getPatientReviews: vi.fn(),
    deleteReview: vi.fn(),
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

describe('MyReviewsPage', () => {
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

  it('renders page title correctly', () => {
    (reviewStorage.getPatientReviews as any).mockReturnValue([]);
    
    renderWithProviders(<MyReviewsPage />);
    
    expect(screen.getByText('My Reviews')).toBeInTheDocument();
    expect(screen.getByText('Manage your doctor reviews and ratings')).toBeInTheDocument();
  });

  it('renders empty state when user has no reviews', async () => {
    (reviewStorage.getPatientReviews as any).mockReturnValue([]);
    
    renderWithProviders(<MyReviewsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No Reviews Yet')).toBeInTheDocument();
      expect(screen.getByText(/You haven't written any reviews yet/)).toBeInTheDocument();
    });
  });

  it('renders user reviews when they exist', async () => {
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
    
    (reviewStorage.getPatientReviews as any).mockReturnValue(mockReviews);
    
    renderWithProviders(<MyReviewsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Cardiology')).toBeInTheDocument();
      expect(screen.getByText('Excellent doctor!')).toBeInTheDocument();
    });
  });

  it('allows user to edit a review', async () => {
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
    
    (reviewStorage.getPatientReviews as any).mockReturnValue(mockReviews);
    
    renderWithProviders(<MyReviewsPage />);
    
    await waitFor(() => {
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
      
      // Should open the edit modal instead of navigating
      expect(screen.getByText('Edit Your Review')).toBeInTheDocument();
    });
  });

  it('allows user to delete a review', async () => {
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
    
    (reviewStorage.getPatientReviews as any).mockReturnValue(mockReviews);
    (reviewStorage.deleteReview as any).mockReturnValue(true);
    
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
    
    renderWithProviders(<MyReviewsPage />);
    
    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      
      expect(reviewStorage.deleteReview).toHaveBeenCalledWith('review1');
    });
  });

  it('redirects to login if user is not authenticated', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    renderWithProviders(<MyReviewsPage />);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});