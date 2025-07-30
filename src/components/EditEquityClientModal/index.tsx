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

interface EditEquityClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (clientData: any) => void;
  clientData: {
    _id: string;
    ClientID: string;
    Counterparty: string;
    KYCStatus: string;
    ReferenceDataValidated: string;
    MarginType: string;
    MarginStatus: string;
    ApprovalStatus: string;
  };
}

const EditEquityClientModal: React.FC<EditEquityClientModalProps> = ({
  open,
  onClose,
  onSave,
  clientData,
}) => {
  const [formData, setFormData] = useState(clientData);
  const [editNote, setEditNote] = useState('');
  const [originalData, setOriginalData] = useState(clientData);

  useEffect(() => {
    setFormData(clientData);
    setOriginalData(clientData);
    setEditNote('');
  }, [clientData]);

  useEffect(() => {
    // Auto-generate note when formData changes
    const changes: string[] = [];
    (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
      if (formData[key] !== originalData[key]) {
        changes.push(`${key} changed from "${originalData[key] ?? ''}" to "${formData[key] ?? ''}"`);
      }
    });
    if (changes.length > 0) {
      setEditNote(changes.join('; '));
    } else {
      setEditNote('');
    }
  }, [formData, originalData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditNote(e.target.value);
  };

  const handleSubmit = () => {
    onSave({ ...formData, editNote });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Equity Client Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Client ID"
              name="ClientID"
              value={formData.ClientID}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Counterparty"
              name="Counterparty"
              value={formData.Counterparty}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="KYC Status"
              name="KYCStatus"
              value={formData.KYCStatus}
              onChange={handleChange}
              select
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Reference Data Validated"
              name="ReferenceDataValidated"
              value={formData.ReferenceDataValidated}
              onChange={handleChange}
              select
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Margin Type"
              name="MarginType"
              value={formData.MarginType}
              onChange={handleChange}
              select
            >
              <MenuItem value="Initial">Initial</MenuItem>
              <MenuItem value="Variation">Variation</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Margin Status"
              name="MarginStatus"
              value={formData.MarginStatus}
              onChange={handleChange}
              select
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Satisfied">Satisfied</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Approval Status"
              name="ApprovalStatus"
              value={formData.ApprovalStatus}
              onChange={handleChange}
              select
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Edit Note"
              name="editNote"
              value={editNote}
              onChange={handleNoteChange}
              multiline
              minRows={2}
              helperText="Required: Review the auto-generated note or add your own explanation."
              required
            />
          </Grid>
        </Grid>
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

export default EditEquityClientModal; 