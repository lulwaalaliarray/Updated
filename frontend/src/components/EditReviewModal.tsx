import React, { useState } from 'react';
import { useToast } from './Toast';
import { reviewStorage } from '../utils/reviewStorage';

interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface EditReviewModalProps {
  review: Review;
  doctorName: string;
  onClose: () => void;
  onSave: (updatedReview: Review) => void;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({
  review,
  doctorName,
  onClose,
  onSave
}) => {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    if (comment.trim().length < 10) {
      showToast('Please provide a more detailed review (at least 10 characters)', 'error');
      return;
    }

    if (comment.length > 500) {
      showToast('Review must not exceed 500 characters', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedReview = {
        ...review,
        rating,
        comment: comment.trim(),
        date: new Date().toISOString() // Update the date to show it was modified
      };

      const success = reviewStorage.updateReview(review.id, {
        rating,
        comment: comment.trim(),
        date: updatedReview.date
      });
      
      if (success) {
        // Trigger custom event for real-time updates
        window.dispatchEvent(new CustomEvent('reviewUpdated', {
          detail: { reviewId: review.id, updatedReview }
        }));
        
        showToast('Review updated successfully!', 'success');
        onSave(updatedReview);
        onClose();
      } else {
        showToast('Failed to update review. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      showToast('An error occurred while updating your review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '28px',
              color: (hoverRating || rating) >= star ? '#fbbf24' : '#d1d5db',
              transition: 'color 0.2s'
            }}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Edit Your Review
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Update your review for {doctorName}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating Section */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Rating *
            </label>
            {renderStars()}
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              {rating === 0 && 'Please select a rating'}
              {rating === 1 && 'Poor - Very unsatisfied'}
              {rating === 2 && 'Fair - Somewhat unsatisfied'}
              {rating === 3 && 'Good - Neutral experience'}
              {rating === 4 && 'Very Good - Satisfied'}
              {rating === 5 && 'Excellent - Highly satisfied'}
            </p>
          </div>

          {/* Comment Section */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setComment(value);
                }
              }}
              placeholder="Please share your experience with this doctor..."
              rows={6}
              maxLength={500}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${comment.length > 500 ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = comment.length > 500 ? '#dc2626' : '#0d9488';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = comment.length > 500 ? '#dc2626' : '#d1d5db';
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                Minimum 10 characters required
              </p>
              <p style={{
                fontSize: '14px',
                color: comment.length > 500 ? '#dc2626' : comment.length > 450 ? '#f59e0b' : '#6b7280',
                margin: 0,
                fontWeight: comment.length > 450 ? '600' : '400'
              }}>
                {comment.length}/500 characters
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || comment.trim().length < 10 || comment.length > 500}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isSubmitting || rating === 0 || comment.trim().length < 10 || comment.length > 500 ? '#9ca3af' : '#0d9488',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isSubmitting || rating === 0 || comment.trim().length < 10 || comment.length > 500 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && rating > 0 && comment.trim().length >= 10 && comment.length <= 500) {
                  e.currentTarget.style.backgroundColor = '#0f766e';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && rating > 0 && comment.trim().length >= 10 && comment.length <= 500) {
                  e.currentTarget.style.backgroundColor = '#0d9488';
                }
              }}
            >
              {isSubmitting && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              )}
              {isSubmitting ? 'Updating...' : 'Update Review'}
            </button>
          </div>
        </form>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EditReviewModal;