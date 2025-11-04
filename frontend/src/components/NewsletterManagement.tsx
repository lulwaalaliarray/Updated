import React, { useState, useEffect } from 'react';
import { newsletterStorage, NewsletterSubscription } from '../utils/newsletterStorage';

const NewsletterManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [subscriptionCount, setSubscriptionCount] = useState(0);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = () => {
    const allSubscriptions = newsletterStorage.getAllSubscriptions();
    const count = newsletterStorage.getSubscriptionCount();
    setSubscriptions(allSubscriptions);
    setSubscriptionCount(count);
  };

  const handleUnsubscribe = (email: string) => {
    if (window.confirm(`Are you sure you want to unsubscribe ${email}?`)) {
      newsletterStorage.unsubscribe(email);
      loadSubscriptions();
    }
  };

  const clearAllSubscriptions = () => {
    if (window.confirm('Are you sure you want to clear all newsletter subscriptions? This action cannot be undone.')) {
      newsletterStorage.clearAllSubscriptions();
      loadSubscriptions();
    }
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  const inactiveSubscriptions = subscriptions.filter(sub => !sub.isActive);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#111827', marginBottom: '8px' }}>Newsletter Management</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Utility to view and manage newsletter subscriptions
        </p>
      </div>

      {/* Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e0f2fe'
        }}>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1', margin: '0 0 4px' }}>
            {subscriptionCount}
          </p>
          <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>Active Subscriptions</p>
        </div>
        <div style={{
          backgroundColor: '#fef7ff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #f3e8ff'
        }}>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed', margin: '0 0 4px' }}>
            {inactiveSubscriptions.length}
          </p>
          <p style={{ fontSize: '14px', color: '#7c3aed', margin: 0 }}>Unsubscribed</p>
        </div>
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #dcfce7'
        }}>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#166534', margin: '0 0 4px' }}>
            {subscriptions.length}
          </p>
          <p style={{ fontSize: '14px', color: '#166534', margin: 0 }}>Total Emails</p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={clearAllSubscriptions}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Clear All Subscriptions
        </button>
      </div>

      {/* Active Subscriptions */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, color: '#111827', fontSize: '16px' }}>Active Subscriptions</h3>
        </div>
        
        {activeSubscriptions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
            No active subscriptions yet
          </div>
        ) : (
          <div>
            {activeSubscriptions.map((subscription, index) => (
              <div
                key={subscription.email}
                style={{
                  padding: '16px',
                  borderBottom: index < activeSubscriptions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500', color: '#111827' }}>{subscription.email}</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}>
                      Active
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    Subscribed: {new Date(subscription.subscribedAt).toLocaleDateString()} at {new Date(subscription.subscribedAt).toLocaleTimeString()}
                  </p>
                </div>
                
                <button
                  onClick={() => handleUnsubscribe(subscription.email)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Unsubscribe
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: '16px' }}>Unsubscribed Emails</h3>
          </div>
          
          <div>
            {inactiveSubscriptions.map((subscription, index) => (
              <div
                key={subscription.email}
                style={{
                  padding: '16px',
                  borderBottom: index < inactiveSubscriptions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: 0.7
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '500', color: '#6b7280' }}>{subscription.email}</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: '#fef3c7',
                      color: '#92400e'
                    }}>
                      Unsubscribed
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                    Originally subscribed: {new Date(subscription.subscribedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterManagement;