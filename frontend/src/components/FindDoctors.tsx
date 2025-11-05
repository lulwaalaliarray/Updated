import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes, isLoggedIn } from '../utils/navigation';
import { useToast } from './Toast';
import { userStorage, User } from '../utils/userStorage';
import Header from './Header';
import Footer from './Footer';
import DoctorCard from './DoctorCard';

import { reviewStorage } from '../utils/reviewStorage';
import { inputValidation } from '../utils/inputValidation';
import BookingModal from './Booking/BookingModal';

// Create a unified doctor type for both registered and mock doctors
type UnifiedDoctor = User & {
  specialty?: string;
  experience?: number | string;
  rating?: number;
  reviewCount?: number;
  fee?: number;
  isOnline?: boolean;
  nextAvailable?: string;
  languages?: string[];
  education?: string;
  hospital?: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
};

// Doctor Details Modal Component
interface DoctorDetailsModalProps {
  doctor: UnifiedDoctor;
  onClose: () => void;
  onBookAppointment: (doctorId: string) => void;
  isUserLoggedIn: boolean;
}

const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({ 
  doctor, 
  onClose, 
  onBookAppointment, 
  isUserLoggedIn 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  
  // Get doctor reviews
  const doctorReviews = reviewStorage.getDoctorReviews(doctor.id);
  const averageRating = doctorReviews.length > 0 
    ? doctorReviews.reduce((sum, review) => sum + review.rating, 0) / doctorReviews.length 
    : 0; // Show 0 rating when no reviews exist

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        width="20"
        height="20"
        fill={index < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
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
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                color: '#0d9488',
                fontWeight: '600',
                fontSize: '24px'
              }}>
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '4px'
              }}>
                {doctor.name}
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#0d9488',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                {doctor.specialization || doctor.specialty}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {renderStars(averageRating)}
                </div>
                <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                  {averageRating.toFixed(1)}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  ({doctorReviews.length} reviews)
                </span>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {doctor.hospital} • {doctor.location}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '16px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'overview' ? '2px solid #0d9488' : '2px solid transparent',
              color: activeTab === 'overview' ? '#0d9488' : '#6b7280',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              padding: '16px 24px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'reviews' ? '2px solid #0d9488' : '2px solid transparent',
              color: activeTab === 'reviews' ? '#0d9488' : '#6b7280',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Reviews ({doctorReviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'overview' && (
            <div>
              {/* Experience and Fee */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Experience</h4>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    {doctor.experience || '10+ years'}
                  </p>
                </div>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Consultation Fee</h4>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    {doctor.consultationFee || doctor.fee || 25} BHD
                  </p>
                </div>
              </div>

              {/* Qualifications */}
              {doctor.qualifications && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    Qualifications
                  </h4>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                    {doctor.qualifications}
                  </p>
                </div>
              )}

              {/* Languages */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Languages
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(doctor.languages || ['Arabic', 'English']).map((language, index) => (
                    <span
                      key={index}
                      style={{
                        fontSize: '12px',
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        border: '1px solid #a7f3d0'
                      }}
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  Contact Information
                </h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#374151' }}>
                    <strong>Hospital:</strong> {doctor.hospital}
                  </p>
                  <p style={{ fontSize: '14px', color: '#374151' }}>
                    <strong>Location:</strong> {doctor.location}
                  </p>
                  {doctor.address && (
                    <p style={{ fontSize: '14px', color: '#374151' }}>
                      <strong>Address:</strong> {doctor.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {doctorReviews.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {doctorReviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            {review.patientName}
                          </p>
                          <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#374151', 
                        lineHeight: '1.6',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        margin: 0
                      }}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ fontSize: '16px', color: '#6b7280' }}>
                    No reviews yet. Be the first to leave a review!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Doctors
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {isUserLoggedIn && (
              <button
                onClick={() => {
                  onBookAppointment(doctor.id);
                  onClose();
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M3 7h18l-2 13H5L3 7z" />
                </svg>
                Book Appointment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FindDoctors: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [doctors, setDoctors] = useState<User[]>([]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<UnifiedDoctor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState<UnifiedDoctor | null>(null);
  
  const DOCTORS_PER_PAGE = 15;

  // Check authentication status and load doctors
  useEffect(() => {
    setUserLoggedIn(isLoggedIn());
    loadDoctors();

    // Listen for new doctor registrations
    const handleDoctorRegistration = () => {
      loadDoctors(); // Reload doctors when a new one registers
    };

    // Listen for user registration events
    window.addEventListener('userRegistered', handleDoctorRegistration);
    window.addEventListener('doctorRegistered', handleDoctorRegistration);
    window.addEventListener('doctorVerified', handleDoctorRegistration);
    window.addEventListener('userStatusUpdated', handleDoctorRegistration);

    return () => {
      window.removeEventListener('userRegistered', handleDoctorRegistration);
      window.removeEventListener('doctorRegistered', handleDoctorRegistration);
      window.removeEventListener('doctorVerified', handleDoctorRegistration);
      window.removeEventListener('userStatusUpdated', handleDoctorRegistration);
    };
  }, []);



  const loadDoctors = () => {
    try {
      // Get all verified doctors from user storage
      // This includes all doctors who have registered and been verified
      // New doctors will automatically appear here when they sign up
      const registeredDoctors = userStorage.getAllDoctors();
      setDoctors(registeredDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      showToast('Error loading doctors', 'error');
    }
  };

  // Get unique specialties from registered doctors
  const getSpecialties = () => {
    const allSpecialties = new Set<string>();
    
    doctors.forEach(doctor => {
      // Add single specialization if it exists
      if (doctor.specialization) {
        allSpecialties.add(doctor.specialization);
      }
      
      // Add multiple specializations if they exist
      if (doctor.specializations && Array.isArray(doctor.specializations)) {
        doctor.specializations.forEach(spec => {
          if (spec) allSpecialties.add(spec);
        });
      }
    });
    
    const uniqueSpecialties = Array.from(allSpecialties).filter(Boolean);
    return ['All Specialties', ...uniqueSpecialties.sort()];
  };

  const specialties = getSpecialties();

  const locations = [
    'All Locations',
    'Manama',
    'Muharraq',
    'Riffa',
    'Hamad Town',
    'A\'ali',
    'Isa Town',
    'Sitra',
    'Budaiya',
    'Jidhafs',
    'Tubli',
    'Sanabis',
    'Adliya'
  ];

  // Enhanced mock doctors with location coordinates
  const mockDoctors = [
    {
      id: '1',
      name: 'Dr. Ahmed Al-Khalifa',
      specialty: 'Cardiology',
      experience: 15,
      rating: 4.9,
      reviewCount: 127,
      fee: 25, // BHD
      avatar: '',
      isOnline: true,
      nextAvailable: 'Today 2:30 PM',
      languages: ['Arabic', 'English'],
      education: 'MD, King Faisal University',
      hospital: 'Bahrain Specialist Hospital',
      location: 'Manama',
      coordinates: { lat: 26.2285, lng: 50.5860 }, // Manama coordinates
      address: 'Building 2345, Road 2832, Block 428, Manama'
    },
    {
      id: '2',
      name: 'Dr. Fatima Al-Mansouri',
      specialty: 'Dermatology',
      experience: 12,
      rating: 4.8,
      reviewCount: 89,
      fee: 20, // BHD
      avatar: '',
      isOnline: false,
      nextAvailable: 'Tomorrow 10:00 AM',
      languages: ['Arabic', 'English'],
      education: 'MD, Arabian Gulf University',
      hospital: 'Salmaniya Medical Complex',
      location: 'Manama',
      coordinates: { lat: 26.2361, lng: 50.5831 },
      address: 'Salmaniya Medical Complex, Road 2904, Manama'
    },
    {
      id: '3',
      name: 'Dr. Omar Al-Zayani',
      specialty: 'Pediatrics',
      experience: 10,
      rating: 4.9,
      reviewCount: 156,
      fee: 18, // BHD
      avatar: '',
      isOnline: true,
      nextAvailable: 'Today 4:00 PM',
      languages: ['Arabic', 'English'],
      education: 'MD, University of Bahrain',
      hospital: 'King Hamad University Hospital',
      location: 'Muharraq',
      coordinates: { lat: 26.2720, lng: 50.6197 },
      address: 'King Hamad University Hospital, Busaiteen, Muharraq'
    },
    {
      id: '4',
      name: 'Dr. Maryam Al-Doseri',
      specialty: 'Neurology',
      experience: 18,
      rating: 4.7,
      reviewCount: 203,
      fee: 30, // BHD
      avatar: '',
      isOnline: false,
      nextAvailable: 'Monday 9:00 AM',
      languages: ['Arabic', 'English'],
      education: 'MD, PhD, Johns Hopkins (USA)',
      hospital: 'Royal Bahrain Hospital',
      location: 'Riffa',
      coordinates: { lat: 26.1300, lng: 50.5550 },
      address: 'Royal Bahrain Hospital, Road 5515, East Riffa'
    },
    {
      id: '5',
      name: 'Dr. Khalid Al-Thawadi',
      specialty: 'General Medicine',
      experience: 8,
      rating: 4.8,
      reviewCount: 94,
      fee: 15, // BHD
      avatar: '',
      isOnline: true,
      nextAvailable: 'Today 1:00 PM',
      languages: ['Arabic', 'English'],
      education: 'MD, Arabian Gulf University',
      hospital: 'Ibn Al-Nafees Hospital',
      location: 'Isa Town',
      coordinates: { lat: 26.1736, lng: 50.5500 },
      address: 'Ibn Al-Nafees Hospital, Road 4626, Isa Town'
    },
    {
      id: '6',
      name: 'Dr. Layla Al-Qassemi',
      specialty: 'Orthopedics',
      experience: 14,
      rating: 4.6,
      reviewCount: 78,
      fee: 28, // BHD
      avatar: '',
      isOnline: false,
      nextAvailable: 'Wednesday 11:30 AM',
      languages: ['Arabic', 'English'],
      education: 'MD, University of London',
      hospital: 'American Mission Hospital',
      location: 'Manama',
      coordinates: { lat: 26.2172, lng: 50.5822 },
      address: 'American Mission Hospital, Road 2423, Manama'
    },
    {
      id: '7',
      name: 'Dr. Hassan Al-Mahmood',
      specialty: 'Gastroenterology',
      experience: 16,
      rating: 4.8,
      reviewCount: 142,
      fee: 27, // BHD
      avatar: '',
      isOnline: true,
      nextAvailable: 'Today 3:15 PM',
      languages: ['Arabic', 'English'],
      education: 'MD, University of Edinburgh',
      hospital: 'Gulf Diagnostic Centre',
      location: 'Adliya',
      coordinates: { lat: 26.2125, lng: 50.5775 },
      address: 'Gulf Diagnostic Centre, Road 3802, Adliya'
    },
    {
      id: '8',
      name: 'Dr. Noor Al-Sabah',
      specialty: 'Gynecology',
      experience: 11,
      rating: 4.9,
      reviewCount: 198,
      fee: 22, // BHD
      avatar: '',
      isOnline: false,
      nextAvailable: 'Tomorrow 2:00 PM',
      languages: ['Arabic', 'English'],
      education: 'MD, American University of Beirut',
      hospital: 'Noor Specialist Hospital',
      location: 'Sitra',
      coordinates: { lat: 26.1500, lng: 50.6167 },
      address: 'Noor Specialist Hospital, Road 4411, Sitra'
    },
    {
      id: '9',
      name: 'Dr. Yusuf Al-Ansari',
      specialty: 'Ophthalmology',
      experience: 13,
      rating: 4.7,
      reviewCount: 167,
      fee: 24, // BHD
      avatar: '',
      isOnline: true,
      nextAvailable: 'Today 5:30 PM',
      languages: ['Arabic', 'English'],
      education: 'MD, Cairo University',
      hospital: 'Eye Care Centre Bahrain',
      location: 'Hamad Town',
      coordinates: { lat: 26.1167, lng: 50.4833 },
      address: 'Eye Care Centre, Road 5124, Hamad Town'
    },
    {
      id: '10',
      name: 'Dr. Amina Al-Fadhel',
      specialty: 'Endocrinology',
      experience: 9,
      rating: 4.8,
      reviewCount: 113,
      fee: 26, // BHD
      avatar: '',
      isOnline: false,
      nextAvailable: 'Thursday 10:30 AM',
      languages: ['Arabic', 'English'],
      education: 'MD, King Saud University',
      hospital: 'Diabetes & Endocrine Centre',
      location: 'Budaiya',
      coordinates: { lat: 26.2167, lng: 50.4500 },
      address: 'Diabetes & Endocrine Centre, Road 4215, Budaiya'
    }
  ];



  // Combine registered doctors with mock doctors
  const allDoctors: UnifiedDoctor[] = [
    ...doctors.map(doctor => ({
      ...doctor,
      specialty: doctor.specialization,
      fee: doctor.consultationFee
    })),
    ...mockDoctors.map(mockDoctor => ({
      ...mockDoctor,
      // Add required User fields for mock doctors
      email: `${mockDoctor.id}@patientcare.bh`,
      password: 'password123',
      userType: 'doctor' as const,
      cpr: `99${mockDoctor.id.padStart(7, '0')}`,
      status: 'verified' as const,
      createdAt: new Date().toISOString(),
      specialization: mockDoctor.specialty,
      consultationFee: mockDoctor.fee,
      experience: mockDoctor.experience.toString() // Convert number to string
    }))
  ];

  const filteredDoctors = allDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doctor.specialty && doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (doctor.hospital && doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (doctor.qualifications && doctor.qualifications.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = !selectedSpecialty || selectedSpecialty === 'All Specialties' || 
                            doctor.specialization === selectedSpecialty ||
                            doctor.specialty === selectedSpecialty ||
                            (doctor.specializations && doctor.specializations.includes(selectedSpecialty));
    
    const matchesLocation = !selectedLocation || selectedLocation === 'All Locations' || 
                           doctor.location === selectedLocation;
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        // Get ratings from reviews if available, otherwise use default rating
        const aReviews = reviewStorage.getDoctorReviews(a.id);
        const bReviews = reviewStorage.getDoctorReviews(b.id);
        
        // Calculate actual rating from reviews or use default rating
        const aRating = aReviews.length > 0 
          ? aReviews.reduce((sum, review) => sum + review.rating, 0) / aReviews.length 
          : (a.rating || 0);
        const bRating = bReviews.length > 0 
          ? bReviews.reduce((sum, review) => sum + review.rating, 0) / bReviews.length 
          : (b.rating || 0);
        
        // Debug logging to see what ratings are being calculated
        if (process.env.NODE_ENV === 'development') {
          console.log(`Doctor ${a.name}: rating=${aRating}, reviews=${aReviews.length}, defaultRating=${a.rating}`);
          console.log(`Doctor ${b.name}: rating=${bRating}, reviews=${bReviews.length}, defaultRating=${b.rating}`);
        }
        
        // Sort by rating (highest first), then by review count as tiebreaker
        if (Math.abs(bRating - aRating) > 0.01) { // Use small epsilon for floating point comparison
          return bRating - aRating;
        }
        // If ratings are equal, prioritize doctors with more reviews
        return bReviews.length - aReviews.length;
      case 'experience':
        // Extract years from experience string (e.g., "5 years" -> 5) or use direct number
        const aExp = typeof a.experience === 'number' ? a.experience : parseInt(a.experience?.match(/\d+/)?.[0] || '0');
        const bExp = typeof b.experience === 'number' ? b.experience : parseInt(b.experience?.match(/\d+/)?.[0] || '0');
        return bExp - aExp;
      case 'fee-low':
        return (a.consultationFee || a.fee || 0) - (b.consultationFee || b.fee || 0);
      case 'fee-high':
        return (b.consultationFee || b.fee || 0) - (a.consultationFee || a.fee || 0);

      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedDoctors.length / DOCTORS_PER_PAGE);
  const startIndex = (currentPage - 1) * DOCTORS_PER_PAGE;
  const endIndex = startIndex + DOCTORS_PER_PAGE;
  const paginatedDoctors = sortedDoctors.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpecialty, selectedLocation, sortBy]);

  const handleBookAppointment = (doctorId: string) => {
    if (!userLoggedIn) {
      showToast('Please sign in to book an appointment', 'info');
      navigate(routes.login);
      return;
    }
    
    // Find the doctor to get their name
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setShowBookingModal(true);
    }
  };

  const handleViewProfile = (doctorId: string) => {
    const doctor = allDoctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctorDetails(doctor);
      setShowDoctorDetails(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />
      
      {/* Hero Section */}
      <section style={{
        backgroundColor: '#f8fafc',
        padding: '60px 20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Login Status Notice */}
          {!userLoggedIn && (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '12px',
              padding: '16px 24px',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <svg width="20" height="20" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
                  Browse doctors or sign in for full access
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                You can view doctor profiles and locations. Sign in to see availability and book appointments.
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '16px'
            }}>
              🇧🇭 Licensed Healthcare Providers
            </span>
            <h1 style={{
              fontSize: window.innerWidth >= 768 ? '48px' : '36px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px',
              lineHeight: '1.2'
            }}>
              Find Doctors in{' '}
              <span style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Bahrain
              </span>
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              {userLoggedIn 
                ? 'Connect with NHRA-licensed healthcare professionals across the Kingdom. Book appointments with trusted doctors in your area.'
                : 'Browse NHRA-licensed healthcare professionals across the Kingdom. Sign in to book appointments and access full features.'
              }
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'grid',
            gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(5, 1fr)' : '1fr',
            gap: '16px'
          }}>
            <div style={{ gridColumn: window.innerWidth >= 768 ? 'span 2' : 'span 1' }}>
              <div style={{ position: 'relative' }}>
                <svg style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#9ca3af'
                }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search doctors, specialties, hospitals..."
                  value={searchTerm}
                  onChange={(e) => inputValidation.handleTextInput(e, setSearchTerm, 'text')}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="" disabled>Filter</option>
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee-low">Lowest Fee</option>
                <option value="fee-high">Highest Fee</option>

              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ fontSize: '18px', color: '#6b7280', margin: 0 }}>
                Found <span style={{ fontWeight: '600', color: '#111827' }}>{sortedDoctors.length}</span> doctors
                {selectedSpecialty && selectedSpecialty !== 'All Specialties' && (
                  <span> in <span style={{ fontWeight: '600', color: '#0d9488' }}>{selectedSpecialty}</span></span>
                )}
                {selectedLocation && selectedLocation !== 'All Locations' && (
                  <span> in <span style={{ fontWeight: '600', color: '#2563eb' }}>{selectedLocation}</span></span>
                )}
              </p>

            </div>
            

          </div>

          {/* Doctor Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {paginatedDoctors.map((doctor) => {
              return (
                <div key={doctor.id} style={{ height: '100%' }}>
                  <DoctorCard
                    doctor={doctor as any} // Type assertion to handle the unified type
                    onBookAppointment={handleBookAppointment}
                    onViewProfile={handleViewProfile}
                    isUserLoggedIn={userLoggedIn}
                  />
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px'
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === 1 ? '#f3f4f6' : '#0d9488',
                  color: currentPage === 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: currentPage === page ? '#0d9488' : 'white',
                      color: currentPage === page ? 'white' : '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      minWidth: '40px'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#0d9488',
                  color: currentPage === totalPages ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Next
              </button>
            </div>
          )}

          {/* Pagination Info */}
          {sortedDoctors.length > 0 && (
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Showing {startIndex + 1}-{Math.min(endIndex, sortedDoctors.length)} of {sortedDoctors.length} doctors
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </div>
          )}

          {/* Empty State */}
          {sortedDoctors.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
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
                <svg width="40" height="40" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                No doctors found
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '24px'
              }}>
                Try adjusting your search criteria or filters to find more doctors.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('');
                  setSelectedLocation('');
                }}
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
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0d9488';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
      
      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedDoctor(null);
          }}
          onSuccess={() => {
            setShowBookingModal(false);
            setSelectedDoctor(null);
          }}
        />
      )}

      {/* Doctor Details Modal */}
      {showDoctorDetails && selectedDoctorDetails && (
        <DoctorDetailsModal
          doctor={selectedDoctorDetails}
          onClose={() => {
            setShowDoctorDetails(false);
            setSelectedDoctorDetails(null);
          }}
          onBookAppointment={handleBookAppointment}
          isUserLoggedIn={userLoggedIn}
        />
      )}
    </div>
  );
};

export default FindDoctors;