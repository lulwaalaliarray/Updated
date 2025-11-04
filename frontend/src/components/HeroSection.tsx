import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleNavigation, routes } from '../utils/navigation';
import { useToast } from './Toast';
import LightboxVideoPlayer from './LightboxVideoPlayer';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onWatchDemo?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onWatchDemo }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showLightboxVideo, setShowLightboxVideo] = useState(false);

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      handleNavigation(navigate, routes.signup, false, showToast);
    }
  };

  const handleWatchDemo = () => {
    if (onWatchDemo) {
      onWatchDemo();
    } else {
      setShowLightboxVideo(true);
    }
  };
  return (
    <section style={{
      backgroundColor: '#f8fafc',
      padding: '80px 20px',
      minHeight: '600px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr',
          gap: '60px',
          alignItems: 'center'
        }}>
          {/* Left Content */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span style={{
                display: 'inline-block',
                padding: '6px 16px',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '24px'
              }}>
                🇧🇭 Trusted by patients across Bahrain
              </span>
              
              <h1 style={{
                fontSize: window.innerWidth >= 768 ? '56px' : '40px',
                fontWeight: '800',
                lineHeight: '1.1',
                color: '#111827',
                marginBottom: '24px'
              }}>
                Your Health,{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Simplified
                </span>
              </h1>
              
              <p style={{
                fontSize: '20px',
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '32px',
                maxWidth: '500px'
              }}>
                Connect with Bahrain's top healthcare professionals, book appointments at leading hospitals, and manage your health records with the Kingdom's most trusted medical platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth >= 640 ? 'row' : 'column',
              gap: '16px',
              marginBottom: '48px'
            }}>
              <button
                onClick={handleGetStarted}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(13, 148, 136, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(13, 148, 136, 0.3)';
                }}
              >
                Get Started Free
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <button
                onClick={handleWatchDemo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '24px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" fill="#10b981" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                NHRA Approved
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" fill="#10b981" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                MOH Certified
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" fill="#10b981" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Arabic & English
              </div>
            </div>
          </div>

          {/* Right Content - Live Slideshow */}
          <LiveSlideshow />
        </div>
      </div>

      {/* Lightbox Video Player */}
      <LightboxVideoPlayer 
        isOpen={showLightboxVideo}
        onClose={() => setShowLightboxVideo(false)}
        autoPlay={true}
      />
      
      <style>
        {`
          @keyframes slideIn {
            from { 
              opacity: 0; 
              transform: translateY(20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          
          @keyframes progress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </section>
  );
};

// Live Slideshow Component (always visible)
const LiveSlideshow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      title: "Find Doctors",
      description: "Search NHRA-licensed specialists by location and specialty",
      image: "👨‍⚕️",
      color: "#0d9488"
    },
    {
      title: "Book Appointments",
      description: "Real-time scheduling with instant confirmation",
      image: "📅",
      color: "#10b981"
    },
    {
      title: "Telemedicine",
      description: "Secure video consultations from anywhere",
      image: "💬",
      color: "#3b82f6"
    },
    {
      title: "Health Records",
      description: "Complete medical history at your fingertips",
      image: "📋",
      color: "#8b5cf6"
    }
  ];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const currentSlideData = slides[currentSlide];

  return (
    <div style={{
      width: '100%',
      maxWidth: '500px',
      height: '400px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Slideshow Content */}
      <div style={{
        width: '100%',
        height: '320px',
        background: `linear-gradient(135deg, ${currentSlideData.color} 0%, ${currentSlideData.color}dd 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        transition: 'all 0.5s ease'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          pointerEvents: 'none'
        }}></div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
          <div style={{
            fontSize: '60px',
            marginBottom: '16px',
            animation: 'slideIn 0.5s ease-out'
          }}>
            {currentSlideData.image}
          </div>
          
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '12px',
            animation: 'slideIn 0.5s ease-out 0.1s both'
          }}>
            {currentSlideData.title}
          </h3>
          
          <p style={{
            fontSize: '16px',
            opacity: 0.9,
            lineHeight: '1.4',
            maxWidth: '300px',
            animation: 'slideIn 0.5s ease-out 0.2s both'
          }}>
            {currentSlideData.description}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        height: '80px',
        padding: '16px 20px',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Slide Indicators */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: index === currentSlide ? currentSlideData.color : '#d1d5db',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            />
          ))}
        </div>

        {/* Auto-play Toggle */}
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          style={{
            padding: '6px 12px',
            border: `1px solid ${currentSlideData.color}`,
            borderRadius: '6px',
            backgroundColor: isAutoPlaying ? currentSlideData.color : 'white',
            color: isAutoPlaying ? 'white' : currentSlideData.color,
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          {isAutoPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: currentSlideData.color,
            animation: 'progress 3s linear infinite',
            transformOrigin: 'left'
          }}></div>
        </div>
      )}
    </div>
  );
};



export default HeroSection;