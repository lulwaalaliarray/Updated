import React, { useState, useEffect } from 'react';

interface DemoVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoVideoPlayer: React.FC<DemoVideoPlayerProps> = ({ isOpen, onClose }) => {

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '1000px',
          backgroundColor: 'black',
          borderRadius: '12px',
          overflow: 'hidden'
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
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            border: 'none',
            borderRadius: '50%',
            color: 'white',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          }}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Video Walkthrough */}
        <VideoWalkthrough onClose={onClose} />


      </div>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

// Video Walkthrough Component
interface VideoWalkthroughProps {
  onClose: () => void;
}

const VideoWalkthrough: React.FC<VideoWalkthroughProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const walkthroughSteps = [
    {
      title: "Welcome to PatientCare",
      description: "Let's take a quick tour of how PatientCare makes healthcare simple and accessible in Bahrain.",
      screen: "🏥",
      color: "#0d9488",
      duration: 4000
    },
    {
      title: "Step 1: Find Your Doctor",
      description: "Search through our network of NHRA-licensed doctors. Filter by specialty, location, and availability to find the perfect match.",
      screen: "🔍",
      color: "#10b981",
      duration: 5000
    },
    {
      title: "Step 2: View Doctor Profiles",
      description: "Check doctor credentials, patient reviews, and available time slots. All doctors are verified by Bahrain's health authorities.",
      screen: "👨‍⚕️",
      color: "#3b82f6",
      duration: 5000
    },
    {
      title: "Step 3: Book Your Appointment",
      description: "Select your preferred date and time. Choose between in-person visits or telemedicine consultations with instant confirmation.",
      screen: "📅",
      color: "#8b5cf6",
      duration: 5000
    },
    {
      title: "Step 4: Manage Your Health",
      description: "Access your complete medical records, prescription history, and upcoming appointments all in one secure platform.",
      screen: "📋",
      color: "#f59e0b",
      duration: 5000
    },
    {
      title: "Ready to Get Started?",
      description: "Join thousands of patients who trust PatientCare for their healthcare needs. Sign up today and experience the future of healthcare in Bahrain.",
      screen: "✨",
      color: "#ec4899",
      duration: 4000
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < walkthroughSteps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, walkthroughSteps[currentStep]?.duration || 4000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, walkthroughSteps]);

  const currentStepData = walkthroughSteps[currentStep];
  const progress = ((currentStep + 1) / walkthroughSteps.length) * 100;

  return (
    <div style={{
      width: '100%',
      height: '500px',
      background: `linear-gradient(135deg, ${currentStepData.color} 0%, ${currentStepData.color}dd 100%)`,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      color: 'white',
      overflow: 'hidden'
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

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        position: 'relative'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: 'white',
          transition: 'width 0.5s ease'
        }}></div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          fontSize: '80px',
          marginBottom: '24px',
          animation: 'slideIn 0.6s ease-out'
        }}>
          {currentStepData.screen}
        </div>

        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '16px',
          animation: 'slideIn 0.6s ease-out 0.1s both'
        }}>
          {currentStepData.title}
        </h2>

        <p style={{
          fontSize: '18px',
          lineHeight: '1.6',
          maxWidth: '600px',
          opacity: 0.9,
          animation: 'slideIn 0.6s ease-out 0.2s both'
        }}>
          {currentStepData.description}
        </p>

        {/* Step Indicator */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          gap: '8px',
          animation: 'slideIn 0.6s ease-out 0.3s both'
        }}>
          {walkthroughSteps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: index <= currentStep ? 'white' : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          fontSize: '14px',
          opacity: 0.8
        }}>
          Step {currentStep + 1} of {walkthroughSteps.length}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: currentStep === 0 ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            ← Previous
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'white',
              color: currentStepData.color,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            onClick={() => setCurrentStep(Math.min(walkthroughSteps.length - 1, currentStep + 1))}
            disabled={currentStep === walkthroughSteps.length - 1}
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              cursor: currentStep === walkthroughSteps.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: currentStep === walkthroughSteps.length - 1 ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            Next →
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          Close
        </button>
      </div>

      {/* Auto-play Progress Bar */}
      {isPlaying && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            animation: `progress ${currentStepData.duration}ms linear infinite`,
            transformOrigin: 'left'
          }}></div>
        </div>
      )}

      <style>
        {`
          @keyframes progress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
        `}
      </style>
    </div>
  );
};

export default DemoVideoPlayer;