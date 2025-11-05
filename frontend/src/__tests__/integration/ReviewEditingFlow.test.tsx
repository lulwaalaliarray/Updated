import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reviewStorage } from '../../utils/reviewStorage';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Review Editing Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
  });

  it('should allow user to create, edit, and delete reviews', () => {
    // Mock initial empty reviews
    mockLocalStorage.getItem.mockReturnValue('[]');

    // 1. Create a new review
    const newReview = {
      id: 'review1',
      doctorId: 'dr-smith',
      patientId: 'patient1',
      patientName: 'John Doe',
      rating: 4,
      comment: 'Good doctor',
      date: '2024-01-15T10:30:00Z',
      verified: true
    };

    const createSuccess = reviewStorage.addReview(newReview);
    expect(createSuccess).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'patientcare_reviews',
      JSON.stringify([newReview])
    );

    // 2. Mock that the review now exists
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify([newReview]));

    // Get patient reviews
    const patientReviews = reviewStorage.getPatientReviews('patient1');
    expect(patientReviews).toHaveLength(1);
    expect(patientReviews[0].comment).toBe('Good doctor');
    expect(patientReviews[0].rating).toBe(4);

    // 3. Update the review
    const updateSuccess = reviewStorage.updateReview('review1', {
      rating: 5,
      comment: 'Excellent doctor! Very professional and caring.'
    });
    expect(updateSuccess).toBe(true);

    // 4. Delete the review
    const deleteSuccess = reviewStorage.deleteReview('review1');
    expect(deleteSuccess).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'patientcare_reviews',
      JSON.stringify([])
    );
  });

  it('should prevent duplicate reviews for same doctor-patient pair', () => {
    const existingReview = {
      id: 'review1',
      doctorId: 'dr-smith',
      patientId: 'patient1',
      patientName: 'John Doe',
      rating: 4,
      comment: 'Good doctor',
      date: '2024-01-15T10:30:00Z',
      verified: true
    };

    // Mock existing review
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify([existingReview]));

    // Try to add another review for same doctor-patient pair
    const duplicateReview = {
      id: 'review2',
      doctorId: 'dr-smith',
      patientId: 'patient1',
      patientName: 'John Doe',
      rating: 5,
      comment: 'Updated review',
      date: '2024-01-16T10:30:00Z',
      verified: true
    };

    const success = reviewStorage.addReview(duplicateReview);
    expect(success).toBe(true);

    // Should update existing review instead of creating duplicate
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'patientcare_reviews',
      JSON.stringify([{
        ...duplicateReview,
        id: 'review1' // Should keep original ID
      }])
    );
  });

  it('should calculate correct average rating for doctor', () => {
    const reviews = [
      {
        id: 'review1',
        doctorId: 'dr-smith',
        patientId: 'patient1',
        patientName: 'John Doe',
        rating: 4,
        comment: 'Good',
        date: '2024-01-15T10:30:00Z',
        verified: true
      },
      {
        id: 'review2',
        doctorId: 'dr-smith',
        patientId: 'patient2',
        patientName: 'Jane Doe',
        rating: 5,
        comment: 'Excellent',
        date: '2024-01-16T10:30:00Z',
        verified: true
      },
      {
        id: 'review3',
        doctorId: 'dr-smith',
        patientId: 'patient3',
        patientName: 'Bob Smith',
        rating: 3,
        comment: 'Average',
        date: '2024-01-17T10:30:00Z',
        verified: true
      }
    ];

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(reviews));

    const averageRating = reviewStorage.getDoctorAverageRating('dr-smith');
    expect(averageRating).toBe(4); // (4 + 5 + 3) / 3 = 4
  });

  it('should return correct rating distribution', () => {
    const reviews = [
      { id: '1', doctorId: 'dr-smith', patientId: 'p1', patientName: 'P1', rating: 5, comment: 'Great', date: '2024-01-15T10:30:00Z', verified: true },
      { id: '2', doctorId: 'dr-smith', patientId: 'p2', patientName: 'P2', rating: 5, comment: 'Great', date: '2024-01-15T10:30:00Z', verified: true },
      { id: '3', doctorId: 'dr-smith', patientId: 'p3', patientName: 'P3', rating: 4, comment: 'Good', date: '2024-01-15T10:30:00Z', verified: true },
      { id: '4', doctorId: 'dr-smith', patientId: 'p4', patientName: 'P4', rating: 3, comment: 'OK', date: '2024-01-15T10:30:00Z', verified: true },
    ];

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(reviews));

    const distribution = reviewStorage.getDoctorRatingDistribution('dr-smith');
    expect(distribution).toEqual({
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 2
    });
  });
});