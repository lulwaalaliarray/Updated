import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Avatar,
  Chip
} from '@mui/material';
import { format } from 'date-fns';

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

interface ReviewCardProps {
  review: Review;
  showPatientName?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showPatientName = false
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {getInitials(review.patient.name)}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              {showPatientName && (
                <Typography variant="subtitle2" fontWeight="bold">
                  {review.patient.name}
                </Typography>
              )}
              <Rating value={review.rating} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                {formatDate(review.createdAt)}
              </Typography>
            </Box>

            {review.comment && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 2,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {review.comment}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={review.appointment.type === 'ONLINE' ? 'Online Consultation' : 'In-Person Visit'}
                size="small"
                variant="outlined"
                color={review.appointment.type === 'ONLINE' ? 'primary' : 'secondary'}
              />
              <Chip
                label={formatDate(review.appointment.scheduledDateTime)}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};