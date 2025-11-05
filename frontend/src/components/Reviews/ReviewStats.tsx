import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  LinearProgress,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { Star } from '@mui/icons-material';

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

interface ReviewStatsProps {
  doctorId: string;
}

export const ReviewStatsComponent: React.FC<ReviewStatsProps> = ({ doctorId }) => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/reviews/doctor/${doctorId}/stats`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch review statistics');
        }

        const data: ReviewStats = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [doctorId]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Patient Reviews
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No reviews yet. Be the first to leave a review!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getRatingPercentage = (rating: number) => {
    return stats.totalReviews > 0 
      ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 
      : 0;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Patient Reviews
        </Typography>
        
        <Grid container spacing={3}>
          {/* Overall Rating */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                {stats.averageRating.toFixed(1)}
              </Typography>
              <Rating 
                value={stats.averageRating} 
                readOnly 
                precision={0.1}
                size="large"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Grid>

          {/* Rating Distribution */}
          <Grid item xs={12} md={6}>
            <Box>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 60 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {rating}
                    </Typography>
                    <Star sx={{ fontSize: 16, color: 'gold' }} />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getRatingPercentage(rating)}
                    sx={{ 
                      flex: 1, 
                      mx: 2, 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'grey.200'
                    }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                    {stats.ratingDistribution[rating] || 0}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};