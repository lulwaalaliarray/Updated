import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Tab,
  Tabs,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { SystemAnalytics } from '../types/admin';
import { AdminAnalyticsCards } from '../components/Admin/AdminAnalyticsCards';
import { UserManagement } from '../components/Admin/UserManagement';
import { DoctorVerification } from '../components/Admin/DoctorVerification';
import { PaymentMonitoring } from '../components/Admin/PaymentMonitoring';
import { AppointmentManagement } from '../components/Admin/AppointmentManagement';
import { SystemHealth } from '../components/Admin/SystemHealth';
import Header from '../components/Header';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const AdminDashboardPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {analytics && (
        <Box sx={{ mb: 4 }}>
          <AdminAnalyticsCards analytics={analytics} />
        </Box>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
            <Tab label="Overview" />
            <Tab label="User Management" />
            <Tab label="Doctor Verification" />
            <Tab label="Payment Monitoring" />
            <Tab label="Appointments" />
            <Tab label="System Health" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Recent Activity"
                  avatar={<TrendingUpIcon />}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    System activity overview and recent changes
                  </Typography>
                  {/* TODO: Add recent activity component */}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Alerts & Notifications"
                  avatar={<WarningIcon />}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    System alerts and important notifications
                  </Typography>
                  {/* TODO: Add alerts component */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <UserManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <DoctorVerification />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <PaymentMonitoring />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <AppointmentManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <SystemHealth />
        </TabPanel>
      </Paper>
    </Container>
    </div>
  );
};