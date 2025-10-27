import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackToTopButton from '../components/BackToTopButton';
import { useToast } from '../components/Toast';
import { userStorage, User } from '../utils/userStorage';
import { isLoggedIn } from '../utils/navigation';
import BookingModal from '../components/Booking/BookingModal';

const DoctorProfilePage: React.FC = () => {
    const { doctorId } = useParams<{ doctorId: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [doctor, setDoctor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(false);

    useEffect(() => {
        setUserLoggedIn(isLoggedIn());
        loadDoctorProfile();
    }, [doctorId]);

    const loadDoctorProfile = () => {
        if (!doctorId) {
            showToast('Doctor not found', 'error');
            navigate('/find-doctors');
            return;
        }

        try {
            const allUsers = userStorage.getAllUsers();
            const foundDoctor = allUsers.find(user =>
                user.id === doctorId &&
                user.userType === 'doctor' &&
                user.status === 'active'
            );

            if (!foundDoctor) {
                showToast('Doctor not found', 'error');
                navigate('/find-doctors');
                return;
            }

            setDoctor(foundDoctor);
        } catch (error) {
            console.error('Error loading doctor profile:', error);
            showToast('Error loading doctor profile', 'error');
            navigate('/find-doctors');
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = () => {
        if (!userLoggedIn) {
            showToast('Please sign in to book an appointment', 'info');
            navigate('/login');
            return;
        }
        setShowBookingModal(true);
    };

    const handleBookingSuccess = () => {
        setShowBookingModal(false);
        showToast('Appointment booked successfully!', 'success');
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <svg
                key={index}
                className={`w-5 h-5 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ width: '20px', height: '20px' }}
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
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
                    <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading doctor profile...</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!doctor) {
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Header />

            {/* Doctor Profile Content */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '40px 20px'
            }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate('/find-doctors')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#6b7280',
                        cursor: 'pointer',
                        marginBottom: '24px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Find Doctors
                </button>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 400px' : '1fr',
                    gap: '32px'
                }}>
                    {/* Main Profile Content */}
                    <div>
                        {/* Doctor Header Card */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            marginBottom: '24px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '24px' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        backgroundColor: '#f3f4f6'
                                    }}>
                                        {doctor.profilePicture ? (
                                            <img
                                                src={doctor.profilePicture}
                                                alt={doctor.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: '#ecfdf5',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <span style={{
                                                    color: '#0d9488',
                                                    fontWeight: '600',
                                                    fontSize: '36px'
                                                }}>
                                                    {doctor.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Verification Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '8px',
                                        right: '8px',
                                        width: '32px',
                                        height: '32px',
                                        backgroundColor: '#10b981',
                                        borderRadius: '50%',
                                        border: '3px solid white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <svg width="16" height="16" fill="white" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h1 style={{
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#111827',
                                        marginBottom: '8px'
                                    }}>
                                        {doctor.name}
                                    </h1>
                                    <p style={{
                                        fontSize: '18px',
                                        color: '#0d9488',
                                        fontWeight: '600',
                                        marginBottom: '8px'
                                    }}>
                                        {doctor.specialization}
                                    </p>
                                    <p style={{
                                        fontSize: '16px',
                                        color: '#6b7280',
                                        marginBottom: '12px'
                                    }}>
                                        {doctor.qualifications}
                                    </p>
                                    {doctor.hospital && (
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#9ca3af',
                                            marginBottom: '12px'
                                        }}>
                                            📍 {doctor.hospital}
                                        </p>
                                    )}

                                    {/* Rating */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {renderStars(doctor.rating || 4.8)}
                                        </div>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#374151'
                                        }}>
                                            {(doctor.rating || 4.8).toFixed(1)}
                                        </span>
                                        <span style={{
                                            fontSize: '14px',
                                            color: '#6b7280'
                                        }}>
                                            ({doctor.totalReviews || 127} reviews)
                                        </span>
                                    </div>

                                    {/* Quick Stats */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '24px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                color: '#111827'
                                            }}>
                                                {doctor.experience || '10+ years'}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Experience
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                color: '#111827'
                                            }}>
                                                {doctor.consultationFee || 25} BHD
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                Consultation Fee
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                color: '#10b981'
                                            }}>
                                                ✓
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                NHRA Licensed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            marginBottom: '24px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '16px'
                            }}>
                                About Dr. {doctor.name.split(' ').pop()}
                            </h2>
                            <p style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                lineHeight: '1.6',
                                marginBottom: '24px'
                            }}>
                                {doctor.bio || `Dr. ${doctor.name} is a highly experienced ${doctor.specialization} specialist with ${doctor.experience || '10+ years'} of experience in providing quality healthcare services. Committed to delivering personalized care and staying updated with the latest medical advancements.`}
                            </p>

                            {/* Languages */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    marginBottom: '12px'
                                }}>
                                    Languages Spoken
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {(doctor.languages || ['Arabic', 'English']).map((language, index) => (
                                        <span
                                            key={index}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#f3f4f6',
                                                color: '#374151',
                                                borderRadius: '16px',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {language}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Specializations */}
                            {doctor.specializations && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#111827',
                                        marginBottom: '12px'
                                    }}>
                                        Specializations
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {doctor.specializations.map((spec, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#ecfdf5',
                                                    color: '#065f46',
                                                    borderRadius: '16px',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            marginBottom: '24px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '16px'
                            }}>
                                Contact Information
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(2, 1fr)' : '1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#ecfdf5',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <svg width="20" height="20" fill="none" stroke="#0d9488" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Phone</div>
                                        <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                                            {doctor.phone || '+973 1234 5678'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#ecfdf5',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <svg width="20" height="20" fill="none" stroke="#0d9488" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Email</div>
                                        <div style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>
                                            {doctor.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Book Appointment Card */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '24px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            position: 'sticky',
                            top: '24px'
                        }}>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '16px'
                            }}>
                                Book Appointment
                            </h3>

                            <div style={{
                                padding: '16px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Consultation Fee</span>
                                    <span style={{
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        color: '#111827'
                                    }}>
                                        {doctor.consultationFee || 25} BHD
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Duration</span>
                                    <span style={{ fontSize: '14px', color: '#374151' }}>30 minutes</span>
                                </div>
                            </div>

                            {!userLoggedIn && (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#fef3c7',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    border: '1px solid #f59e0b'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="16" height="16" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span style={{
                                            fontSize: '14px',
                                            color: '#92400e',
                                            fontWeight: '500'
                                        }}>
                                            Sign in required to book
                                        </span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleBookAppointment}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: userLoggedIn
                                        ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)'
                                        : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (userLoggedIn) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(13, 148, 136, 0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (userLoggedIn) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {userLoggedIn ? 'Book Appointment' : 'Sign In to Book'}
                            </button>
                        </div>

                        {/* Clinic Information */}
                        {doctor.hospital && (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    marginBottom: '16px'
                                }}>
                                    Clinic Information
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#ecfdf5',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <svg width="20" height="20" fill="none" stroke="#0d9488" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            color: '#111827',
                                            marginBottom: '4px'
                                        }}>
                                            {doctor.hospital}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            lineHeight: '1.5'
                                        }}>
                                            {doctor.clinicAddress || 'Manama, Kingdom of Bahrain'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && doctor && (
                <BookingModal
                    doctor={doctor}
                    onClose={() => setShowBookingModal(false)}
                    onSuccess={handleBookingSuccess}
                />
            )}

            <Footer />
            <BackToTopButton />
        </div>
    );
};

export default DoctorProfilePage;