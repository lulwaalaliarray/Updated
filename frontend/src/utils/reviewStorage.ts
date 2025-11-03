interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

class ReviewStorage {
  private storageKey = 'patientcare_reviews';

  // Get all reviews
  getAllReviews(): Review[] {
    try {
      const reviews = localStorage.getItem(this.storageKey);
      return reviews ? JSON.parse(reviews) : [];
    } catch (error) {
      console.error('Error loading reviews:', error);
      return [];
    }
  }

  // Get reviews for a specific doctor
  getDoctorReviews(doctorId: string): Review[] {
    const allReviews = this.getAllReviews();
    return allReviews.filter(review => review.doctorId === doctorId);
  }

  // Get reviews by a specific patient
  getPatientReviews(patientId: string): Review[] {
    const allReviews = this.getAllReviews();
    return allReviews.filter(review => review.patientId === patientId);
  }

  // Add a new review
  addReview(review: Review): boolean {
    try {
      const allReviews = this.getAllReviews();
      
      // Check if patient has already reviewed this doctor
      const existingReview = allReviews.find(
        r => r.doctorId === review.doctorId && r.patientId === review.patientId
      );
      
      if (existingReview) {
        // Update existing review
        const updatedReviews = allReviews.map(r => 
          r.id === existingReview.id ? { ...review, id: existingReview.id } : r
        );
        localStorage.setItem(this.storageKey, JSON.stringify(updatedReviews));
      } else {
        // Add new review
        allReviews.push(review);
        localStorage.setItem(this.storageKey, JSON.stringify(allReviews));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving review:', error);
      return false;
    }
  }

  // Update a review
  updateReview(reviewId: string, updates: Partial<Review>): boolean {
    try {
      const allReviews = this.getAllReviews();
      const updatedReviews = allReviews.map(review => 
        review.id === reviewId ? { ...review, ...updates } : review
      );
      localStorage.setItem(this.storageKey, JSON.stringify(updatedReviews));
      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      return false;
    }
  }

  // Delete a review
  deleteReview(reviewId: string): boolean {
    try {
      const allReviews = this.getAllReviews();
      const filteredReviews = allReviews.filter(review => review.id !== reviewId);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredReviews));
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  // Get average rating for a doctor
  getDoctorAverageRating(doctorId: string): number {
    const doctorReviews = this.getDoctorReviews(doctorId);
    if (doctorReviews.length === 0) return 0;
    
    const totalRating = doctorReviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / doctorReviews.length;
  }

  // Get rating distribution for a doctor
  getDoctorRatingDistribution(doctorId: string): { [key: number]: number } {
    const doctorReviews = this.getDoctorReviews(doctorId);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    doctorReviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    
    return distribution;
  }

  // Check if patient can review doctor (has had an appointment)
  canPatientReviewDoctor(patientId: string, doctorId: string): boolean {
    try {
      // Import appointmentStorage dynamically to avoid circular dependencies
      const appointmentStorageData = localStorage.getItem('patientcare_appointments');
      if (!appointmentStorageData) return false;
      
      const appointments = JSON.parse(appointmentStorageData);
      
      // Check if patient has completed appointments with this doctor
      const completedAppointments = appointments.filter((appointment: any) => 
        (appointment.patientId === patientId || appointment.patientEmail === patientId) &&
        appointment.doctorId === doctorId &&
        appointment.status === 'completed'
      );
      
      return completedAppointments.length > 0;
    } catch (error) {
      console.error('Error checking appointment history:', error);
      return false;
    }
  }

  // Initialize with sample data
  initializeSampleData(): void {
    const existingReviews = this.getAllReviews();
    if (existingReviews.length > 0) return; // Don't overwrite existing data

    const sampleReviews: Review[] = [
      {
        id: '1',
        doctorId: 'dr-ahmed-mahmood',
        patientId: 'patient1@example.com',
        patientName: 'Sarah Al-Zahra',
        rating: 5,
        comment: 'Excellent doctor! Very professional and caring. Explained everything clearly and took time to answer all my questions. Highly recommend!',
        date: '2024-01-15T10:30:00Z',
        verified: true
      },
      {
        id: '2',
        doctorId: 'dr-ahmed-mahmood',
        patientId: 'patient2@example.com',
        patientName: 'Mohammed Al-Rashid',
        rating: 4,
        comment: 'Good experience overall. The doctor was knowledgeable and the treatment was effective. The only issue was the long waiting time.',
        date: '2024-01-10T14:15:00Z',
        verified: true
      },
      {
        id: '3',
        doctorId: 'dr-ahmed-mahmood',
        patientId: 'patient3@example.com',
        patientName: 'Fatima Al-Khalifa',
        rating: 5,
        comment: 'Outstanding care! Dr. Ahmed is very thorough and compassionate. The clinic is clean and well-organized. Will definitely return for future visits.',
        date: '2024-01-05T09:45:00Z',
        verified: true
      }
    ];

    localStorage.setItem(this.storageKey, JSON.stringify(sampleReviews));
  }
}

export const reviewStorage = new ReviewStorage();

// Initialize sample data on first load
reviewStorage.initializeSampleData();