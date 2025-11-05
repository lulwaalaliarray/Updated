import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface LightboxVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  autoPlay?: boolean;
}

const LightboxVideoPlayer: React.FC<LightboxVideoPlayerProps> = ({
  isOpen,
  onClose,
  autoPlay = true
}) => {
  const [showControls, setShowControls] = useState(true);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(60);
  const [currentPage, setCurrentPage] = useState('home');
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Demo captions
  const captions = [
    { time: 0, text: 'Welcome to PatientCare - Bahrain\'s leading healthcare platform' },
    { time: 5, text: 'Browse our homepage to learn about our services' },
    { time: 10, text: 'Click "Find Doctors" to search for healthcare providers' },
    { time: 15, text: 'Search for doctors by specialty, location, or name' },
    { time: 20, text: 'View doctor profiles with ratings and availability' },
    { time: 25, text: 'Click "Book Appointment" to schedule your visit' },
    { time: 30, text: 'Choose your preferred date and time slot' },
    { time: 35, text: 'Receive instant confirmation via SMS and email' },
    { time: 40, text: 'Need help? Visit our Contact Us page' },
    { time: 45, text: 'Get support via phone, email, or live chat' },
    { time: 50, text: 'Our team is available 24/7 to assist you' },
    { time: 55, text: 'Start your healthcare journey with PatientCare today!' }
  ];

  const getCurrentCaption = () => {
    const caption = captions.find((cap, index) => {
      const nextCap = captions[index + 1];
      return currentTime >= cap.time && (!nextCap || currentTime < nextCap.time);
    });
    return caption?.text || '';
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentTime(0);
      setIsPlaying(autoPlay);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, autoPlay]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);  
useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isOpen, showControls]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          
          // Update page based on time
          if (newTime >= 15 && newTime < 40) {
            setCurrentPage('doctors');
          } else if (newTime >= 40 && newTime < 55) {
            setCurrentPage('contact');
          } else {
            setCurrentPage('home');
          }
          
          if (newTime >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isOpen, duration]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;  return (

    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'all 0.3s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90vw',
          height: '80vh',
          maxWidth: '1200px',
          maxHeight: '800px',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          ×
        </button>   
     {/* Browser Simulation */}
        <div
          onClick={handlePlayPause}
          style={{
            width: '85%',
            height: '80%',
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: isPlaying ? 'default' : 'pointer',
            position: 'relative'
          }}
        >
          {/* Browser Chrome */}
          <div style={{
            height: '40px',
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            </div>
            <div style={{
              flex: 1,
              height: '24px',
              backgroundColor: 'white',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              marginLeft: '16px',
              fontSize: '13px',
              color: '#64748b'
            }}>
              🔒 https://patientcare.bh{currentPage === 'doctors' ? '/doctors' : currentPage === 'contact' ? '/contact' : ''}
            </div>
          </div>

          {/* Navigation */}
          <nav style={{
            height: '64px',
            backgroundColor: 'white',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            justifyContent: 'space-between'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              PatientCare
            </div>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              {['Home', 'About', 'Services', 'Doctors', 'Contact'].map((item, index) => {
                const isActive = (item === 'Home' && currentPage === 'home') ||
                               (item === 'Doctors' && currentPage === 'doctors') ||
                               (item === 'Contact' && currentPage === 'contact');
                
                return (
                  <div
                    key={index}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? '#0d9488' : '#475569',
                      backgroundColor: isActive ? '#f0fdfa' : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </nav>          {
/* Page Content */}
          <div style={{
            height: 'calc(100% - 104px)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Home Page */}
            {currentPage === 'home' && (
              <section style={{
                height: '100%',
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center'
              }}>
                <div>
                  <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '900',
                    marginBottom: '24px',
                    textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                    opacity: currentTime > 1 ? 1 : 0,
                    transition: 'all 1s ease'
                  }}>
                    Your Health, Our Priority
                  </h1>
                  <p style={{
                    fontSize: '1.1rem',
                    marginBottom: '32px',
                    opacity: currentTime > 2 ? 0.95 : 0,
                    transition: 'all 1s ease'
                  }}>
                    Connect with qualified healthcare professionals across Bahrain
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    justifyContent: 'center',
                    opacity: currentTime > 3 ? 1 : 0,
                    transition: 'all 1s ease'
                  }}>

                    <button style={{
                      padding: '12px 24px',
                      fontSize: '16px',
                      backgroundColor: 'transparent',
                      color: 'white',
                      border: '2px solid white',
                      borderRadius: '8px',
                      fontWeight: '700',
                      transform: currentTime > 8 && currentTime < 12 ? 'scale(1.05)' : 'scale(1)',
                      transition: 'transform 0.3s ease'
                    }}>
                      Find Doctors
                    </button>
                  </div>
                </div>
              </section>
            )}      
      {/* Doctors Page */}
            {currentPage === 'doctors' && (
              <div style={{
                height: '100%',
                backgroundColor: '#f8fafc',
                padding: '20px',
                overflow: 'auto'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '16px'
                  }}>
                    Find Healthcare Professionals
                  </h2>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <input
                      type="text"
                      placeholder="Search doctors, specialties..."
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        borderColor: currentTime > 16 && currentTime < 20 ? '#0d9488' : '#e2e8f0'
                      }}
                    />
                    <button style={{
                      padding: '10px 20px',
                      backgroundColor: '#0d9488',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Search
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  {[
                    { name: 'Dr. Ahmed Al-Khalifa', specialty: 'Cardiologist', rating: 4.9, fee: '25 BHD' },
                    { name: 'Dr. Fatima Al-Mansouri', specialty: 'Dermatologist', rating: 4.8, fee: '30 BHD' }
                  ].map((doctor, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        transform: currentTime > 20 && currentTime < 25 && index === 0 ? 'scale(1.02)' : 'scale(1)',
                        border: currentTime > 20 && currentTime < 25 && index === 0 ? '2px solid #0d9488' : '2px solid transparent',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1e293b',
                        marginBottom: '4px'
                      }}>
                        {doctor.name}
                      </h3>
                      <p style={{ color: '#0d9488', fontWeight: '600', margin: '0 0 12px 0', fontSize: '12px' }}>
                        {doctor.specialty}
                      </p>
                      <button style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: '#0d9488',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        transform: currentTime > 24 && currentTime < 28 && index === 0 ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.2s ease'
                      }}>
                        Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}         
   {/* Contact Page */}
            {currentPage === 'contact' && (
              <div style={{
                height: '100%',
                backgroundColor: '#f8fafc',
                padding: '20px',
                overflow: 'auto'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <h2 style={{
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '16px'
                  }}>
                    Contact PatientCare
                  </h2>
                  <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    marginBottom: '24px'
                  }}>
                    We're here to help you 24/7. Get in touch with our support team.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '16px'
                  }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f0fdfa',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📞</div>
                      <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1e293b' }}>
                        Phone
                      </h4>
                      <p style={{ fontSize: '10px', color: '#0d9488', fontWeight: '600' }}>
                        +973 1234 5678
                      </p>
                    </div>

                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f0fdfa',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>✉️</div>
                      <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1e293b' }}>
                        Email
                      </h4>
                      <p style={{ fontSize: '10px', color: '#0d9488', fontWeight: '600' }}>
                        support@patientcare.bh
                      </p>
                    </div>

                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f0fdfa',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                      <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1e293b' }}>
                        Live Chat
                      </h4>
                      <p style={{ fontSize: '10px', color: '#0d9488', fontWeight: '600' }}>
                        Available 24/7
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div> 
       {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div
            onClick={handlePlayPause}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 1001
            }}
          >
            <svg width="32" height="32" fill="#0d9488" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        )}

        {/* Caption */}
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)',
            opacity: getCurrentCaption() ? 1 : 0,
            transition: 'all 0.5s ease',
            zIndex: 10000,
            maxWidth: '80%',
            textAlign: 'center'
          }}
        >
          {getCurrentCaption()}
        </div>

        {/* Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
            padding: '20px',
            opacity: showControls ? 1 : 0,
            transition: 'all 0.3s ease',
            zIndex: 10000
          }}
        >
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '3px',
              marginBottom: '16px',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: `${(currentTime / duration) * 100}%`,
                height: '100%',
                backgroundColor: '#0d9488',
                borderRadius: '3px'
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handlePlayPause}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  {isPlaying ? (
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  ) : (
                    <path d="M8 5v14l11-7z"/>
                  )}
                </svg>
              </button>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button
              onClick={() => navigate('/demo-showcase')}
              style={{
                padding: '6px 12px',
                backgroundColor: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              More Demos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightboxVideoPlayer;