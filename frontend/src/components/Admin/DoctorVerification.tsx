import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  School as EducationIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AttachMoney as FeeIcon
} from '@mui/icons-material';
import { DoctorVerificationDetails, DoctorVerificationAction } from '../../types/admin';

export const DoctorVerification: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorVerificationDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorVerificationDetails | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/doctors/pending-verification', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending doctors');
      }

      const data = await response.json();
      setDoctors(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = (doctor: DoctorVerificationDetails, action: 'approve' | 'reject') => {
    setSelectedDoctor(doctor);
    setVerificationAction(action);
    setAdminNotes('');
    setVerificationDialogOpen(true);
  };

  const processVerification = async () => {
    if (!selectedDoctor || !verificationAction) return;

    try {
      setProcessing(true);

      const verificationData: DoctorVerificationAction = {
        doctorId: selectedDoctor.id,
        action: verificationAction,
        adminNotes: adminNotes.trim() || undefined
      };

      const response = await fetch(`/api/admin/doctors/${selectedDoctor.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(verificationData)
      });

      if (!response.ok) {
        throw new Error('Failed to process verification');
      }

      setVerificationDialogOpen(false);
      fetchPendingDoctors(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process verification');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Doctor Verification
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {doctors.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No doctors pending verification
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            All doctor registrations have been processed.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {doctors.map((doctor) => (
            <Grid item xs={12} md={6} lg={4} key={doctor.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      src={doctor.profilePicture}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{doctor.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {doctor.email}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {doctor.phone}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <EducationIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="medium">
                        License: {doctor.medicalLicenseNumber}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <WorkIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {doctor.yearsOfExperience} years experience
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <FeeIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        ${doctor.consultationFee} consultation fee
                      </Typography>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Specializations:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {doctor.specializations.map((spec, index) => (
                        <Chip key={index} label={spec} size="small" />
                      ))}
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Qualifications:
                    </Typography>
                    {doctor.qualifications.map((qual, index) => (
                      <Typography key={index} variant="body2" color="textSecondary">
                        • {qual}
                      </Typography>
                    ))}
                  </Box>

                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {doctor.clinicName}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {doctor.clinicAddress}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="textSecondary">
                    Submitted: {new Date(doctor.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleVerificationAction(doctor, 'approve')}
                    fullWidth
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => handleVerificationAction(doctor, 'reject')}
                    fullWidth
                  >
                    Reject
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Verification Dialog */}
      <Dialog 
        open={verificationDialogOpen} 
        onClose={() => setVerificationDialogOpen(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {verificationAction === 'approve' ? 'Approve Doctor' : 'Reject Doctor'}
        </DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedDoctor.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                License: {selectedDoctor.medicalLicenseNumber}
              </Typography>

              <Box mt={3}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={verificationAction === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    verificationAction === 'approve' 
                      ? 'Add any notes about the approval...'
                      : 'Please provide a reason for rejection...'
                  }
                />
              </Box>

              {verificationAction === 'reject' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  The doctor will be notified about the rejection and the reason provided.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialogOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={processVerification} 
            variant="contained"
            color={verificationAction === 'approve' ? 'success' : 'error'}
            disabled={processing || (verificationAction === 'reject' && !adminNotes.trim())}
          >
            {processing ? <CircularProgress size={20} /> : 
             verificationAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};