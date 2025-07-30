import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import { uploadFile } from '../../firebase/services/files';

interface FileUploadProps {
  onUploadComplete: (data: any) => void;
  type: 'equity' | 'forex' | 'price' | 'client';
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  type,
  accept = '.csv'
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await uploadFile(file, type);
      setSuccess(true);
      onUploadComplete(result);
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <input
        accept={accept}
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <label htmlFor="raised-button-file">
        <Button
          variant="contained"
          component="span"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Uploading...
            </>
          ) : (
            'Upload CSV'
          )}
        </Button>
      </label>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          File uploaded successfully
        </Alert>
      )}

      {uploading && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Processing file... Please wait.
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload; 