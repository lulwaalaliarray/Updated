import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
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

const ReviewDisplay: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    loadReviews();
    loadDoctorInfo();
  }, [doctorId]);

  const loadReviews = () => {
    try {
      const doctorReviews = reviewStorage.getDoctorReviews(doctorId || '');
      setReviews(doctorReviews);
      setLoading(false);
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast('Error loading reviews', 'error');
      setLoading(false);
    }
  };

  const loadDoctorInfo = () => {
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
            avatar: doctor.profilePicture || null,
            experience: doctor.experience || '5+ years',
            location: doctor.location || 'Manama, Bahrain'
          });
        } else {
          // Fallback if doctor not found
          setDoctorInfo({
            id: doctorId,
            name: 'Doctor',
            specialization: 'General Medicine',
            avatar: null,
            experience: '5+ years',
            location: 'Manama, Bahrain'
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
        avatar: null,
        experience: '5+ years',
        location: 'Manama, Bahrain'
      });
    }
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getAverageRatingString = () => {
    return getAverageRating().toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const sortedAndFilteredReviews = reviews
    .filter(review => filterRating === 'all' || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const renderStars = (rating: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = {
      small: '14px',
      medium: '18px',
      large: '24px'
    };

    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              fontSize: sizes[size],
              color: rating >= star ? '#fbbf24' : '#d1d5db'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px'
      }}>
        <span style={{ fontSize: '14px', color: '#374151', minWidth: '20px' }}>
          {rating}★
        </span>
        <div style={{
          flex: 1,
          height: '8px',
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: '#fbbf24',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '30px' }}>
          {count}
        </span>
      </div>
    );
  };

  if (loading) {
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
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading reviews...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const distribution = getRatingDistribution();
  const averageRating = getAverageRating();
  const averageRatingString = getAverageRatingString();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />

      {/* Back Button */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 0' }}>
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Doctor Info Header */}
        {doctorInfo && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#0d9488',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                fontWeight: '600'
              }}>
                {doctorInfo.name.charAt(3)} {/* Skip "Dr. " */}
              </div>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 8px 0'
                }}>
                  {doctorInfo.name}
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '0 0 4px 0'
                }}>
                  {doctorInfo.specialization} • {doctorInfo.experience}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  📍 {doctorInfo.location}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {renderStars(averageRating, 'large')}
                  <span style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#111827'
                  }}>
                    {averageRatingString}
                  </span>
                </div>
                <span style={{
                  fontSize: '16px',
                  color: '#6b7280'
                }}>
                  ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>

              <button
                onClick={() => navigate(`/leave-review/${doctorId}`)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
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
                Write a Review
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Rating Summary */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            height: 'fit-content'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Rating Breakdown
            </h3>

            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating}>
                {renderRatingBar(rating, distribution[rating as keyof typeof distribution], reviews.length)}
              </div>
            ))}
          </div>

          {/* Reviews List */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                Patient Reviews
              </h3>

              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Ratings</option>
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            {sortedAndFilteredReviews.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 16px' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  No reviews found
                </h4>
                <p>No reviews match your current filter criteria.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {sortedAndFilteredReviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px'
                        }}>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#111827'
                          }}>
                            {review.patientName}
                          </span>
                          {review.verified && (
                            <span style={{
                              fontSize: '12px',
                              color: '#059669',
                              backgroundColor: '#dcfce7',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              ✓ Verified Patient
                            </span>
                          )}
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <span style={{
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '16px',
                      color: '#374151',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default ReviewDisplay;