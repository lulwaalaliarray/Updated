import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Pagination,
  Alert,
  Skeleton
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Edit,
  Delete,
  Download,
  Description,
  Image,
  PictureAsPdf
} from '@mui/icons-material';
import { format } from 'date-fns';

interface MedicalDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  documentType: 'LAB_REPORT' | 'PRESCRIPTION' | 'SCAN' | 'OTHER';
  description?: string;
  uploadedAt: string;
}

interface MedicalDocumentListProps {
  patientId: string;
  onDocumentUpdate?: () => void;
}

type DocumentType = 'LAB_REPORT' | 'PRESCRIPTION' | 'SCAN' | 'OTHER';

const documentTypeLabels: Record<DocumentType, string> = {
  LAB_REPORT: 'Lab Report',
  PRESCRIPTION: 'Prescription',
  SCAN: 'Medical Scan',
  OTHER: 'Other'
};

const documentTypeColors: Record<DocumentType, 'primary' | 'secondary' | 'success' | 'warning'> = {
  LAB_REPORT: 'primary',
  PRESCRIPTION: 'success',
  SCAN: 'secondary',
  OTHER: 'warning'
};

export const MedicalDocumentList: React.FC<MedicalDocumentListProps> = ({
  patientId,
  onDocumentUpdate
}) => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editDocumentType, setEditDocumentType] = useState<DocumentType>('OTHER');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `/api/v1/medical-history/patients/${patientId}/documents?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch documents');
      }

      const result = await response.json();
      setDocuments(result.data);
      setTotalPages(result.pagination.totalPages);
      setError(null);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [patientId, page]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: MedicalDocument) => {
    setAnchorEl(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleView = () => {
    if (selectedDocument) {
      window.open(selectedDocument.fileUrl, '_blank');
    }
    handleMenuClose();
  };

  const handleDownload = () => {
    if (selectedDocument) {
      const link = document.createElement('a');
      link.href = selectedDocument.fileUrl;
      link.download = selectedDocument.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedDocument) {
      setEditDescription(selectedDocument.description || '');
      setEditDocumentType(selectedDocument.documentType);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleEditSave = async () => {
    if (!selectedDocument) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `/api/v1/medical-history/documents/${selectedDocument.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: editDescription.trim() || undefined,
            documentType: editDocumentType
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update document');
      }

      setEditDialogOpen(false);
      fetchDocuments();
      onDocumentUpdate?.();
    } catch (error) {
      console.error('Error updating document:', error);
      setError(error instanceof Error ? error.message : 'Failed to update document');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `/api/v1/medical-history/documents/${selectedDocument.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete document');
      }

      setDeleteDialogOpen(false);
      fetchDocuments();
      onDocumentUpdate?.();
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <PictureAsPdf color="error" />;
    } else if (fileType.startsWith('image/')) {
      return <Image color="primary" />;
    }
    return <Description />;
  };

  if (loading) {
    return (
      <Box>
        {[...Array(3)].map((_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
            </CardContent>
          </Card>
        ))}
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
      {documents.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No medical documents found. Upload your first document to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Grid container spacing={2}>
            {documents.map((document) => (
              <Grid item xs={12} key={document.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                        {getFileIcon(document.fileType)}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {document.fileName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Chip
                              label={documentTypeLabels[document.documentType]}
                              color={documentTypeColors[document.documentType]}
                              size="small"
                            />
                          </Box>
                          {document.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {document.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Uploaded on {format(new Date(document.uploadedAt), 'MMM dd, yyyy at h:mm a')}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, document)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <Download sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Document</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={editDocumentType}
              label="Document Type"
              onChange={(e) => setEditDocumentType(e.target.value as DocumentType)}
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
            label="Description"
            multiline
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Add any relevant notes about this document..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedDocument?.fileName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};