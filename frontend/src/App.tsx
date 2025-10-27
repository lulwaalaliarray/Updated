import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import FindDoctors from './components/FindDoctors';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { isLoggedIn } from './utils/navigation';
import './utils/updateDoctorStatus'; // Auto-activate pending doctors

import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import SecurityPage from './pages/SecurityPage';
import CareersPage from './pages/CareersPage';
import PressPage from './pages/PressPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import CreateBlogPage from './pages/CreateBlogPage';
import HelpPage from './pages/HelpPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ProfilePage from './pages/ProfilePage';
import UpcomingAppointments from './components/UpcomingAppointments';
import ManageAvailability from './components/ManageAvailability';
import WritePrescription from './components/WritePrescription';
import DoctorProfilePage from './pages/DoctorProfilePage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';


const ChatPage = () => <div style={{ padding: '40px', textAlign: 'center' }}><h2>Chat with Doctor</h2><p>Secure messaging with healthcare providers.</p></div>;
const RecordsPage = () => <div style={{ padding: '40px', textAlign: 'center' }}><h2>Medical Records</h2><p>Access your health records and prescriptions.</p></div>;
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

    // Listen for storage changes (when user logs in/out in same tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userData' || e.key === 'authToken') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/support" element={<SupportPage />} />
          
          {/* Product Pages */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/find-doctors" element={<FindDoctors />} />
          <Route path="/doctors" element={<FindDoctors />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/security" element={<SecurityPage />} />
          
          {/* Company Pages */}
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/blog/create" element={
            <ProtectedRoute message="Please log in as a doctor to create blog posts">
              <CreateBlogPage />
            </ProtectedRoute>
          } />
          <Route path="/manage-availability" element={
            <ProtectedRoute message="Please log in as a doctor to manage availability">
              <ManageAvailability />
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
              {user?.userType === 'doctor' ? <UpcomingAppointments /> : <MyAppointmentsPage />}
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
              <RecordsPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute message="Please log in to access your dashboard">
              {user ? <Dashboard user={user} /> : <div>Loading...</div>}
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute message="Please log in to access your profile">
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;