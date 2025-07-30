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
  ClientID: string;
  CurrencyPair?: string; // optional, removed from UI
  Counterparty: string;
  Portfolio: string;
  Custodian: string;
  NettingEligibility: string;
  KYCStatus: string;
  SanctionsScreening: string;
  ExpenseApprovalStatus: string;
  ApprovalStatus: string;
}

interface AddForexClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (clientData: ForexClient) => void;
  initialClientID: string; // NEW PROP
}

const AddForexClientModal: React.FC<AddForexClientModalProps> = ({
  open,
  onClose,
  onSave,
  initialClientID, // NEW PROP
}) => {
  const [formData, setFormData] = useState<ForexClient>({
    ClientID: '',
    Counterparty: '',
    Portfolio: '',
    Custodian: '',
    NettingEligibility: '',
    KYCStatus: '',
    SanctionsScreening: '',
    ExpenseApprovalStatus: '',
    ApprovalStatus: '',
  });

  // Auto-fill ClientID when modal opens or when initialClientID changes
  useEffect(() => {
    if (open) {
      setFormData((prev) => ({ ...prev, ClientID: initialClientID }));
    }
  }, [open, initialClientID]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
    setFormData({
      ClientID: '',
      Counterparty: '',
      Portfolio: '',
      Custodian: '',
      NettingEligibility: '',
      KYCStatus: '',
      SanctionsScreening: '',
      ExpenseApprovalStatus: '',
      ApprovalStatus: '',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Forex Client</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Client ID"
              name="ClientID"
              value={formData.ClientID}
              InputProps={{ readOnly: true }} // MAKE READ-ONLY
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
              <MenuItem value="Failed">Failed</MenuItem>
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
              <MenuItem value="Clear">Clear</MenuItem>
              <MenuItem value="Pending Review">Pending Review</MenuItem>
              <MenuItem value="Flagged">Flagged</MenuItem>
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
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Client
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddForexClientModal; 