import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import WelcomeScreen from './components/WelcomeScreen';
import SimpleDashboard from './components/SimpleDashboard';
import FindDoctors from './components/FindDoctors';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { isLoggedIn } from './utils/navigation';
import './utils/updateDoctorStatus'; // Auto-activate pending doctors
import './styles/notes.css'; // Consistent notes styling

import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';

import PressPage from './pages/PressPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogPreviewPage from './pages/BlogPreviewPage';
import CreateBlogPage from './pages/CreateBlogPage';
import EditBlogPage from './pages/EditBlogPage';

import HelpPage from './pages/HelpPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ProfilePage from './pages/ProfilePage';
import UpcomingAppointments from './components/UpcomingAppointments';
import EnhancedAvailability from './components/EnhancedAvailability';
import WritePrescription from './components/WritePrescription';
import DoctorProfilePage from './pages/DoctorProfilePage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import MyReviewsPage from './pages/MyReviewsPage';

import ViewPrescriptions from './components/ViewPrescriptions';
import PersonalMedicalRecords from './components/PersonalMedicalRecords';
import PastPatients from './components/PastPatients';
import LeaveReview from './components/LeaveReview';
import ReviewDisplay from './components/ReviewDisplay';
import PatientAppointments from './components/PatientAppointments';
import DoctorAppointmentManager from './components/DoctorAppointmentManager';
import Project from './components/Project';
import UserManagement from './components/UserManagement';
import NewsletterManagement from './components/NewsletterManagement';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import RegisterPage from './pages/RegisterPage';

import ForgotPasswordPage from './pages/ForgotPasswordPage';



const ChatPage = () => <div style={{ padding: '40px', textAlign: 'center' }}><h2>Chat with Doctor</h2><p>Secure messaging with healthcare providers.</p></div>;
const SupportPage = () => <div style={{ padding: '40px', textAlign: 'center' }}><h2>Support Center</h2><p>Get help with PatientCare platform.</p></div>;



function App(): JSX.Element {
  const [user, setUser] = useState<{ name: string; email?: string; userType?: string; avatar?: string } | null>(null);

  // Check for existing authentication on app load and when storage changes
  useEffect(() => {
    const checkAuth = () => {
      if (isLoggedIn()) {
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (when user logs in/out in different tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userData' || e.key === 'authToken') {
        checkAuth();
      }
    };

    // Listen for custom logout event (when user logs out in same tab)
    const handleLogout = () => {
      // Immediately clear user state
      setUser(null);
      // Clear any cached data
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      localStorage.removeItem('redirectAfterLogin');
      // Force re-check
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogout', handleLogout);

    // Also check periodically as fallback
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogout', handleLogout);
      clearInterval(interval);
    };
  }, []);

  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/support" element={<SupportPage />} />

          {/* Product Pages */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/find-doctors" element={<FindDoctors />} />
          <Route path="/doctors" element={<FindDoctors />} />
          <Route path="/pricing" element={<PricingPage />} />


          {/* Company Pages */}
          <Route path="/press" element={<PressPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/preview" element={<BlogPreviewPage />} />
          <Route path="/blog/create" element={
            <ProtectedRoute message="Please log in as a doctor to create blog posts">
              <CreateBlogPage />
            </ProtectedRoute>
          } />
          <Route path="/blog/edit/:id" element={
            <ProtectedRoute message="Please log in as a doctor to edit blog posts">
              <EditBlogPage />
            </ProtectedRoute>
          } />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/blog/edit/:id" element={
            <ProtectedRoute message="Please log in as a doctor to edit blog posts">
              <CreateBlogPage />
            </ProtectedRoute>
          } />

          <Route path="/manage-availability" element={
            <ProtectedRoute message="Please log in as a doctor or admin to manage availability">
              <EnhancedAvailability />
            </ProtectedRoute>
          } />
          <Route path="/write-prescription" element={
            <ProtectedRoute message="Please log in as a doctor to write prescriptions">
              <WritePrescription />
            </ProtectedRoute>
          } />

          {/* Support Pages */}
          <Route path="/help" element={<HelpPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/appointments" element={
            <ProtectedRoute message="Please log in to view your appointments">
              {user?.userType === 'doctor' ? <DoctorAppointmentManager /> : <MyAppointmentsPage />}
            </ProtectedRoute>
          } />
          <Route path="/manage-appointments" element={
            <ProtectedRoute message="Please log in as a doctor to manage appointments">
              <DoctorAppointmentManager />
            </ProtectedRoute>
          } />
          <Route path="/upcoming-appointments" element={
            <ProtectedRoute message="Please log in as a doctor to view upcoming appointments">
              <UpcomingAppointments />
            </ProtectedRoute>
          } />
          <Route path="/doctor/:doctorId" element={<DoctorProfilePage />} />
          <Route path="/chat" element={
            <ProtectedRoute message="Please log in to chat with doctors">
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/records" element={
            <ProtectedRoute message="Please log in to view your medical records">
              <PersonalMedicalRecords />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute message="Please log in to access your dashboard">
              {user ? <SimpleDashboard user={user} /> : <div>Loading...</div>}
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute message="Please log in to access your profile">
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/prescriptions" element={
            <ProtectedRoute message="Please log in to view your prescriptions">
              <ViewPrescriptions />
            </ProtectedRoute>
          } />
          <Route path="/past-patients" element={
            <ProtectedRoute message="Please log in as a doctor to view past patients">
              <PastPatients />
            </ProtectedRoute>
          } />

          <Route path="/leave-review/:doctorId" element={
            <ProtectedRoute message="Please log in to leave a review">
              <LeaveReview />
            </ProtectedRoute>
          } />
          <Route path="/my-reviews" element={
            <ProtectedRoute message="Please log in to view your reviews">
              <MyReviewsPage />
            </ProtectedRoute>
          } />
          <Route path="/reviews/:doctorId" element={<ReviewDisplay />} />
          <Route path="/patient-appointments" element={
            <ProtectedRoute message="Please log in to view appointments">
              <PatientAppointments />
            </ProtectedRoute>
          } />
          <Route path="/project" element={<Project />} />
          <Route path="/user-management" element={
            <ProtectedRoute message="Please log in as an admin to manage users">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/newsletter" element={
            <ProtectedRoute message="Please log in as an admin to manage newsletter">
              <NewsletterManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute message="Please log in as an admin to access admin dashboard">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/register" element={<RegisterPage />} />

        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;