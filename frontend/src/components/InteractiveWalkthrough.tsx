import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const InteractiveWalkthrough: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();

  const walkthroughSteps = [
    {
      id: 'welcome',
      title: 'Welcome to PatientCare! 👋',
      description: 'Your comprehensive healthcare platform for Bahrain',
      content: 'Hi there! I\'m your PatientCare guide. Let me show you how easy it is to manage your healthcare with our platform.',
      action: 'Continue',
      highlight: null,
      duration: 3000
    },
    {
      id: 'search-doctors',
      title: 'Finding the Right Doctor 👨‍⚕️',
      description: 'Search by specialty, location, and ratings',
      content: 'First, let\'s find a doctor. You can search by specialty like Cardiology or Dermatology, filter by location in Bahrain, and check patient ratings.',
      action: 'Search Doctors',
      highlight: 'search-section',
      duration: 4000
    },
    {
      id: 'book-appointment',
      title: 'Booking Your Appointment 📅',
      description: 'Select time slots and confirm booking',
      content: 'Once you find your doctor, simply click on their profile, choose an available time slot, and book your appointment instantly.',
      action: 'Book Appointment',
      highlight: 'booking-section',
      duration: 4000
    },
    {
      id: 'view-appointments',
      title: 'Managing Your Appointments 📋',
      description: 'View upcoming and past appointments',
      content: 'In your dashboard, you can see all upcoming appointments, reschedule if needed, and review your appointment history.',
      action: 'View Appointments',
      highlight: 'appointments-section',
      duration: 4000
    },
    {
      id: 'prescriptions',
      title: 'Digital Prescriptions 💊',
      description: 'Access and manage your prescriptions',
      content: 'After your appointment, doctors can send digital prescriptions directly to your account. View, download, and track all your medications.',
      action: 'View Prescriptions',
      highlight: 'prescriptions-section',
      duration: 4000
    },
    {
      id: 'doctor-features',
      title: 'For Healthcare Providers 🩺',
      description: 'Manage availability and write prescriptions',
      content: 'Doctors can easily manage their availability, approve appointments, write digital prescriptions, and track patient interactions.',
      action: 'Admin Dashboard',
      highlight: 'doctor-section',
      duration: 4000
    },
    {
      id: 'security',
      title: 'Your Data is Secure 🔒',
      description: 'NHRA approved and MOH certified',
      content: 'PatientCare is fully compliant with Bahrain\'s healthcare regulations, ensuring your medical data is always protected.',
      action: 'Learn More',
      highlight: 'security-section',
      duration: 3000
    }
  ];

  const currentStepData = walkthroughSteps[currentStep];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < walkthroughSteps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, currentStepData.duration);
    } else if (isPlaying && currentStep === walkthroughSteps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, currentStepData.duration]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (currentStep === walkthroughSteps.length - 1) {
      setCurrentStep(0);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
  };

  const handleActionClick = () => {
    switch (currentStepData.id) {
      case 'search-doctors':
        navigate('/doctors');
        break;
      case 'book-appointment':
        navigate('/doctors');
        break;
      case 'view-appointments':
        navigate('/appointments');
        break;
      case 'prescriptions':
        navigate('/prescriptions');
        break;
      case 'doctor-features':
        navigate('/manage-availability');
        break;
      case 'security':
        navigate('/security');
        break;
      default:
        handleNext();
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Video Player Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px 16px 0 0',
          padding: '24px 32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}>
              PatientCare Platform Walkthrough 🎥
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                padding: '4px 12px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Interactive Demo
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((currentStep + 1) / walkthroughSteps.length) * 100}%`,
              height: '100%',
              backgroundColor: '#0d9488',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Main Video Content */}
        <div style={{
          backgroundColor: 'white',
          padding: '48px 32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Character Guide */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#0d9488',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              flexShrink: 0,
              animation: isPlaying ? 'bounce 2s infinite' : 'none'
            }}>
              👩‍⚕️
            </div>
            <div style={{
              backgroundColor: '#f0fdfa',
              borderRadius: '16px',
              padding: '20px 24px',
              border: '2px solid #0d9488',
              position: 'relative',
              flex: 1
            }}>
              <div style={{
                position: 'absolute',
                left: '-10px',
                top: '20px',
                width: 0,
                height: 0,
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderRight: '10px solid #0d9488'
              }}></div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#0d9488',
                margin: '0 0 8px 0'
              }}>
                {currentStepData.title}
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 12px 0'
              }}>
                {currentStepData.description}
              </p>
              <p style={{
                fontSize: '18px',
                color: '#111827',
                margin: 0,
                lineHeight: '1.6'
              }}>
                {currentStepData.content}
              </p>
            </div>
          </div>

          {/* Demo Interface Mockup */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '32px',
            border: '2px dashed #d1d5db',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              {currentStepData.id === 'search-doctors' && '🔍'}
              {currentStepData.id === 'book-appointment' && '📅'}
              {currentStepData.id === 'view-appointments' && '📋'}
              {currentStepData.id === 'prescriptions' && '💊'}
              {currentStepData.id === 'doctor-features' && '🩺'}
              {currentStepData.id === 'security' && '🔒'}
              {currentStepData.id === 'welcome' && '🏥'}
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Interactive Demo Area
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              This area would show the actual interface being demonstrated
            </p>
            <button
              onClick={handleActionClick}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0f766e';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0d9488';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {currentStepData.action}
            </button>
          </div>
        </div>

        {/* Video Controls */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0 0 16px 16px',
          padding: '24px 32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            {/* Playback Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentStep === 0 ? '#f3f4f6' : '#0d9488',
                  color: currentStep === 0 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ⏮ Previous
              </button>
              
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentStep === walkthroughSteps.length - 1}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentStep === walkthroughSteps.length - 1 ? '#f3f4f6' : '#0d9488',
                  color: currentStep === walkthroughSteps.length - 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentStep === walkthroughSteps.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Next ⏭
              </button>
            </div>

            {/* Step Counter */}
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Step {currentStep + 1} of {walkthroughSteps.length}
            </div>
          </div>

          {/* Step Navigation */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {walkthroughSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: index === currentStep ? '#0d9488' : '#f3f4f6',
                  color: index === currentStep ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (index !== currentStep) {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentStep) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                {step.title.split(' ')[0]} {step.title.split(' ')[step.title.split(' ').length - 1]}
              </button>
            ))}
          </div>
        </div>

        {/* Video Production Notes */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '32px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#92400e',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🎬 Video Production Guide
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', margin: '0 0 8px 0' }}>
                Screen Recording Tips:
              </h4>
              <ul style={{ fontSize: '12px', color: '#78350f', margin: 0, paddingLeft: '16px' }}>
                <li>Record each step separately for easier editing</li>
                <li>Use cursor highlighting and click animations</li>
                <li>Show loading states and transitions</li>
                <li>Capture both desktop and mobile views</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', margin: '0 0 8px 0' }}>
                Voice Narration:
              </h4>
              <ul style={{ fontSize: '12px', color: '#78350f', margin: 0, paddingLeft: '16px' }}>
                <li>Friendly, professional tone</li>
                <li>Clear pronunciation for medical terms</li>
                <li>Pause between major sections</li>
                <li>Include Arabic pronunciation guide</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', margin: '0 0 8px 0' }}>
                Visual Elements:
              </h4>
              <ul style={{ fontSize: '12px', color: '#78350f', margin: 0, paddingLeft: '16px' }}>
                <li>Animated character guide (healthcare professional)</li>
                <li>Highlight clickable areas with glowing borders</li>
                <li>Use smooth zoom and pan transitions</li>
                <li>Add captions in English and Arabic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* CSS Animations */}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default InteractiveWalkthrough;