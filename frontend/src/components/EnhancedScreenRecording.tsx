import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface EnhancedScreenRecordingProps {
  onComplete?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
}

const EnhancedScreenRecording: React.FC<EnhancedScreenRecordingProps> = ({ 
  onComplete, 
  autoPlay = true,
  showControls = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentPage, setCurrentPage] = useState('home');
  const [scrollY, setScrollY] = useState(0);
  const [showTooltip, setShowTooltip] = useState('');
  const [typingText, setTypingText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clickEffect, setClickEffect] = useState({ show: false, x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(0);
  const navigate = useNavigate();

  // Enhanced recording steps with realistic timing
  const recordingSteps = [
    {
      id: 'homepage-load',
      duration: 3000,
      page: 'home',
      title: 'PatientCare Homepage',
      description: 'Loading the main PatientCare website',
      actions: [
        { time: 0, action: 'loadPage', params: { page: 'home' } },
        { time: 500, action: 'moveMouse', params: { x: 50, y: 30 } }
      ]
    },
    {
      id: 'explore-hero',
      duration: 2500,
      page: 'home',
      title: 'Hero Section',
      description: 'Exploring the main banner and call-to-action',
      actions: [
        { time: 0, action: 'scroll', params: { y: 200 } },
        { time: 1000, action: 'moveMouse', params: { x: 50, y: 65 } },
        { time: 1500, action: 'hover', params: { element: 'cta-button' } }
      ]
    },
    {
      id: 'view-features',
      duration: 3000,
      page: 'home',
      title: 'Platform Features',
      description: 'Viewing key platform features and benefits',
      actions: [
        { time: 0, action: 'scroll', params: { y: 600 } },
        { time: 800, action: 'moveMouse', params: { x: 30, y: 70 } },
        { time: 1500, action: 'moveMouse', params: { x: 50, y: 70 } },
        { time: 2200, action: 'moveMouse', params: { x: 70, y: 70 } }
      ]
    },
    {
      id: 'navigate-doctors',
      duration: 2000,
      page: 'home',
      title: 'Navigation',
      description: 'Navigating to Find Doctors page',
      actions: [
        { time: 0, action: 'moveMouse', params: { x: 45, y: 12 } },
        { time: 500, action: 'showTooltip', params: { text: 'Find Doctors' } },
        { time: 1200, action: 'click', params: { x: 45, y: 12 } },
        { time: 1500, action: 'changePage', params: { page: 'doctors' } }
      ]
    },
    {
      id: 'doctors-page',
      duration: 2500,
      page: 'doctors',
      title: 'Find Doctors',
      description: 'Exploring the doctor search interface',
      actions: [
        { time: 0, action: 'loadPage', params: { page: 'doctors' } },
        { time: 800, action: 'moveMouse', params: { x: 50, y: 25 } }
      ]
    },
    {
      id: 'search-doctors',
      duration: 3500,
      page: 'doctors',
      title: 'Search Functionality',
      description: 'Using the search to find specialists',
      actions: [
        { time: 0, action: 'moveMouse', params: { x: 50, y: 25 } },
        { time: 500, action: 'click', params: { x: 50, y: 25 } },
        { time: 800, action: 'type', params: { text: 'Cardiology' } },
        { time: 2500, action: 'moveMouse', params: { x: 75, y: 25 } },
        { time: 3000, action: 'click', params: { x: 75, y: 25 } }
      ]
    },
    {
      id: 'browse-doctors',
      duration: 3000,
      page: 'doctors',
      title: 'Doctor Profiles',
      description: 'Browsing available doctors and their profiles',
      actions: [
        { time: 0, action: 'scroll', params: { y: 200 } },
        { time: 800, action: 'moveMouse', params: { x: 60, y: 55 } },
        { time: 1500, action: 'hover', params: { element: 'doctor-card' } },
        { time: 2200, action: 'moveMouse', params: { x: 65, y: 70 } }
      ]
    },
    {
      id: 'book-appointment',
      duration: 3000,
      page: 'doctors',
      title: 'Book Appointment',
      description: 'Booking an appointment with a doctor',
      actions: [
        { time: 0, action: 'click', params: { x: 65, y: 70 } },
        { time: 500, action: 'showModal', params: { type: 'booking' } },
        { time: 1000, action: 'moveMouse', params: { x: 50, y: 45 } },
        { time: 2000, action: 'moveMouse', params: { x: 50, y: 65 } },
        { time: 2500, action: 'hideModal', params: {} }
      ]
    },
    {
      id: 'overview',
      duration: 2000,
      page: 'doctors',
      title: 'Platform Overview',
      description: 'Complete overview of PatientCare platform',
      actions: [
        { time: 0, action: 'scroll', params: { y: 0 } },
        { time: 1000, action: 'moveMouse', params: { x: 50, y: 50 } }
      ]
    }
  ];

  const currentStepData = recordingSteps[currentStep] || recordingSteps[0];

  // Execute step actions
  useEffect(() => {
    if (!isPlaying || currentStep >= recordingSteps.length) {
      if (currentStep >= recordingSteps.length && onComplete) {
        onComplete();
      }
      return;
    }

    const step = recordingSteps[currentStep];
    const stepTimer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, step.duration);

    // Execute actions within the step
    step.actions.forEach(action => {
      setTimeout(() => {
        executeAction(action.action, action.params);
      }, action.time);
    });

    return () => clearTimeout(stepTimer);
  }, [currentStep, isPlaying]);

  // Update current time for progress tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const executeAction = (action: string, params: any) => {
    switch (action) {
      case 'loadPage':
        setCurrentPage(params.page);
        setScrollY(0);
        break;
      case 'changePage':
        setCurrentPage(params.page);
        setScrollY(0);
        break;
      case 'moveMouse':
        animateMouseTo(params.x, params.y);
        break;
      case 'click':
        simulateClick(params.x, params.y);
        break;
      case 'scroll':
        smoothScrollTo(params.y);
        break;
      case 'showTooltip':
        setShowTooltip(params.text);
        setTimeout(() => setShowTooltip(''), 1500);
        break;
      case 'type':
        typeText(params.text);
        break;
      case 'hover':
        // Add hover effects
        break;
      case 'showModal':
        setShowModal(true);
        break;
      case 'hideModal':
        setShowModal(false);
        break;
    }
  };

  // Smooth mouse movement
  const animateMouseTo = (targetX: number, targetY: number, duration: number = 1200) => {
    const startX = mousePos.x;
    const startY = mousePos.y;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);
      
      setMousePos({
        x: startX + (targetX - startX) * easedProgress,
        y: startY + (targetY - startY) * easedProgress
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // Smooth scrolling
  const smoothScrollTo = (targetY: number, duration: number = 1500) => {
    const startY = scrollY;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeInOutQuad = (t: number) => 
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      const easedProgress = easeInOutQuad(progress);
      setScrollY(startY + (targetY - startY) * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // Simulate click effect
  const simulateClick = (x: number, y: number) => {
    setClickEffect({ show: true, x, y });
    setTimeout(() => setClickEffect({ show: false, x: 0, y: 0 }), 300);
  };

  // Typing animation
  const typeText = (text: string, speed: number = 120) => {
    setTypingText('');
    let i = 0;
    const timer = setInterval(() => {
      setTypingText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
      }
    }, speed);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setCurrentTime(0);
    setMousePos({ x: 50, y: 50 });
    setCurrentPage('home');
    setScrollY(0);
    setShowTooltip('');
    setTypingText('');
    setShowModal(false);
    setIsPlaying(true);
  };

  const handleSeek = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    const step = recordingSteps[stepIndex];
    if (step) {
      setCurrentPage(step.page);
      setScrollY(0);
      setShowTooltip('');
      setTypingText('');
      setShowModal(false);
    }
  };

  const handleStepSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stepIndex = parseInt(e.target.value);
    handleSeek(stepIndex);
  };

  const totalDuration = recordingSteps.reduce((sum, step) => sum + step.duration, 0);
  const progress = (currentTime / (totalDuration / 1000)) * 100;

  const renderPageContent = () => {
    if (currentPage === 'home') {
      return (
        <div style={{
          transform: `translateY(-${scrollY}px)`,
          transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Hero Section */}
          <section style={{
            height: '100vh',
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div>
              <h1 style={{
                fontSize: '3.5rem',
                fontWeight: '900',
                marginBottom: '24px',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
              }}>
                Your Health, Our Priority
              </h1>
              <p style={{
                fontSize: '1.3rem',
                marginBottom: '32px',
                opacity: 0.95
              }}>
                Connect with qualified healthcare professionals across Bahrain
              </p>

            </div>
          </section>

          {/* Features Section */}
          <section style={{
            padding: '80px 32px',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '48px',
                color: '#1e293b'
              }}>
                Why Choose PatientCare?
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '32px'
              }}>
                {[
                  { icon: '🏥', title: 'NHRA Licensed', desc: 'All doctors are verified and licensed' },
                  { icon: '📱', title: 'Digital Health', desc: 'Complete digital healthcare platform' },
                  { icon: '⚡', title: 'Instant Booking', desc: 'Book appointments in real-time' }
                ].map((feature, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: 'white',
                      padding: '32px',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      transform: mousePos.x > (25 + index * 25) && mousePos.x < (45 + index * 25) && mousePos.y > 65 && mousePos.y < 75 ? 'translateY(-8px)' : 'translateY(0)',
                      transition: 'transform 0.4s ease'
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{feature.icon}</div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
                      {feature.title}
                    </h3>
                    <p style={{ color: '#64748b', lineHeight: '1.6' }}>{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      );
    } else {
      return (
        <div style={{
          transform: `translateY(-${scrollY}px)`,
          transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: '#f8fafc',
          minHeight: '100%'
        }}>
          {/* Doctors Page Header */}
          <section style={{
            padding: '60px 32px 40px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#1e293b',
                marginBottom: '16px'
              }}>
                Find Healthcare Professionals
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                marginBottom: '32px'
              }}>
                Search from over 500+ NHRA-licensed doctors across Bahrain
              </p>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                maxWidth: '600px'
              }}>
                <input
                  type="text"
                  placeholder="Search doctors, specialties..."
                  value={typingText}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    borderColor: mousePos.x > 40 && mousePos.x < 65 && mousePos.y > 20 && mousePos.y < 30 ? '#0d9488' : '#e2e8f0',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <button style={{
                  padding: '16px 24px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transform: mousePos.x > 70 && mousePos.x < 80 && mousePos.y > 20 && mousePos.y < 30 ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}>
                  Search
                </button>
              </div>
            </div>
          </section>

          {/* Doctor Cards */}
          <section style={{
            padding: '60px 32px',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '24px'
              }}>
                {[
                  { name: 'Dr. Ahmed Al-Khalifa', specialty: 'Cardiologist', rating: 4.9, fee: '25 BHD' },
                  { name: 'Dr. Fatima Al-Mansouri', specialty: 'Dermatologist', rating: 4.8, fee: '30 BHD' },
                  { name: 'Dr. Omar Al-Zayani', specialty: 'Pediatrician', rating: 4.9, fee: '20 BHD' }
                ].map((doctor, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      transform: mousePos.x > (55 + index * 10) && mousePos.x < (75 + index * 10) && mousePos.y > 50 && mousePos.y < 65 ? 'translateY(-8px)' : 'translateY(0)',
                      transition: 'transform 0.4s ease',
                      border: '2px solid #f1f5f9'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: '700'
                      }}>
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '1.2rem',
                          fontWeight: '700',
                          color: '#1e293b',
                          marginBottom: '4px'
                        }}>
                          {doctor.name}
                        </h3>
                        <p style={{ color: '#0d9488', fontWeight: '600', margin: 0 }}>
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#fbbf24' }}>★</span>
                        <span style={{ fontWeight: '600' }}>{doctor.rating}</span>
                        <span style={{ color: '#64748b', fontSize: '14px' }}>(150+ reviews)</span>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0d9488' }}>
                        {doctor.fee}
                      </span>
                    </div>

                    <button style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: mousePos.x > (60 + index * 10) && mousePos.x < (80 + index * 10) && mousePos.y > 65 && mousePos.y < 75 ? '#0f766e' : '#0d9488',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transform: mousePos.x > (60 + index * 10) && mousePos.x < (80 + index * 10) && mousePos.y > 65 && mousePos.y < 75 ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}>
                      Book Appointment
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      );
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      backgroundColor: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Browser Window */}
      <div style={{
        width: '90%',
        height: '85%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        border: '1px solid #334155'
      }}>
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
            color: '#64748b',
            border: '1px solid #e2e8f0'
          }}>
            🔒 https://patientcare.bh{currentPage === 'doctors' ? '/doctors' : ''}
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
                              (item === 'Doctors' && currentPage === 'doctors');
              const isHovered = mousePos.x > (35 + index * 10) && mousePos.x < (50 + index * 10) && mousePos.y < 20;
              
              return (
                <div
                  key={item}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#0d9488' : '#475569',
                    backgroundColor: isHovered ? '#f8fafc' : (isActive ? '#f0fdfa' : 'transparent'),
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item}
                  {showTooltip === item && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#1e293b',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      marginTop: '4px',
                      zIndex: 1000
                    }}>
                      {item}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Page Content */}
        <div style={{
          height: 'calc(100% - 104px)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {renderPageContent()}
        </div>
      </div>

      {/* Mouse Cursor */}
      <div style={{
        position: 'absolute',
        left: `${mousePos.x}%`,
        top: `${mousePos.y}%`,
        pointerEvents: 'none',
        zIndex: 1000,
        transition: 'all 0.1s ease'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.5 3L19 12L12 13.5L8.5 20L5.5 3Z"
            fill="white"
            stroke="#1e293b"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Click Effect */}
      {clickEffect.show && (
        <div style={{
          position: 'absolute',
          left: `${clickEffect.x}%`,
          top: `${clickEffect.y}%`,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#0d9488',
          opacity: 0.6,
          transform: 'translate(-50%, -50%)',
          animation: 'clickRipple 0.3s ease-out',
          pointerEvents: 'none',
          zIndex: 999
        }}></div>
      )}

      {/* Booking Modal */}
      {showModal && (
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '350px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          padding: '24px',
          zIndex: 1001,
          animation: 'modalSlideIn 0.4s ease',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '20px'
            }}>
              📅
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '8px',
              color: '#1e293b'
            }}>
              Book Appointment
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Dr. Ahmed Al-Khalifa - Cardiologist
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM'].map((time, index) => (
              <button
                key={time}
                style={{
                  padding: '8px',
                  backgroundColor: index === 1 ? '#0d9488' : 'white',
                  color: index === 1 ? 'white' : '#374151',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {time}
              </button>
            ))}
          </div>
          
          <button style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0d9488',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            Confirm Booking - 25 BHD
          </button>
        </div>
      )}

      {/* Step Indicator */}
      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ fontSize: '16px', marginBottom: '4px' }}>
          {currentStepData.title}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          {currentStepData.description}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '4px',
        backgroundColor: 'rgba(30, 41, 59, 0.3)'
      }}>
        <div style={{
          height: '100%',
          backgroundColor: '#0d9488',
          width: `${Math.min(progress, 100)}%`,
          transition: 'width 0.3s ease'
        }}></div>
      </div>

      {/* Controls */}
      {showControls && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <select
            value={currentStep}
            onChange={handleStepSelect}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {recordingSteps.map((step, index) => (
              <option key={step.id} value={index} style={{ color: '#000' }}>
                {step.title}
              </option>
            ))}
          </select>
          <button
            onClick={handlePlayPause}
            style={{
              padding: '12px 20px',
              backgroundColor: isPlaying ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={handleRestart}
            style={{
              padding: '12px 20px',
              backgroundColor: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Restart
          </button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              padding: '12px 20px',
              backgroundColor: '#0d9488',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Try PatientCare
          </button>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes clickRipple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedScreenRecording;