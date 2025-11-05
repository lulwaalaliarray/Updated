import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Chip,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
// Using native HTML datetime-local input for now
import { addHours, addDays, isBefore, isAfter } from 'date-fns';
import { useAppDispatch } from '../../hooks/redux';
import { createAppointment } from '../../store/slices/appointmentSlice';
import { DoctorProfile } from '../../types';

interface AppointmentBookingProps {
  open: boolean;
  onClose: () => void;
  doctor: DoctorProfile;
}

function AppointmentBooking({ open, onClose, doctor }: AppointmentBookingProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  
  const [appointmentType, setAppointmentType] = useState<'online' | 'physical'>('online');
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const minDate = addHours(new Date(), 24); // 24 hours from now
  const maxDate = addDays(new Date(), 2); // 48 hours from now

  const handleSubmit = async () => {
    if (!selectedDateTime) {
      setError('Please select a date and time');
      return;
    }

    if (isBefore(selectedDateTime, minDate)) {
      setError('Appointments must be booked at least 24 hours in advance');
      return;
    }

    if (isAfter(selectedDateTime, maxDate)) {
      setError('Appointments cannot be booked more than 48 hours in advance');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await dispatch(createAppointment({
        doctorId: doctor.userId,
        scheduledDateTime: selectedDateTime.toISOString(),
        type: appointmentType,
        notes,
      })).unwrap();

      onClose();
      // Reset form
      setSelectedDateTime(null);
      setNotes('');
      setAppointmentType('online');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError(null);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
        <DialogTitle>
          <Typography variant="h6">
            Book Appointment with Dr. {doctor.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {doctor.specializations?.join(', ')}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Doctor Info */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                borderRadius: 1,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                alignItems: isMobile ? 'flex-start' : 'center',
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Dr. {doctor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doctor.yearsOfExperience} years experience
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doctor.clinicInfo?.name}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: isMobile ? 'left' : 'right' }}>
                  <Typography variant="h6" color="primary">
                    ₹{doctor.consultationFee?.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Consultation Fee
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Appointment Type */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Consultation Type</FormLabel>
                <RadioGroup
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as 'online' | 'physical')}
                  row={!isMobile}
                >
                  <FormControlLabel
                    value="online"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideoCallIcon color="primary" />
                        <Box>
                          <Typography variant="body2">Online Consultation</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Video call via Zoom
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="physical"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon color="action" />
                        <Box>
                          <Typography variant="body2">In-Person Visit</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Visit clinic
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Date and Time Selection */}
            <Grid item xs={12}>
              <TextField
                label="Select Date and Time"
                type="datetime-local"
                fullWidth
                value={selectedDateTime ? selectedDateTime.toISOString().slice(0, 16) : ''}
                onChange={(e) => setSelectedDateTime(e.target.value ? new Date(e.target.value) : null)}
                inputProps={{
                  min: minDate.toISOString().slice(0, 16),
                  max: maxDate.toISOString().slice(0, 16),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Appointments can be booked 24-48 hours in advance
              </Typography>
            </Grid>

            {/* Additional Notes */}
            <Grid item xs={12}>
              <TextField
                label="Additional Notes (Optional)"
                multiline
                rows={3}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your symptoms or reason for consultation..."
              />
            </Grid>

            {/* Booking Rules */}
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>Booking Guidelines:</strong>
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Payment must be completed within 15 minutes of doctor acceptance</li>
                  <li>Cancellations allowed up to 24 hours before appointment</li>
                  <li>You will receive meeting details after payment confirmation</li>
                </ul>
              </Alert>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {error}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || !selectedDateTime}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
  );
}

export default AppointmentBooking;