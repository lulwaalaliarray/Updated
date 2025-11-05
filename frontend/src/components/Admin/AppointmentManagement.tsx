import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocalHospital as DoctorIcon
} from '@mui/icons-material';

interface AppointmentFilters {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
  patientId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AppointmentResult {
  id: string;
  scheduledDateTime: string;
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    age: number;
    gender: string;
  };
  doctor: {
    id: string;
    name: string;
    specializations: string[];
    consultationFee: number;
    clinicName: string;
    clinicAddress: string;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    processedAt?: string;
  };
}

interface PaginatedAppointments {
  data: AppointmentResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<PaginatedAppointments | null>(null);
  const [loading, setLoading] = useState(false);
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

  const [filters, setFilters] = useState<AppointmentFilters>({
    page: 1,
    limit: 10,
    sortBy: 'scheduledDateTime',
    sortOrder: 'desc'
  });
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResult | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/appointments?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof AppointmentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : value
    }));
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    handleFilterChange('page', newPage + 1);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('limit', parseInt(event.target.value, 10));
  };

  const handleViewDetails = (appointment: AppointmentResult) => {
    setSelectedAppointment(appointment);
    setDetailsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'completed': return 'info';
      case 'awaiting_acceptance': return 'warning';
      case 'payment_pending': return 'warning';
      case 'cancelled': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    return type.toLowerCase() === 'online' ? 'primary' : 'secondary';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Appointment Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="AWAITING_ACCEPTANCE">Awaiting Acceptance</MenuItem>
                <MenuItem value="PAYMENT_PENDING">Payment Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type || ''}
                label="Type"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="ONLINE">Online</MenuItem>
                <MenuItem value="PHYSICAL">Physical</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Date From"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Date To"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy || 'scheduledDateTime'}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="scheduledDateTime">Date</MenuItem>
                <MenuItem value="createdAt">Created</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAppointments}
              disabled={loading}
              fullWidth
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Appointments Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments?.data.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDateTime(appointment.scheduledDateTime)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Created: {new Date(appointment.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2">{appointment.patient.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {appointment.patient.age}y, {appointment.patient.gender}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <DoctorIcon fontSize="small" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2">{appointment.doctor.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {appointment.doctor.specializations.slice(0, 2).join(', ')}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.type}
                      color={getTypeColor(appointment.type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status.replace('_', ' ')}
                      color={getStatusColor(appointment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {appointment.payment ? (
                      <Box>
                        <Typography variant="body2">
                          {formatCurrency(appointment.payment.amount)}
                        </Typography>
                        <Chip
                          label={appointment.payment.status}
                          color={getStatusColor(appointment.payment.status) as any}
                          size="small"
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No payment
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(appointment)}
                      title="View Details"
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {appointments && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={appointments.pagination.total}
            rowsPerPage={appointments.pagination.limit}
            page={appointments.pagination.page - 1}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
      </TableContainer>

      {/* Appointment Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Patient Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedAppointment.patient.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {selectedAppointment.patient.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Age:</strong> {selectedAppointment.patient.age}
                </Typography>
                <Typography variant="body2">
                  <strong>Gender:</strong> {selectedAppointment.patient.gender}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Doctor Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedAppointment.doctor.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Specializations:</strong> {selectedAppointment.doctor.specializations.join(', ')}
                </Typography>
                <Typography variant="body2">
                  <strong>Clinic:</strong> {selectedAppointment.doctor.clinicName}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {selectedAppointment.doctor.clinicAddress}
                </Typography>
                <Typography variant="body2">
                  <strong>Fee:</strong> {formatCurrency(selectedAppointment.doctor.consultationFee)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Appointment Details
                </Typography>
                <Typography variant="body2">
                  <strong>Date & Time:</strong> {formatDateTime(selectedAppointment.scheduledDateTime)}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {selectedAppointment.type}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedAppointment.status}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {formatDateTime(selectedAppointment.createdAt)}
                </Typography>
                {selectedAppointment.notes && (
                  <Typography variant="body2">
                    <strong>Notes:</strong> {selectedAppointment.notes}
                  </Typography>
                )}
              </Grid>

              {selectedAppointment.payment && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Payment Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Amount:</strong> {formatCurrency(selectedAppointment.payment.amount)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {selectedAppointment.payment.status}
                  </Typography>
                  {selectedAppointment.payment.processedAt && (
                    <Typography variant="body2">
                      <strong>Processed:</strong> {formatDateTime(selectedAppointment.payment.processedAt)}
                    </Typography>
                  )}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};