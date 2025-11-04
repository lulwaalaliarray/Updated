// Utility functions for managing newsletter subscriptions in localStorage
// In a real application, this would be handled by a backend API

export interface NewsletterSubscription {
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export const newsletterStorage = {
  // Get all newsletter subscriptions
  getAllSubscriptions: (): NewsletterSubscription[] => {
    try {
      return JSON.parse(localStorage.getItem('newsletterSubscriptions') || '[]');
    } catch {
      return [];
    }
  },

  // Add a new subscription
  addSubscription: (email: string): boolean => {
    try {
      const subscriptions = newsletterStorage.getAllSubscriptions();
      
      // Check if email already exists
      if (subscriptions.some(sub => sub.email.toLowerCase() === email.toLowerCase())) {
        return false; // Email already subscribed
      }

      const newSubscription: NewsletterSubscription = {
        email: email.toLowerCase(),
        subscribedAt: new Date().toISOString(),
        isActive: true
      };

      subscriptions.push(newSubscription);
      localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
      return true;
    } catch {
      return false;
    }
  },

  // Check if email is already subscribed
  isEmailSubscribed: (email: string): boolean => {
    try {
      const subscriptions = newsletterStorage.getAllSubscriptions();
      return subscriptions.some(sub => 
        sub.email.toLowerCase() === email.toLowerCase() && sub.isActive
      );
    } catch {
      return false;
    }
  },

  // Unsubscribe an email
  unsubscribe: (email: string): boolean => {
    try {
      const subscriptions = newsletterStorage.getAllSubscriptions();
      const subscriptionIndex = subscriptions.findIndex(
        sub => sub.email.toLowerCase() === email.toLowerCase()
      );
      
      if (subscriptionIndex !== -1) {
        subscriptions[subscriptionIndex].isActive = false;
        localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // Get subscription count
  getSubscriptionCount: (): number => {
    try {
      const subscriptions = newsletterStorage.getAllSubscriptions();
      return subscriptions.filter(sub => sub.isActive).length;
    } catch {
      return 0;
    }
  },

  // Clear all subscriptions
  clearAllSubscriptions: (): void => {
    localStorage.removeItem('newsletterSubscriptions');
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
};

// Export individual functions for convenience
export const {
  getAllSubscriptions,
  addSubscription,
  isEmailSubscribed,
  unsubscribe,
  getSubscriptionCount,
  clearAllSubscriptions,
  isValidEmail
} = newsletterStorage;