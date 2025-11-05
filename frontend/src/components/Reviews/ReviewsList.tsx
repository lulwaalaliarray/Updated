import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper
} from '@mui/material';
import { ReviewCard } from './ReviewCard';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  patient: {
    id: string;
    name: string;
  };
  appointment: {
    id: string;
    scheduledDateTime: string;
    type: string;
  };
}

interface ReviewsListProps {
  doctorId: string;
  showPatientNames?: boolean;
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  doctorId,
  showPatientNames = false
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (ratingFilter !== 'all') {
        params.append('rating', ratingFilter);
      }

      const response = await fetch(`/api/reviews/doctor/${doctorId}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data: ReviewsResponse = await response.json();
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [doctorId, page, ratingFilter]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleRatingFilterChange = (event: any) => {
    setRatingFilter(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Patient Reviews ({reviews.length > 0 ? `${(page - 1) * 10 + 1}-${Math.min(page * 10, reviews.length)} of many` : '0'})
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter by Rating</InputLabel>
          <Select
            value={ratingFilter}
            label="Filter by Rating"
            onChange={handleRatingFilterChange}
          >
            <MenuItem value="all">All Ratings</MenuItem>
            <MenuItem value="5">5 Stars</MenuItem>
            <MenuItem value="4">4 Stars</MenuItem>
            <MenuItem value="3">3 Stars</MenuItem>
            <MenuItem value="2">2 Stars</MenuItem>
            <MenuItem value="1">1 Star</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {reviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No reviews found for the selected criteria.
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            {reviews.map((review) => (
              <Grid item xs={12} key={review.id}>
                <ReviewCard 
                  review={review} 
                  showPatientName={showPatientNames}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};