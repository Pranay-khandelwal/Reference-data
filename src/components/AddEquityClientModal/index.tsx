import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import Grid from '@mui/material/Grid';

interface AddEquityClientModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (clientData: any) => void;
  initialClientID: string; // NEW PROP
}

const kycStatuses = ["Pending", "Completed", "Failed"];
const marginTypes = ["Initial", "Variation"];
const marginStatuses = ["Pending", "Satisfied", "Failed"];

const AddEquityClientModal: React.FC<AddEquityClientModalProps> = ({
  open,
  onClose,
  onSave,
  initialClientID, // NEW PROP
}) => {
  const [formData, setFormData] = useState({
    ClientID: '',
    Counterparty: '',
    KYCStatus: '',
    ReferenceDataValidated: '',
    MarginType: '',
    MarginStatus: '',
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

  const handleSelectChange = (name: string) => (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
    setFormData({
      ClientID: '',
      Counterparty: '',
      KYCStatus: '',
      ReferenceDataValidated: '',
      MarginType: '',
      MarginStatus: '',
      ApprovalStatus: '',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Equity Client</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Client ID */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Client ID"
              name="ClientID"
              value={formData.ClientID}
              InputProps={{ readOnly: true }} // MAKE READ-ONLY
            />
          </Grid>
          {/* Counterparty */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Counterparty"
              name="Counterparty"
              value={formData.Counterparty}
              onChange={handleChange}
            />
          </Grid>
          {/* KYC Status */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>KYC Status</InputLabel>
              <Select
                value={formData.KYCStatus}
                label="KYC Status"
                onChange={handleSelectChange('KYCStatus')}
              >
                {kycStatuses.map((k) => (
                  <MenuItem key={k} value={k}>{k}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Reference Data Validated */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Reference Data Validated</InputLabel>
              <Select
                value={formData.ReferenceDataValidated}
                label="Reference Data Validated"
                onChange={handleSelectChange('ReferenceDataValidated')}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* Margin Type */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Margin Type</InputLabel>
              <Select
                value={formData.MarginType}
                label="Margin Type"
                onChange={handleSelectChange('MarginType')}
              >
                {marginTypes.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Margin Status */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Margin Status</InputLabel>
              <Select
                value={formData.MarginStatus}
                label="Margin Status"
                onChange={handleSelectChange('MarginStatus')}
              >
                {marginStatuses.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Approval Status */}
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Approval Status</InputLabel>
              <Select
                value={formData.ApprovalStatus || ''}
                label="Approval Status"
                onChange={handleSelectChange('ApprovalStatus')}
              >
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
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

export default AddEquityClientModal; 