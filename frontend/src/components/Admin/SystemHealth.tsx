import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Button,
  Divider
} from '@mui/material';
import {
  CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Memory as MemoryIcon,
  Speed as CpuIcon,
  Schedule as UptimeIcon
} from '@mui/icons-material';
import { SystemHealth as SystemHealthType } from '../../types/admin';

export const SystemHealth: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthType | null>(null);
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

  useEffect(() => {
    fetchSystemHealth();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }

      const data = await response.json();
      setHealth(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getServiceStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return <HealthyIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <WarningIcon />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getMemoryUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  if (loading && !health) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          System Health
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchSystemHealth}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {health && (
        <Grid container spacing={3}>
          {/* Overall System Status */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    {getServiceStatusIcon(health.status)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      System Status: {health.status.toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Last updated: {new Date(health.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Service Status */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Service Status
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(health.services).map(([service, status]) => (
                    <Grid item xs={12} sm={6} md={4} key={service}>
                      <Box display="flex" alignItems="center" p={1} border={1} borderColor="divider" borderRadius={1}>
                        {getServiceStatusIcon(status)}
                        <Box ml={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {service.charAt(0).toUpperCase() + service.slice(1)}
                          </Typography>
                          <Chip
                            label={status}
                            color={getServiceStatusColor(status) as any}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* System Metrics */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <UptimeIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Uptime</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {formatUptime(health.metrics.uptime)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  System has been running
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <MemoryIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Memory Usage</Typography>
                </Box>
                <Box mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Heap Used: {formatBytes(health.metrics.memoryUsage.heapUsed)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Heap Total: {formatBytes(health.metrics.memoryUsage.heapTotal)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getMemoryUsagePercentage(
                    health.metrics.memoryUsage.heapUsed,
                    health.metrics.memoryUsage.heapTotal
                  )}
                  color={
                    getMemoryUsagePercentage(
                      health.metrics.memoryUsage.heapUsed,
                      health.metrics.memoryUsage.heapTotal
                    ) > 80 ? 'error' : 'primary'
                  }
                />
                <Typography variant="caption" color="textSecondary">
                  {getMemoryUsagePercentage(
                    health.metrics.memoryUsage.heapUsed,
                    health.metrics.memoryUsage.heapTotal
                  )}% used
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CpuIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">CPU Usage</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  User: {(health.metrics.cpuUsage.user / 1000000).toFixed(2)}s
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  System: {(health.metrics.cpuUsage.system / 1000000).toFixed(2)}s
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  CPU time used since process start
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Memory Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detailed Memory Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                      <Typography variant="body2" color="textSecondary">
                        RSS (Resident Set Size)
                      </Typography>
                      <Typography variant="h6">
                        {formatBytes(health.metrics.memoryUsage.rss)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                      <Typography variant="body2" color="textSecondary">
                        Heap Total
                      </Typography>
                      <Typography variant="h6">
                        {formatBytes(health.metrics.memoryUsage.heapTotal)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                      <Typography variant="body2" color="textSecondary">
                        Heap Used
                      </Typography>
                      <Typography variant="h6">
                        {formatBytes(health.metrics.memoryUsage.heapUsed)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                      <Typography variant="body2" color="textSecondary">
                        External
                      </Typography>
                      <Typography variant="h6">
                        {formatBytes(health.metrics.memoryUsage.external)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Health Check Guidelines */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Health Check Guidelines
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Service Status Indicators:
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                      <HealthyIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">Healthy - Service is operating normally</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <WarningIcon color="warning" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">Warning - Service has minor issues</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <ErrorIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">Error - Service is down or has critical issues</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Memory Usage Thresholds:
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      • &lt; 70% - Normal operation
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      • 70-80% - Monitor closely
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      • &gt; 80% - Consider scaling or optimization
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};