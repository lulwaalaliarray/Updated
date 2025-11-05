import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAppSelector } from '../../hooks/redux';
import { Appointment } from '../../types';

function PaymentPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  
  const { appointments } = useAppSelector((state) => state.appointments);
  const { user } = useAppSelector((state) => state.auth);
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [error, setError] = useState<string | null>(null);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (appointmentId) {
      const apt = appointments.find(a => a.id === appointmentId);
      if (apt) {
        setAppointment(apt);
      } else {
        // Fetch appointment details if not in store
        fetchAppointmentDetails();
      }
    }
  }, [appointmentId, appointments]);

  const fetchAppointmentDetails = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointment(data);
      } else {
        setError('Failed to load appointment details');
      }
    } catch (err) {
      setError('Failed to load appointment details');
    }
  };

  const handlePayment = async () => {
    if (!appointment) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          amount: appointment.doctor?.consultationFee || 0,
          currency: 'INR',
          paymentMethod,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const paymentData = await response.json();
      
      // Simulate payment processing (in real app, integrate with Stripe/Razorpay)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process payment
      const processResponse = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentIntentId: paymentData.id,
          appointmentId: appointment.id,
        }),
      });
      
      if (processResponse.ok) {
        navigate('/appointments', { 
          state: { message: 'Payment successful! Your appointment is confirmed.' }
        });
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!appointment) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (appointment.paymentStatus === 'completed') {
    return (
      <Box textAlign="center" sx={{ py: 4 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Payment Already Completed
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          This appointment has already been paid for.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/appointments')}>
          View Appointments
        </Button>
      </Box>
    );
  }

  const consultationFee = appointment.doctor?.consultationFee || 0;
  const platformFee = Math.round(consultationFee * 0.05); // 5% platform fee
  const totalAmount = consultationFee + platformFee;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Complete Payment
      </Typography>

      <Grid container spacing={3}>
        {/* Appointment Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appointment Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Typography variant="body1">
                    <strong>Doctor:</strong> Dr. {appointment.doctor?.name}
                  </Typography>
                  <Chip 
                    label={appointment.type} 
                    color={appointment.type === 'online' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </Box>
                <Typography variant="body1">
                  <strong>Date & Time:</strong> {format(new Date(appointment.scheduledDateTime), 'PPP p')}
                </Typography>
                <Typography variant="body1">
                  <strong>Specialization:</strong> {appointment.doctor?.specializations?.join(', ')}
                </Typography>
                {appointment.doctor?.clinicInfo && (
                  <Typography variant="body1">
                    <strong>Clinic:</strong> {appointment.doctor.clinicInfo.name}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCardIcon />
                Payment Method
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
                    fullWidth
                    onClick={() => setPaymentMethod('card')}
                  >
                    Credit/Debit Card
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant={paymentMethod === 'upi' ? 'contained' : 'outlined'}
                    fullWidth
                    onClick={() => setPaymentMethod('upi')}
                  >
                    UPI
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant={paymentMethod === 'wallet' ? 'contained' : 'outlined'}
                    fullWidth
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    Wallet
                  </Button>
                </Grid>
              </Grid>

              {/* Security Notice */}
              <Alert 
                severity="info" 
                icon={<SecurityIcon />}
                sx={{ mb: 2 }}
              >
                Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
              </Alert>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handlePayment}
                disabled={isProcessing}
                sx={{ mt: 2 }}
              >
                {isProcessing ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₹${totalAmount.toLocaleString()}`
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: isMobile ? 'static' : 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Consultation Fee</Typography>
                  <Typography variant="body2">₹{consultationFee.toLocaleString()}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Platform Fee</Typography>
                  <Typography variant="body2">₹{platformFee.toLocaleString()}</Typography>
                </Box>
                
                <Divider />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total Amount</Typography>
                  <Typography variant="h6" color="primary">
                    ₹{totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Note:</strong> Payment must be completed at least 15 minutes before the appointment time. 
                  Refunds are available if cancelled 24 hours in advance.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PaymentPage;