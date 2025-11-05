import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useToast } from '../components/Toast';
import { reviewStorage } from '../utils/reviewStorage';
import EditReviewModal from '../components/EditReviewModal';

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

interface DoctorInfo {
  id: string;
  name: string;
  specialization: string;
}

// Review Card Component
const ReviewCard: React.FC<{
  review: Review;
  doctor: DoctorInfo;
  onEdit: (review: Review) => void;
  onDelete: (reviewId: string, doctorName: string) => void;
}> = ({ review, doctor, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = review.comment.length > 200;
  const displayComment = shouldTruncate && !isExpanded 
    ? review.comment.substring(0, 200) + '...' 
    : review.comment;

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              fontSize: '18px',
              color: rating >= star ? '#fbbf24' : '#d1d5db'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div
      className="review-card"
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        minHeight: '300px'
      }}
    >
      {/* Doctor Info */}
      <div 
        className="doctor-info"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f3f4f6'
        }}>
        <div style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#0d9488',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: '600',
          flexShrink: 0
        }}>
          {doctor?.name?.charAt(3) || 'D'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 4px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {doctor?.name || 'Doctor'}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {doctor?.specialization || 'General Medicine'}
          </p>
        </div>
        <div className="rating-section" style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ marginBottom: '4px' }}>
            {renderStars(review.rating)}
          </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: 0
          }}>
            {formatDate(review.date)}
          </p>
        </div>
      </div>

      {/* Review Content */}
      <div style={{ 
        flex: 1, 
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <p style={{
          fontSize: '16px',
          color: '#374151',
          lineHeight: '1.6',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto',
          flex: 1
        }}>
          {displayComment}
        </p>
        
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#0d9488',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '8px 0 0 0',
              textAlign: 'left',
              textDecoration: 'underline'
            }}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        paddingTop: '16px',
        borderTop: '1px solid #f3f4f6',
        marginTop: 'auto'
      }}>
        <button
          onClick={() => onEdit(review)}
          style={{
            padding: '8px 16px',
            border: '1px solid #0d9488',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#0d9488',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0fdfa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        
        <button
          onClick={() => onDelete(review.id, doctor?.name || 'Doctor')}
          style={{
            padding: '8px 16px',
            border: '1px solid #dc2626',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

const MyReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<{ [key: string]: DoctorInfo }>({});
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState<any>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('userData');
    if (!userData) {
      navigate('/login');
      return;
    }

    const currentUser = JSON.parse(userData);
    setUser(currentUser);

    // Load user's reviews
    loadUserReviews(currentUser.id || currentUser.email);
  }, [navigate]);

  const loadUserReviews = async (userId: string) => {
    try {
      setLoading(true);
      
      // Get user's reviews
      const userReviews = reviewStorage.getPatientReviews(userId);
      setReviews(userReviews);

      // Load doctor information for each review
      const doctorInfoMap: { [key: string]: DoctorInfo } = {};
      const userStorageData = localStorage.getItem('patientcare_users');
      
      if (userStorageData) {
        const users = JSON.parse(userStorageData);
        
        userReviews.forEach(review => {
          const doctor = users.find((user: any) => 
            user.id === review.doctorId && user.userType === 'doctor'
          );
          
          if (doctor) {
            doctorInfoMap[review.doctorId] = {
              id: doctor.id,
              name: doctor.name,
              specialization: doctor.specialization || 'General Medicine'
            };
          } else {
            // Fallback if doctor not found
            doctorInfoMap[review.doctorId] = {
              id: review.doctorId,
              name: 'Doctor',
              specialization: 'General Medicine'
            };
          }
        });
      }
      
      setDoctorInfo(doctorInfoMap);
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
  };

  const handleSaveReview = (updatedReview: Review) => {
    // Update the reviews list with the updated review
    setReviews(reviews.map(review => 
      review.id === updatedReview.id ? updatedReview : review
    ));
  };

  const handleCloseModal = () => {
    setEditingReview(null);
  };

  const handleDeleteReview = (reviewId: string, doctorName: string) => {
    if (window.confirm(`Are you sure you want to delete your review for ${doctorName}? This action cannot be undone.`)) {
      const success = reviewStorage.deleteReview(reviewId);
      
      if (success) {
        setReviews(reviews.filter(review => review.id !== reviewId));
        showToast('Review deleted successfully', 'success');
        
        // Trigger custom event for real-time updates
        window.dispatchEvent(new CustomEvent('reviewDeleted', {
          detail: { reviewId }
        }));
      } else {
        showToast('Failed to delete review', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Header />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading your reviews...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px'
          }}>
            My Reviews
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Manage your doctor reviews and ratings
          </p>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f3f4f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg width="40" height="40" fill="#9ca3af" viewBox="0 0 24 24">
                <path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z"/>
              </svg>
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '12px'
            }}>
              No Reviews Yet
            </h3>
            
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              You haven't written any reviews yet. After completing appointments with doctors, 
              you can share your experience to help other patients.
            </p>

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
        ) : (
          <div 
            className="reviews-grid"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
              gap: '24px',
              alignItems: 'start'
            }}>
            {reviews.map((review) => {
              const doctor = doctorInfo[review.doctorId];
              
              return (
                <ReviewCard
                  key={review.id}
                  review={review}
                  doctor={doctor}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                />
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      
      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          doctorName={doctorInfo[editingReview.doctorId]?.name || 'Doctor'}
          onClose={handleCloseModal}
          onSave={handleSaveReview}
        />
      )}
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .reviews-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
            
            .review-card {
              padding: 16px !important;
              min-height: 250px !important;
            }
            
            .review-card .doctor-info {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 12px !important;
            }
            
            .review-card .doctor-info .rating-section {
              align-self: flex-end !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MyReviewsPage;