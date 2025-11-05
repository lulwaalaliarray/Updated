import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { UserManagementResult, UserManagementFilters, UserStatusUpdate, PaginatedResult } from '../../types/admin';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<PaginatedResult<UserManagementResult> | null>(null);
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

  const [filters, setFilters] = useState<UserManagementFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedUser, setSelectedUser] = useState<UserManagementResult | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<UserStatusUpdate>({});

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof UserManagementFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: field !== 'page' ? 1 : value // Reset to first page when changing filters
    }));
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    handleFilterChange('page', newPage + 1);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('limit', parseInt(event.target.value, 10));
  };

  const handleEditUser = (user: UserManagementResult) => {
    setSelectedUser(user);
    setStatusUpdate({
      isActive: user.isActive,
      isVerified: user.isVerified
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUserStatus = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(statusUpdate)
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      setEditDialogOpen(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DOCTOR': return 'primary';
      case 'PATIENT': return 'success';
      case 'ADMIN': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  if (loading && !users) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={filters.searchTerm || ''}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon />
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filters.role || ''}
              label="Role"
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PATIENT">Patient</MenuItem>
              <MenuItem value="DOCTOR">Doctor</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
              label="Status"
              onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Verified</InputLabel>
            <Select
              value={filters.isVerified !== undefined ? filters.isVerified.toString() : ''}
              label="Verified"
              onChange={(e) => handleFilterChange('isVerified', e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Verified</MenuItem>
              <MenuItem value="false">Unverified</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={fetchUsers}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {user.profile.name}
                    </Typography>
                    {user.profile.phone && (
                      <Typography variant="caption" color="textSecondary">
                        {user.profile.phone}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Active' : 'Inactive'}
                    color={getStatusColor(user.isActive) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isVerified ? 'Verified' : 'Unverified'}
                    color={user.isVerified ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEditUser(user)}
                    title="Edit User"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {users && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={users.pagination.total}
            rowsPerPage={users.pagination.limit}
            page={users.pagination.page - 1}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Status</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedUser.profile.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {selectedUser.email} • {selectedUser.role}
              </Typography>

              <Box mt={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={statusUpdate.isActive || false}
                      onChange={(e) => setStatusUpdate(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Box>

              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={statusUpdate.isVerified || false}
                      onChange={(e) => setStatusUpdate(prev => ({ ...prev, isVerified: e.target.checked }))}
                    />
                  }
                  label="Verified"
                />
              </Box>

              {selectedUser.role === 'DOCTOR' && selectedUser.profile.specializations && (
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Specializations: {selectedUser.profile.specializations.join(', ')}
                  </Typography>
                  {selectedUser.profile.licenseVerified !== undefined && (
                    <Typography variant="body2" color="textSecondary">
                      License Verified: {selectedUser.profile.licenseVerified ? 'Yes' : 'No'}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateUserStatus} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};