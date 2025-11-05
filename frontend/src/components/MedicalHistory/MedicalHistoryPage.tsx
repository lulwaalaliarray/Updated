import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search, Description, Assessment, LocalHospital, Assignment } from '@mui/icons-material';
import { MedicalDocumentUpload } from './MedicalDocumentUpload';
import { MedicalDocumentList } from './MedicalDocumentList';

interface MedicalHistorySummary {
  patientId: string;
  totalDocuments: number;
  documentsByType: {
    LAB_REPORT: number;
    PRESCRIPTION: number;
    SCAN: number;
    OTHER: number;
  };
  recentDocuments: any[];
  lastUploadDate?: string;
}

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
      id={`medical-history-tabpanel-${index}`}
      aria-labelledby={`medical-history-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const MedicalHistoryPage: React.FC = () => {
  const [summary, setSummary] = useState<MedicalHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    // Get patient ID from user profile
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/v1/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      if (userData.patientProfile) {
        setPatientId(userData.patientProfile.id);
        fetchMedicalHistorySummary(userData.patientProfile.id);
      } else {
        setError('Patient profile not found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch patient profile');
      setLoading(false);
    }
  };

  const fetchMedicalHistorySummary = async (patientId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `/api/v1/medical-history/patients/${patientId}/summary`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch medical history summary');
      }

      const summaryData = await response.json();
      setSummary(summaryData);
      setError(null);
    } catch (error) {
      console.error('Error fetching medical history summary:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch medical history summary');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (document: any) => {
    // Refresh summary after successful upload
    if (patientId) {
      fetchMedicalHistorySummary(patientId);
    }
  };

  const handleUploadError = (error: string) => {
    setError(error);
  };

  const handleDocumentUpdate = () => {
    // Refresh summary after document update/delete
    if (patientId) {
      fetchMedicalHistorySummary(patientId);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const documentTypeLabels = {
    LAB_REPORT: 'Lab Reports',
    PRESCRIPTION: 'Prescriptions',
    SCAN: 'Medical Scans',
    OTHER: 'Other Documents'
  };

  const documentTypeIcons = {
    LAB_REPORT: <Assessment color="primary" />,
    PRESCRIPTION: <LocalHospital color="success" />,
    SCAN: <Description color="secondary" />,
    OTHER: <Assignment color="warning" />
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Medical History
      </Typography>

      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Description color="primary" />
                  <Box>
                    <Typography variant="h6">{summary.totalDocuments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Documents
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {Object.entries(summary.documentsByType).map(([type, count]) => (
            <Grid item xs={12} sm={6} md={3} key={type}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {documentTypeIcons[type as keyof typeof documentTypeIcons]}
                    <Box>
                      <Typography variant="h6">{count}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {documentTypeLabels[type as keyof typeof documentTypeLabels]}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Upload Document" />
          <Tab label="My Documents" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MedicalDocumentUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload Guidelines
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Supported formats: JPEG, PNG, GIF, PDF
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Maximum file size: 10MB
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Choose the appropriate document type for better organization
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  • Add descriptions to help identify documents later
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • All documents are securely stored and encrypted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={filterType}
                  label="Filter by Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="LAB_REPORT">Lab Reports</MenuItem>
                  <MenuItem value="PRESCRIPTION">Prescriptions</MenuItem>
                  <MenuItem value="SCAN">Medical Scans</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {patientId && (
          <MedicalDocumentList
            patientId={patientId}
            onDocumentUpdate={handleDocumentUpdate}
          />
        )}
      </TabPanel>
    </Container>
  );
};