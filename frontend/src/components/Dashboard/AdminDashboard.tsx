import { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,

  useTheme,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  VideoCall as VideoCallIcon,
  LocationOn as LocationOnIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { fetchAppointments, updateAppointmentStatus } from '../../store/slices/appointmentSlice';
import { Appointment } from '../../types';

function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { appointments } = useAppSelector((state) => state.appointments);
  const { user } = useAppSelector((state) => state.auth);
  
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [earnings, setEarnings] = useState({ today: 0, thisMonth: 0, total: 0 });

  useEffect(() => {
    if (user) {
      dispatch(fetchAppointments({}));
    }
  }, [dispatch, user]);

  useEffect(() => {
    const pending = appointments.filter((apt) => apt.status === 'awaiting_acceptance');
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const todayApts = appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledDateTime);
      return aptDate >= todayStart && aptDate < todayEnd && apt.status === 'confirmed';
    });
    
    setPendingAppointments(pending);
    setTodayAppointments(todayApts);
    
    // Calculate earnings (mock calculation)
    const completedAppointments = appointments.filter((apt) => apt.status === 'completed');
    const consultationFee = (user?.profile as any)?.consultationFee || 25;
    
    const todayEarnings = completedAppointments
      .filter((apt) => {
        const aptDate = new Date(apt.scheduledDateTime);
        return aptDate >= todayStart && aptDate < todayEnd;
      })
      .reduce((sum) => sum + consultationFee, 0);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEarnings = completedAppointments
      .filter((apt) => new Date(apt.scheduledDateTime) >= monthStart)
      .reduce((sum) => sum + consultationFee, 0);
    
    const totalEarnings = completedAppointments
      .reduce((sum) => sum + consultationFee, 0);
    
    setEarnings({
      today: todayEarnings,
      thisMonth: monthEarnings,
      total: totalEarnings,
    });
  }, [appointments, user]);

  const handleAcceptAppointment = async (appointmentId: string) => {
    await dispatch(updateAppointmentStatus({ appointmentId, status: 'payment_pending' }));
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to reject this appointment?')) {
      await dispatch(updateAppointmentStatus({ appointmentId, status: 'rejected' }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'payment_pending': return 'warning';
      case 'awaiting_acceptance': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.profile?.name || 'Admin'}!
      </Typography>

      <Grid container spacing={3}>
        {/* Earnings Overview */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Earnings Overview
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Today
                  </Typography>
                  <Typography variant="h6" color="primary">
                    BHD {earnings.today.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    BHD {earnings.thisMonth.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Earnings
                  </Typography>
                  <Typography variant="h6">
                    BHD {earnings.total.toLocaleString()}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/earnings')}
                  fullWidth
                >
                  View Detailed Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Schedule */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" />
                Today's Schedule ({todayAppointments.length} appointments)
              </Typography>
              {todayAppointments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No appointments scheduled for today.
                </Typography>
              ) : (
                <List>
                  {todayAppointments.map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1">
                              {appointment.patient?.name || 'Patient'}
                            </Typography>
                            <Chip
                              size="small"
                              label={formatStatus(appointment.status)}
                              color={getStatusColor(appointment.status) as any}
                            />
                            {appointment.type === 'online' && <VideoCallIcon color="primary" />}
                            {appointment.type === 'physical' && <LocationOnIcon color="action" />}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2">
                            {format(new Date(appointment.scheduledDateTime), 'p')}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>

                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Appointment Requests */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Appointment Requests ({pendingAppointments.length})
              </Typography>
              {pendingAppointments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No pending appointment requests.
                </Typography>
              ) : (
                <List>
                  {pendingAppointments.map((appointment) => (
                    <ListItem
                      key={appointment.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1">
                              {appointment.patient?.name || 'Patient'}
                            </Typography>
                            <Chip
                              size="small"
                              label={appointment.type}
                              variant="outlined"
                            />
                            {appointment.type === 'online' && <VideoCallIcon color="primary" />}
                            {appointment.type === 'physical' && <LocationOnIcon color="action" />}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {format(new Date(appointment.scheduledDateTime), 'PPP p')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Requested: {format(new Date(appointment.createdAt), 'PPP')}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => handleAcceptAppointment(appointment.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={() => handleRejectAppointment(appointment.id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/schedule')}
                  fullWidth
                >
                  Manage Schedule
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/appointments')}
                  fullWidth
                >
                  View All Appointments
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/profile')}
                  fullWidth
                >
                  Update Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Appointments</Typography>
                    <Typography variant="body2">{appointments.length}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((appointments.length / 100) * 100, 100)} 
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Completed</Typography>
                    <Typography variant="body2">
                      {appointments.filter((apt) => apt.status === 'completed').length}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={appointments.length > 0 ? (appointments.filter((apt) => apt.status === 'completed').length / appointments.length) * 100 : 0}
                    color="success"
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Average Rating</Typography>
                    <Typography variant="body2">
                      {(user?.profile as any)?.rating?.toFixed(1) || 'N/A'} ⭐
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminDashboard;