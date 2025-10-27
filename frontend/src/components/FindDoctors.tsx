import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes, isLoggedIn } from '../utils/navigation';
import { useToast } from './Toast';
import { userStorage, User } from '../utils/userStorage';
import Header from './Header';
import Footer from './Footer';
import DoctorCard from './DoctorCard';

const FindDoctors: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication status and load doctors
  useEffect(() => {
    setUserLoggedIn(isLoggedIn());
    loadDoctors();
  }, []);

  const loadDoctors = () => {
    try {
      const allUsers = userStorage.getAllUsers();
      const registeredDoctors = allUsers.filter(user => 
        user.userType === 'doctor' && 
        user.status === 'active' && 
        user.specialization
      );
      setDoctors(registeredDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      showToast('Error loading doctors', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get unique specialties from registered doctors
  const getSpecialties = () => {
    const uniqueSpecialties = [...new Set(doctors.map(doctor => doctor.specialization).filter(Boolean))];
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
      location: 'Manama'
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
      location: 'Manama'
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
      location: 'Muharraq'
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
      location: 'Riffa'
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
      location: 'Isa Town'
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
      location: 'Manama'
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
      location: 'Adliya'
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
      location: 'Sitra'
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
      location: 'Hamad Town'
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
      location: 'Budaiya'
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (doctor.qualifications && doctor.qualifications.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialty = !selectedSpecialty || selectedSpecialty === 'All Specialties' || 
                            doctor.specialization === selectedSpecialty;
    // For now, we'll skip location filtering since we don't have location data for doctors
    return matchesSearch && matchesSpecialty;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'experience':
        // Extract years from experience string (e.g., "5 years" -> 5)
        const aExp = parseInt(a.experience?.match(/\d+/)?.[0] || '0');
        const bExp = parseInt(b.experience?.match(/\d+/)?.[0] || '0');
        return bExp - aExp;
      case 'fee-low':
        return (a.consultationFee || 0) - (b.consultationFee || 0);
      case 'fee-high':
        return (b.consultationFee || 0) - (a.consultationFee || 0);
      default:
        return 0;
    }
  });

  const handleBookAppointment = (doctorId: string) => {
    if (!userLoggedIn) {
      showToast('Please sign in to book an appointment', 'info');
      navigate(routes.login);
      return;
    }
    console.log('Booking appointment with doctor:', doctorId);
    showToast('Appointment booking feature coming soon!', 'info');
  };

  const handleViewProfile = (doctorId: string) => {
    navigate(`/doctor/${doctorId}`);
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            <div>
              <p style={{ fontSize: '18px', color: '#6b7280' }}>
                Found <span style={{ fontWeight: '600', color: '#111827' }}>{sortedDoctors.length}</span> doctors
                {selectedSpecialty && selectedSpecialty !== 'All Specialties' && (
                  <span> in <span style={{ fontWeight: '600', color: '#0d9488' }}>{selectedSpecialty}</span></span>
                )}
                {selectedLocation && selectedLocation !== 'All Locations' && (
                  <span> in <span style={{ fontWeight: '600', color: '#2563eb' }}>{selectedLocation}</span></span>
                )}
              </p>

            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Near Me
              </button>
            </div>
          </div>

          {/* Doctor Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth >= 1024 ? 'repeat(3, 1fr)' : window.innerWidth >= 768 ? 'repeat(2, 1fr)' : '1fr',
            gap: '24px'
          }}>
            {sortedDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBookAppointment={handleBookAppointment}
                onViewProfile={handleViewProfile}
                isUserLoggedIn={userLoggedIn}
              />
            ))}
          </div>

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
    </div>
  );
};

export default FindDoctors;