import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Rating,
  TextField,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';

interface ReviewFormProps {
  appointmentId: string;
  doctorName: string;
  onSubmit: (reviewData: { rating: number; comment: string }) => Promise<void>;
  onCancel: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  appointmentId,
  doctorName,
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }

    if (comment.length > 1000) {
      setError('Comment must be less than 1000 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({ rating, comment });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Rate Your Experience with Dr. {doctorName}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography component="legend" sx={{ mb: 1 }}>
              Rating *
            </Typography>
            <Rating
              name="rating"
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              size="large"
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment (Optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this doctor..."
            helperText={`${comment.length}/1000 characters`}
            sx={{ mb: 3 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || rating === 0}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};