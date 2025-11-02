import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useToast } from './Toast';
import { reviewStorage } from '../utils/reviewStorage';
import { appointmentStorage } from '../utils/appointmentStorage';

const LeaveReview: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasCompletedAppointment, setHasCompletedAppointment] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(true);

  useEffect(() => {
    // Load doctor information
    const userData = localStorage.getItem('userData');
    if (!userData) {
      showToast('Please log in to leave a review', 'error');
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    const userId = user.id || user.email;

    // Check if user has completed appointments with this doctor
    const allAppointments = appointmentStorage.getAllAppointments();
    const completedAppointments = allAppointments.filter(
      appointment => 
        (appointment.patientId === userId || appointment.patientEmail === user.email) &&
        appointment.doctorId === doctorId &&
        appointment.status === 'completed'
    );

    if (completedAppointments.length === 0) {
      setHasCompletedAppointment(false);
      setIsCheckingEligibility(false);
      return;
    }

    setHasCompletedAppointment(true);

    // Check if user has already reviewed this doctor
    const allReviews = reviewStorage.getAllReviews();
    const userExistingReview = allReviews.find(
      review => review.doctorId === doctorId && review.patientId === userId
    );

    if (userExistingReview) {
      setExistingReview(userExistingReview);
      setRating(userExistingReview.rating);
      setComment(userExistingReview.comment);
      setIsUpdating(true);
    }

    // Load doctor information from user storage
    try {
      const userStorageData = localStorage.getItem('patientcare_users');
      if (userStorageData) {
        const users = JSON.parse(userStorageData);
        const doctor = users.find((user: any) => user.id === doctorId && user.userType === 'doctor');
        
        if (doctor) {
          setDoctorInfo({
            id: doctorId,
            name: doctor.name,
            specialization: doctor.specialization || 'General Medicine',
            avatar: doctor.profilePicture || null
          });
        } else {
          // Fallback if doctor not found
          setDoctorInfo({
            id: doctorId,
            name: 'Doctor',
            specialization: 'General Medicine',
            avatar: null
          });
        }
      }
    } catch (error) {
      console.error('Error loading doctor info:', error);
      // Fallback doctor info
      setDoctorInfo({
        id: doctorId,
        name: 'Doctor',
        specialization: 'General Medicine',
        avatar: null
      });
    }

    setIsCheckingEligibility(false);
  }, [doctorId, navigate, showToast]);

  const handleSubmitReview = async (e: React.FormEvent) => {
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
      const userData = localStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;

      const review = {
        id: Date.now().toString(),
        doctorId: doctorId!,
        patientId: user?.id || user?.email || 'anonymous',
        patientName: user?.name || 'Anonymous Patient',
        rating,
        comment: comment.trim(),
        date: new Date().toISOString(),
        verified: true // In a real app, this would be based on actual appointments
      };

      const success = reviewStorage.addReview(review);
      
      if (success) {
        // Trigger custom event for real-time updates
        window.dispatchEvent(new CustomEvent('reviewAdded', {
          detail: { doctorId, review }
        }));
        
        showToast(isUpdating ? 'Review updated successfully!' : 'Review submitted successfully!', 'success');
        navigate(`/reviews/${doctorId}`);
      } else {
        showToast('Failed to submit review. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('An error occurred while submitting your review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (interactive: boolean = false) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: interactive ? 'pointer' : 'default',
              padding: '4px',
              fontSize: '24px',
              color: (interactive ? (hoverRating || rating) : rating) >= star ? '#fbbf24' : '#d1d5db',
              transition: 'color 0.2s'
            }}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // Loading state
  if (isCheckingEligibility) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #0d9488',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Checking eligibility...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not eligible to review
  if (!hasCompletedAppointment) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header />
        
        {/* Back Button */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 20px 0' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg width="40" height="40" fill="#f59e0b" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Complete an Appointment First
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              You can only leave a review after completing an appointment with this doctor. 
              Book and complete an appointment to share your experience.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate(`/reviews/${doctorId}`)}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                View Reviews
              </button>
              
              <button
                onClick={() => navigate('/doctors')}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f766e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0d9488';
                }}
              >
                Find Doctors
              </button>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      
      {/* Back Button */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 20px 0' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#111827',
              marginBottom: '8px'
            }}>
              {isUpdating ? 'Update Your Review' : 'Leave a Review'}
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280'
            }}>
              {isUpdating 
                ? 'Update your previous review to reflect your latest experience'
                : 'Share your experience to help other patients'
              }
            </p>
            {isUpdating && (
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" fill="#2563eb" viewBox="0 0 24 24">
                    <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                  <span style={{
                    fontSize: '14px',
                    color: '#1e40af',
                    fontWeight: '500'
                  }}>
                    You previously reviewed this doctor on {new Date(existingReview?.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {doctorInfo && (
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#0d9488',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                {doctorInfo.name.charAt(3)} {/* Skip "Dr. " */}
              </div>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 4px 0'
                }}>
                  {doctorInfo.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {doctorInfo.specialization}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitReview}>
            {/* Rating Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Overall Rating *
              </label>
              <div style={{ marginBottom: '8px' }}>
                {renderStars(true)}
              </div>
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
            <div style={{ marginBottom: '32px' }}>
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
                placeholder="Please share your experience with this doctor. What did you like? What could be improved?"
                rows={6}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${comment.length > 500 ? '#dc2626' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
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
                margin: '8px 0 0 0'
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
              {comment.length > 500 && (
                <p style={{
                  fontSize: '12px',
                  color: '#dc2626',
                  margin: '4px 0 0 0',
                  fontWeight: '500'
                }}>
                  ⚠️ Review exceeds maximum length. Please shorten your feedback.
                </p>
              )}
            </div>

            {/* Guidelines */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e40af',
                margin: '0 0 8px 0'
              }}>
                Review Guidelines
              </h4>
              <ul style={{
                fontSize: '14px',
                color: '#1e40af',
                margin: 0,
                paddingLeft: '20px'
              }}>
                <li>Be honest and constructive in your feedback</li>
                <li>Focus on your personal experience</li>
                <li>Avoid sharing personal medical information</li>
                <li>Keep your review respectful and professional</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
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
                {isSubmitting 
                  ? (isUpdating ? 'Updating...' : 'Submitting...') 
                  : (isUpdating ? 'Update Review' : 'Submit Review')
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
      
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

export default LeaveReview;