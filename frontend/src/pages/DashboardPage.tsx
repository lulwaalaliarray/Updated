import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import PatientDashboard from '../components/Dashboard/PatientDashboard';
import AdminDashboard from '../components/AdminDashboard';
import AdminDashboardPage from './AdminDashboardPage';

function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Box textAlign="center">
        <Typography variant="h6">Please log in to access your dashboard.</Typography>
      </Box>
    );
  }

  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'doctor':
      return <AdminDashboard />;
    case 'admin':
      return <AdminDashboardPage />;
    default:
      return (
        <Box textAlign="center">
          <Typography variant="h6" color="error">
            Unknown user role. Please contact support.
          </Typography>
        </Box>
      );
  }
}

export default DashboardPage;