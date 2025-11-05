import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ToastProvider } from '../../components/Toast';
import EditReviewModal from '../../components/EditReviewModal';
import { reviewStorage } from '../../utils/reviewStorage';

// Mock the review storage
vi.mock('../../utils/reviewStorage', () => ({
  reviewStorage: {
    updateReview: vi.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ToastProvider>
      {component}
    </ToastProvider>
  );
};

const mockReview = {
  id: 'review1',
  doctorId: 'dr-smith',
  patientId: 'patient1',
  patientName: 'John Doe',
  rating: 4,
  comment: 'Good doctor, very professional.',
  date: '2024-01-15T10:30:00Z',
  verified: true
};

describe('EditReviewModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with existing review data', () => {
    renderWithProviders(
      <EditReviewModal
        review={mockReview}
        doctorName="Dr. Smith"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Edit Your Review')).toBeInTheDocument();
    expect(screen.getByText('Update your review for Dr. Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Good doctor, very professional.')).toBeInTheDocument();
  });

  it('allows user to change rating', async () => {
    renderWithProviders(
      <EditReviewModal
        review={mockReview}
        doctorName="Dr. Smith"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Find all star buttons and click the 5th one (5-star rating)
    const starButtons = screen.getAllByText('★');
    fireEvent.click(starButtons[4]); // 5th star (index 4)

    // The rating should be updated (we can't directly test state, but we can test the visual feedback)
    expect(starButtons[4]).toHaveStyle({ color: '#fbbf24' });
  });

  it('allows user to edit comment', async () => {
    renderWithProviders(
      <EditReviewModal
        review={mockReview}
        doctorName="Dr. Smith"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const textarea = screen.getByDisplayValue('Good doctor, very professional.');
    
    // Clear and type new text
    fireEvent.change(textarea, { target: { value: 'Excellent doctor! Highly recommend.' } });
    
    expect(screen.getByDisplayValue('Excellent doctor! Highly recommend.')).toBeInTheDocument();
  });

  it('validates minimum comment length', async () => {
    renderWithProviders(
      <EditReviewModal
        review={mockReview}
        doctorName="Dr. Smith"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const textarea = screen.getByDisplayValue('Good doctor, very professional.');
    const submitButton = screen.getByText('Update Review');
    
    // Set comment to be too short
    fireEvent.change(textarea, { target: { value: 'Short' } });
    
    // Submit button should be disabled
    expect(submitButton).toBeDisabled();
  });

  it('validates maximum comment length', async () => {
    renderWithProviders(
      <EditReviewModal
        review={mockReview}
        doctorName="Dr. Smith"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const textarea = screen.getByDisplayValue('Good doctor, very professional.');
    
    // Set comment to be too long (over 500 characters)
    const longComment = 'A'.repeat(501);
    fireEvent.change(textarea, { target: { value: longComment } });
    
    // Should be truncated to 500 characters
    expect(textarea.value.length).toBeLessThanOrEqual(500);
  });

  it('calls onClose when cancel button is clicked', () => {
    renderWithProviders(
      <EditReviewModal
        review={mockReview}
        doctorName="Dr. Smith"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits updated review successfully', async () => {
    (reviewStorage.updateReview as any).mockReturnValue(true);

    renderWithProviders(
      <EditReviewModal
        review={mockReview}
        doctorName="Dr. Smith"
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Change the comment
    const textarea = screen.getByDisplayValue('Good doctor, very professional.');
    fireEvent.change(textarea, { target: { value: 'Updated review: Excellent doctor!' } });

    // Submit the form
    const submitButton = screen.getByText('Update Review');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(reviewStorage.updateReview).toHaveBeenCalledWith('review1', expect.objectContaining({
        comment: 'Updated review: Excellent doctor!',
        rating: 4
      }));
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});