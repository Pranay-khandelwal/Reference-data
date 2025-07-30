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

interface ForexClient {
  _id: string;
  ClientID: string;
  Counterparty: string;
  Portfolio: string;
  Custodian: string;
  NettingEligibility: string;
  KYCStatus: string;
  SanctionsScreening: string;
  ExpenseApprovalStatus: string;
  ApprovalStatus: string;
  editNote?: string;
  [key: string]: any;
}

interface EditForexClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (clientData: ForexClient) => void;
  clientData: ForexClient;
}

const EditForexClientModal: React.FC<EditForexClientModalProps> = ({
  open,
  onClose,
  onSave,
  clientData,
}) => {
  const [formData, setFormData] = useState<ForexClient>(clientData);
  const [originalData, setOriginalData] = useState<ForexClient>(clientData);
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    setFormData(clientData);
    setOriginalData(clientData);
    setEditNote('');
  }, [clientData]);

  useEffect(() => {
    // Auto-generate note when formData changes
    const changes: string[] = [];
    (Object.keys(formData) as (keyof ForexClient)[]).forEach((key) => {
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
      <DialogTitle>Edit Forex Client Details</DialogTitle>
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
              label="Portfolio"
              name="Portfolio"
              value={formData.Portfolio}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Custodian"
              name="Custodian"
              value={formData.Custodian}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Netting Eligibility"
              name="NettingEligibility"
              value={formData.NettingEligibility}
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
              label="KYC Status"
              name="KYCStatus"
              value={formData.KYCStatus}
              onChange={handleChange}
              select
            >
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Not Started">Not Started</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Sanctions Screening"
              name="SanctionsScreening"
              value={formData.SanctionsScreening}
              onChange={handleChange}
              select
            >
              <MenuItem value="Passed">Passed</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Expense Approval Status"
              name="ExpenseApprovalStatus"
              value={formData.ExpenseApprovalStatus}
              onChange={handleChange}
              select
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
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

export default EditForexClientModal; 