import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { scrollToTop } from '../utils/scrollUtils';
import LightboxVideoPlayer from '../components/LightboxVideoPlayer';

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showLightboxVideo, setShowLightboxVideo] = useState(false);
  const features = [
    {
      icon: '📅',
      title: 'Smart Appointment Booking',
      description: 'Book appointments with healthcare providers across Bahrain in just a few clicks. Our intelligent system matches you with the right specialists based on your needs.',
      benefits: ['Real-time availability', 'Instant confirmation', 'Automated reminders', 'Easy rescheduling']
    },
    {
      icon: '💬',
      title: 'Secure Doctor Chat',
      description: 'Connect with licensed physicians through our encrypted messaging system. Get medical advice, prescription refills, and follow-up care from anywhere.',
      benefits: ['End-to-end encryption', '24/7 availability', 'Multi-language support', 'File sharing capability']
    },
    {
      icon: '📊',
      title: 'Health Tracking Dashboard',
      description: 'Monitor your health metrics, track medications, and view your medical history in one comprehensive dashboard designed for Bahrain residents.',
      benefits: ['Vital signs tracking', 'Medication reminders', 'Lab results integration', 'Progress analytics']
    },
    {
      icon: '🔍',
      title: 'Advanced Doctor Search',
      description: 'Find the perfect healthcare provider using our advanced search filters. Search by specialty, location, insurance, and patient reviews.',
      benefits: ['Specialty filtering', 'Location-based search', 'Insurance verification', 'Patient reviews']
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      description: 'Access your healthcare on the go with our responsive mobile platform. Optimized for smartphones and tablets used throughout the Kingdom.',
      benefits: ['iOS & Android compatible', 'Offline capabilities', 'Push notifications', 'Touch-optimized interface']
    },
    {
      icon: '🛡️',
      title: 'NHRA Compliance',
      description: 'Full compliance with Bahrain\'s National Health Regulatory Authority standards. Your health data is protected with enterprise-grade security.',
      benefits: ['NHRA certified', 'Data encryption', 'Audit trails', 'Privacy controls']
    }
  ];

  return (
    <Layout title="Features" subtitle="Discover our platform capabilities">
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Hero Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px 32px',
          marginBottom: '32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Platform Features
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Discover the comprehensive tools and features that make PatientCare the leading healthcare platform in Bahrain. From appointment booking to health tracking, we've got you covered.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                {feature.description}
              </p>
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0d9488',
                  marginBottom: '12px'
                }}>
                  Key Benefits:
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px 32px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Ready to Experience These Features?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Join thousands of Bahrain residents who trust PatientCare for their healthcare needs. Get started today and experience the future of healthcare.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={scrollToTop}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              Get Started Free
            </button>
            <button 
              onClick={() => setShowLightboxVideo(true)}
              style={{
                padding: '12px 32px',
                backgroundColor: 'white',
                color: '#0d9488',
                border: '2px solid #0d9488',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0fdfa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}>
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Video Player */}
      <LightboxVideoPlayer 
        isOpen={showLightboxVideo}
        onClose={() => setShowLightboxVideo(false)}
        autoPlay={true}
      />
    </Layout>
  );
};

export default FeaturesPage;