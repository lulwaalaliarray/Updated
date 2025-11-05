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
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import { 
  PaymentTransactionResult, 
  PaymentTransactionFilters, 
  PaymentReconciliation,
  PaginatedResult 
} from '../../types/admin';

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
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const PaymentMonitoring: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState<PaginatedResult<PaymentTransactionResult> | null>(null);
  const [reconciliation, setReconciliation] = useState<PaymentReconciliation | null>(null);
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

  const [filters, setFilters] = useState<PaymentTransactionFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    if (tabValue === 0) {
      fetchTransactions();
    } else if (tabValue === 1) {
      fetchReconciliation();
    }
  }, [tabValue, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/payments/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchReconciliation = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/admin/payments/reconciliation?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reconciliation data');
      }

      const data = await response.json();
      setReconciliation(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reconciliation data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (field: keyof PaymentTransactionFilters, value: any) => {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Payment Monitoring
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Transactions" />
            <Tab label="Reconciliation" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Filters */}
          <Box p={2} borderBottom={1} borderColor="divider">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="FAILED">Failed</MenuItem>
                    <MenuItem value="REFUNDED">Refunded</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
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

              <Grid item xs={12} sm={6} md={3}>
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

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchTransactions}
                  disabled={loading}
                  fullWidth
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Transactions Table */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Appointment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions?.data.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {transaction.id.slice(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{transaction.patient.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {transaction.patient.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{transaction.doctor.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {transaction.doctor.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={getStatusColor(transaction.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </Typography>
                        {transaction.processedAt && (
                          <Typography variant="caption" color="textSecondary">
                            Processed: {new Date(transaction.processedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(transaction.appointment.scheduledDateTime).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {transaction.appointment.type}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {transactions && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={transactions.pagination.total}
                  rowsPerPage={transactions.pagination.limit}
                  page={transactions.pagination.page - 1}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              )}
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Reconciliation Report */}
          <Box p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Payment Reconciliation Report</Typography>
              <Button
                variant="outlined"
                startIcon={<ReportIcon />}
                onClick={fetchReconciliation}
                disabled={loading}
              >
                Generate Report
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : reconciliation ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Transactions
                      </Typography>
                      <Typography variant="h4">
                        {reconciliation.totalTransactions}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatCurrency(reconciliation.totalAmount)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Completed
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {reconciliation.completedTransactions}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatCurrency(reconciliation.completedAmount)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Pending
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {reconciliation.pendingTransactions}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatCurrency(reconciliation.pendingAmount)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Refunded
                      </Typography>
                      <Typography variant="h4" color="info.main">
                        {reconciliation.refundedTransactions}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {formatCurrency(reconciliation.refundedAmount)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {reconciliation.discrepancies.length > 0 && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="error">
                          Discrepancies Found
                        </Typography>
                        {reconciliation.discrepancies.map((discrepancy, index) => (
                          <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              {discrepancy.description}
                            </Typography>
                          </Alert>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Typography variant="body1" color="textSecondary" textAlign="center">
                Click "Generate Report" to view reconciliation data
              </Typography>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};