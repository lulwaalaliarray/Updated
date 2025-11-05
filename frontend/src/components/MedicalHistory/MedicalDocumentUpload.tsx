import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface MedicalDocumentUploadProps {
  onUploadSuccess: (document: any) => void;
  onUploadError: (error: string) => void;
}

type DocumentType = 'LAB_REPORT' | 'PRESCRIPTION' | 'SCAN' | 'OTHER';

const documentTypeLabels: Record<DocumentType, string> = {
  LAB_REPORT: 'Lab Report',
  PRESCRIPTION: 'Prescription',
  SCAN: 'Medical Scan',
  OTHER: 'Other'
};

export const MedicalDocumentUpload: React.FC<MedicalDocumentUploadProps> = ({
  onUploadSuccess,
  onUploadError
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('OTHER');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid file type (JPEG, PNG, GIF, or PDF)');
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', documentType);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/v1/medical-history/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const result = await response.json();
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('OTHER');
      setDescription('');
      setUploadProgress(0);
      
      onUploadSuccess(result);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      onUploadError(errorMessage);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Medical Document
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUpload />}
            disabled={uploading}
            fullWidth
            sx={{ mb: 2 }}
          >
            Select File
            <VisuallyHiddenInput
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.pdf"
              onChange={handleFileSelect}
            />
          </Button>

          {selectedFile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Description color="primary" />
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Document Type</InputLabel>
          <Select
            value={documentType}
            label="Document Type"
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            disabled={uploading}
          >
            {Object.entries(documentTypeLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Description (Optional)"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
          sx={{ mb: 2 }}
          placeholder="Add any relevant notes about this document..."
        />

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          fullWidth
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </CardContent>
    </Card>
  );
};