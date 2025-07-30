import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid';

interface EditForexModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (forexData: any) => void;
  forexData: {
    _id: string;
    ClientID: string;
    CurrencyPair: string;
    BaseCurrency: string;
    TermCurrency: string;
    ExecutionVenue: string;
    ProductType: string;
    editNote?: string;
  } | null;
}

const defaultFormData = {
  _id: '',
  ClientID: '',
  CurrencyPair: '',
  BaseCurrency: '',
  TermCurrency: '',
  ExecutionVenue: '',
  ProductType: 'Spot',
  editNote: '',
};

const EditForexModal: React.FC<EditForexModalProps> = ({
  open,
  onClose,
  onSave,
  forexData,
}) => {
  const [formData, setFormData] = useState(forexData ? { ...forexData, editNote: '' } : defaultFormData);
  const [error, setError] = useState('');
  const [originalData, setOriginalData] = useState(forexData);

  useEffect(() => {
    setFormData(forexData ? { ...forexData, editNote: '' } : defaultFormData);
    setOriginalData(forexData);
    setError('');
  }, [forexData]);

  useEffect(() => {
    if (!originalData) return;
    const changes: string[] = [];
    (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
      if (key !== 'editNote' && formData[key] !== originalData[key]) {
        changes.push(`${key} changed from "${originalData[key] ?? ''}" to "${formData[key] ?? ''}"`);
      }
    });
    if (changes.length > 0) {
      setFormData((prev) => ({ ...prev, editNote: `${changes.join('; ')}` }));
    }
  }, [formData, originalData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, editNote: e.target.value }));
  };

  const handleSubmit = () => {
    if (!formData.editNote) {
      setError('Edit Note is required.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Forex Trade Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Currency Pair"
              name="CurrencyPair"
              value={formData.CurrencyPair}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Base Currency"
              name="BaseCurrency"
              value={formData.BaseCurrency}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Term Currency"
              name="TermCurrency"
              value={formData.TermCurrency}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Execution Venue"
              name="ExecutionVenue"
              value={formData.ExecutionVenue}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Product Type"
              name="ProductType"
              value={formData.ProductType}
              onChange={handleChange}
              select
            >
              <MenuItem value="Spot">Spot</MenuItem>
              <MenuItem value="Forward">Forward</MenuItem>
              <MenuItem value="Swap">Swap</MenuItem>
              <MenuItem value="Option">Option</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Edit Note"
              name="editNote"
              multiline
              rows={4}
              value={formData.editNote}
              onChange={handleNoteChange}
              required
              helperText="Required: Review the auto-generated note or add your own explanation."
              error={!!error}
            />
          </Grid>
        </Grid>
        {error && (
          <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditForexModal; 