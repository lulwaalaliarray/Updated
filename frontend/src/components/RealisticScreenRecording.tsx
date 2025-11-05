import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface MousePosition {
  x: number;
  y: number;
}

interface ScreenRecordingProps {
  onComplete?: () => void;
  autoPlay?: boolean;
}

const RealisticScreenRecording: React.FC<ScreenRecordingProps> = ({ 
  onComplete, 
  autoPlay = true 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 50, y: 50 });
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showCursor, setShowCursor] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [showPopup, setShowPopup] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Screen recording steps with realistic timing
  const steps = [
    { action: 'load', duration: 2000, description: 'Loading Homepage' },
    { action: 'scroll_hero', duration: 3000, description: 'Hero Section' },
    { action: 'scroll_features', duration: 2500, description: 'Features Overview' },
    { action: 'hover_nav', duration: 1500, description: 'Navigation' },
    { action: 'click_about', duration: 1000, description: 'About Page' },
    { action: 'scroll_about', duration: 2000, description: 'About Content' },
    { action: 'hover_services', duration: 1500, description: 'Services Menu' },
    { action: 'click_doctors', duration: 1000, description: 'Find Doctors' },
    { action: 'interact_search', duration: 2500, description: 'Search Doctors' },
    { action: 'show_contact', duration: 2000, description: 'Contact Form' },
    { action: 'zoom_out', duration: 2000, description: 'Overview' }
  ];

  // Realistic mouse movement with easing
  const moveMouseTo = (targetX: number, targetY: number, duration: number = 1000) => {
    const startX = mousePos.x;
    const startY = mousePos.y;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for natural movement
      const easeInOutCubic = (t: number) => 
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      
      const easedProgress = easeInOutCubic(progress);
      
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

  // Smooth scrolling animation
  const smoothScrollTo = (targetScroll: number, duration: number = 1500) => {
    const startScroll = scrollPosition;
    const startTime = Date.now();
    setIsScrolling(true);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeInOutQuad = (t: number) => 
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      const easedProgress = easeInOutQuad(progress);
      
      setScrollPosition(startScroll + (targetScroll - startScroll) * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsScrolling(false);
      }
    };

    requestAnimationFrame(animate);
  };

  // Execute current step
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) return;

    const step = steps[currentStep];
    const timer = setTimeout(() => {
      executeStep(step.action);
      setCurrentStep(prev => prev + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying]);

  const executeStep = (action: string) => {
    switch (action) {
      case 'load':
        setCurrentPage('home');
        moveMouseTo(50, 30);
        break;
      
      case 'scroll_hero':
        smoothScrollTo(300);
        moveMouseTo(45, 60);
        break;
      
      case 'scroll_features':
        smoothScrollTo(600);
        moveMouseTo(55, 70);
        break;
      
      case 'hover_nav':
        moveMouseTo(25, 8);
        break;
      
      case 'click_about':
        setCurrentPage('about');
        setScrollPosition(0);
        moveMouseTo(30, 8);
        break;
      
      case 'scroll_about':
        smoothScrollTo(400);
        moveMouseTo(50, 50);
        break;
      
      case 'hover_services':
        moveMouseTo(40, 8);
        break;
      
      case 'click_doctors':
        setCurrentPage('doctors');
        setScrollPosition(0);
        moveMouseTo(45, 8);
        break;
      
      case 'interact_search':
        moveMouseTo(50, 25);
        setTimeout(() => moveMouseTo(70, 40), 800);
        break;
      
      case 'show_contact':
        setShowPopup(true);
        moveMouseTo(80, 8);
        setTimeout(() => setShowPopup(false), 1500);
        break;
      
      case 'zoom_out':
        setShowCursor(false);
        break;
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setMousePos({ x: 50, y: 50 });
    setCurrentPage('home');
    setScrollPosition(0);
    setShowPopup(false);
    setShowCursor(true);
    setIsPlaying(true);
  };

  const renderPage = () => {
    const pageStyle = {
      transform: `translateY(-${scrollPosition}px)`,
      transition: isScrolling ? 'none' : 'transform 0.3s ease'
    };

    switch (currentPage) {
      case 'home':
        return (
          <div style={pageStyle}>
            {/* Hero Section */}
            <section style={{
              height: '100vh',
              background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              textAlign: 'center'
            }}>
              <div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem' }}>
                  PatientCare
                </h1>
                <p style={{ fontSize: '1.5rem', marginBottom: '2rem', opacity: 0.9 }}>
                  Your Health, Our Priority
                </p>

              </div>
            </section>

            {/* Features Section */}
            <section style={{
              padding: '5rem 2rem',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '3rem', color: '#111827' }}>
                  Our Features
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem'
                }}>
                  {[
                    { title: 'Online Consultations', icon: '💻', desc: 'Connect with doctors remotely' },
                    { title: 'Appointment Booking', icon: '📅', desc: 'Easy scheduling system' },
                    { title: 'Medical Records', icon: '📋', desc: 'Secure digital health records' }
                  ].map((feature, index) => (
                    <div key={index} style={{
                      backgroundColor: 'white',
                      padding: '2rem',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transform: mousePos.x > (30 + index * 25) && mousePos.x < (50 + index * 25) && mousePos.y > 60 && mousePos.y < 80 ? 'translateY(-5px)' : 'translateY(0)',
                      transition: 'transform 0.3s ease'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
                        {feature.title}
                      </h3>
                      <p style={{ color: '#6b7280', lineHeight: '1.6' }}>{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section style={{
              padding: '5rem 2rem',
              backgroundColor: 'white'
            }}>
              <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '3rem', color: '#111827' }}>
                  What Our Patients Say
                </h2>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '3rem',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '2rem', color: '#374151' }}>
                    "PatientCare has revolutionized how I manage my health. The online consultations are convenient and the doctors are professional."
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#0d9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      S
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', color: '#111827' }}>Sarah Ahmed</p>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Verified Patient</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      case 'about':
        return (
          <div style={pageStyle}>
            <section style={{
              padding: '5rem 2rem',
              backgroundColor: '#f8fafc',
              minHeight: '100vh'
            }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '2rem', color: '#111827', textAlign: 'center' }}>
                  About PatientCare
                </h1>
                <div style={{
                  backgroundColor: 'white',
                  padding: '3rem',
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}>
                  <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem', color: '#374151' }}>
                    PatientCare is Bahrain's leading digital healthcare platform, connecting patients with qualified medical professionals through innovative technology solutions.
                  </p>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2rem', color: '#6b7280' }}>
                    Our mission is to make healthcare accessible, convenient, and efficient for everyone in the Kingdom of Bahrain. We provide secure online consultations, easy appointment booking, and comprehensive medical record management.
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem',
                    marginTop: '3rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0d9488' }}>500+</div>
                      <p style={{ color: '#6b7280' }}>Verified Doctors</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0d9488' }}>10,000+</div>
                      <p style={{ color: '#6b7280' }}>Happy Patients</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0d9488' }}>24/7</div>
                      <p style={{ color: '#6b7280' }}>Support Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      case 'doctors':
        return (
          <div style={pageStyle}>
            <section style={{
              padding: '3rem 2rem',
              backgroundColor: '#f8fafc',
              minHeight: '100vh'
            }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem', color: '#111827', textAlign: 'center' }}>
                  Find Doctors in Bahrain
                </h1>
                
                {/* Search Bar */}
                <div style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  marginBottom: '3rem'
                }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Search doctors, specialties..."
                      style={{
                        flex: 1,
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        borderColor: mousePos.x > 45 && mousePos.x < 75 && mousePos.y > 20 && mousePos.y < 30 ? '#0d9488' : '#e5e7eb'
                      }}
                    />
                    <button style={{
                      padding: '1rem 2rem',
                      backgroundColor: '#0d9488',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}>
                      Search
                    </button>
                  </div>
                </div>

                {/* Doctor Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: '2rem'
                }}>
                  {[
                    { name: 'Dr. Ahmed Al-Khalifa', specialty: 'Cardiology', rating: 4.9, fee: 25 },
                    { name: 'Dr. Fatima Al-Mansouri', specialty: 'Dermatology', rating: 4.8, fee: 20 },
                    { name: 'Dr. Omar Al-Zayani', specialty: 'Pediatrics', rating: 4.9, fee: 18 }
                  ].map((doctor, index) => (
                    <div key={index} style={{
                      backgroundColor: 'white',
                      padding: '2rem',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transform: mousePos.x > (30 + index * 25) && mousePos.x < (70 + index * 25) && mousePos.y > 35 && mousePos.y < 65 ? 'translateY(-5px)' : 'translateY(0)',
                      transition: 'transform 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: '#ecfdf5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0d9488',
                          fontWeight: '600',
                          fontSize: '1.2rem'
                        }}>
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                            {doctor.name}
                          </h3>
                          <p style={{ color: '#0d9488', fontWeight: '500', margin: 0 }}>{doctor.specialty}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: '#fbbf24' }}>★</span>
                          <span style={{ marginLeft: '0.5rem', fontWeight: '500' }}>{doctor.rating}</span>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#111827' }}>
                          {doctor.fee} BHD
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Browser Window */}
      <div style={{
        width: '90%',
        height: '85%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        transform: currentStep >= steps.length - 1 ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 2s ease'
      }}>
        {/* Browser Header */}
        <div style={{
          height: '60px',
          backgroundColor: '#f3f4f6',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
          </div>
          <div style={{
            flex: 1,
            height: '32px',
            backgroundColor: 'white',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1rem',
            marginLeft: '1rem',
            fontSize: '0.9rem',
            color: '#6b7280'
          }}>
            🔒 patientcare.bh
          </div>
        </div>

        {/* Navigation Bar */}
        <div style={{
          height: '60px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: '0 2rem',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0d9488' }}>
            PatientCare
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {['Home', 'About', 'Services', 'Doctors', 'Contact'].map((item, index) => (
              <div
                key={item}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: mousePos.x > (20 + index * 10) && mousePos.x < (30 + index * 10) && mousePos.y < 15 ? '#f3f4f6' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <div style={{
          height: 'calc(100% - 120px)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {renderPage()}
        </div>
      </div>

      {/* Mouse Cursor */}
      {showCursor && (
        <div style={{
          position: 'absolute',
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          width: '20px',
          height: '20px',
          pointerEvents: 'none',
          zIndex: 1000,
          transition: 'all 0.1s ease'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.5 3L19 12L12 13.5L8.5 20L5.5 3Z"
              fill="white"
              stroke="black"
              strokeWidth="1"
            />
          </svg>
        </div>
      )}

      {/* Contact Popup */}
      {showPopup && (
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '300px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2rem',
          zIndex: 1001,
          animation: 'slideIn 0.3s ease'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
            Contact Us
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            Get in touch with our team
          </p>
          <button style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#0d9488',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500'
          }}>
            Send Message
          </button>
        </div>
      )}

      {/* Step Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '2rem',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '500'
      }}>
        {currentStep < steps.length ? steps[currentStep].description : 'Demo Complete'}
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem',
        display: 'flex',
        gap: '1rem'
      }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isPlaying ? '#ef4444' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={handleRestart}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Restart
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RealisticScreenRecording;