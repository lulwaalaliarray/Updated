import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  LocationOn as LocationOnIcon,
  Cancel as CancelIcon,
  RateReview as ReviewIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchAppointments, cancelAppointment } from '../store/slices/appointmentSlice';
import { Appointment } from '../types';

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
      id={`appointments-tabpanel-${index}`}
      aria-labelledby={`appointments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function AppointmentsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { appointments, isLoading } = useAppSelector((state) => state.appointments);
  const { user } = useAppSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  const [filteredAppointments, setFilteredAppointments] = useState<{
    upcoming: Appointment[];
    completed: Appointment[];
    cancelled: Appointment[];
  }>({
    upcoming: [],
    completed: [],
    cancelled: [],
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchAppointments());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const now = new Date();
    
    const upcoming = appointments.filter(apt => 
      ['awaiting_acceptance', 'payment_pending', 'confirmed'].includes(apt.status) ||
      (new Date(apt.scheduledDateTime) > now && apt.status !== 'cancelled')
    );
    
    const completed = appointments.filter(apt => apt.status === 'completed');
    
    const cancelled = appointments.filter(apt => 
      apt.status === 'cancelled' || apt.status === 'rejected'
    );
    
    setFilteredAppointments({ upcoming, completed, cancelled });
  }, [appointments]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await dispatch(cancelAppointment({ 
        appointmentId, 
        reason: 'Cancelled by user' 
      }));
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

  const renderAppointmentList = (appointmentList: Appointment[]) => {
    if (appointmentList.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No appointments found.
        </Typography>
      );
    }

    return (
      <List>
        {appointmentList.map((appointment) => (
          <Card key={appointment.id} sx={{ mb: 2 }}>
            <CardContent>
              <ListItem
                sx={{
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  p: 0,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Typography variant="h6">
                        {user?.role === 'patient' 
                          ? `Dr. ${appointment.doctor?.name || 'Unknown'}`
                          : appointment.patient?.name || 'Patient'
                        }
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
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        {format(new Date(appointment.scheduledDateTime), 'PPP p')}
                      </Typography>
                      {user?.role === 'patient' && appointment.doctor?.specializations && (
                        <Typography variant="caption" color="text.secondary">
                          {appointment.doctor.specializations.join(', ')}
                        </Typography>
                      )}
                      {appointment.consultationNotes && user?.userType === 'doctor' && (
                        <Box sx={{ mt: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontStyle: 'italic',
                              backgroundColor: '#f8fafc',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <strong>Notes:</strong> {appointment.consultationNotes.length > 80 
                              ? `${appointment.consultationNotes.substring(0, 80).trim()}...` 
                              : appointment.consultationNotes}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexDirection: isMobile ? 'column' : 'row',
                    mt: isMobile ? 2 : 0,
                  }}>
                    {appointment.status === 'payment_pending' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        startIcon={<PaymentIcon />}
                        onClick={() => navigate(`/appointments/${appointment.id}/payment`)}
                      >
                        Pay Now
                      </Button>
                    )}
                    

                    
                    {appointment.status === 'completed' && user?.role === 'patient' && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReviewIcon />}
                        onClick={() => navigate(`/appointments/${appointment.id}/review`)}
                      >
                        Review
                      </Button>
                    )}
                    
                    {['awaiting_acceptance', 'payment_pending', 'confirmed'].includes(appointment.status) && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        <CancelIcon />
                      </IconButton>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </CardContent>
          </Card>
        ))}
      </List>
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Appointments
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
        >
          <Tab label={`Upcoming (${filteredAppointments.upcoming.length})`} />
          <Tab label={`Completed (${filteredAppointments.completed.length})`} />
          <Tab label={`Cancelled (${filteredAppointments.cancelled.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderAppointmentList(filteredAppointments.upcoming)}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderAppointmentList(filteredAppointments.completed)}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderAppointmentList(filteredAppointments.cancelled)}
      </TabPanel>
    </Box>
  );
}

export default AppointmentsPage;