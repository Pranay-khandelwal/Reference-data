import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import * as api from '../../services/api';
import {
  EquityInstrument,
  FixedIncomeInstrument,
  FuturesInstrument,
  OptionsInstrument,
  ForexInstrument,
} from '../../pages/InstrumentManagement';

type Instrument =
  | EquityInstrument
  | FixedIncomeInstrument
  | FuturesInstrument
  | OptionsInstrument
  | ForexInstrument;

interface EditInstrumentModalProps {
  open: boolean;
  onClose: () => void;
  instrument: Instrument | null;
  onSave: (updatedInstrument: any) => void;
}

const EditInstrumentModal: React.FC<EditInstrumentModalProps> = ({
  open,
  onClose,
  instrument,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [originalData, setOriginalData] = useState<Instrument | null>(null);

  useEffect(() => {
    if (instrument) {
      setFormData({ ...instrument, editNote: '' });
      setOriginalData(instrument);
    }
  }, [instrument]);

  useEffect(() => {
    // Auto-generate note when formData changes
    if (!originalData) return;
    const changes: string[] = [];
    (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
      if (
        key !== 'editNote' &&
        originalData &&
        formData[key] !== originalData[key as keyof typeof originalData]
      ) {
        changes.push(
          `${String(key)} changed from "${
            originalData[key as keyof typeof originalData] ?? ''
          }" to "${formData[key as keyof typeof formData] ?? ''}"`
        );
      }
    });
    if (changes.length > 0) {
      setFormData((prev: any) => ({
        ...prev,
        editNote: `${changes.join('; ')}`,
      }));
    }
  }, [formData, originalData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({ ...prev, editNote: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instrument?._id) return;

    if (!formData.editNote) {
      setError('Edit Note is required.');
      return;
    }

    onSave({ ...formData, _id: instrument._id });
    onClose();
  };

  const renderEquityFields = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="ISIN"
          name="ISIN"
          value={formData.ISIN || ''}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Symbol"
          name="Symbol"
          value={formData.Symbol || ''}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Trading Venue"
          name="TradingVenue"
          value={formData.TradingVenue || ''}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Instrument Status"
          name="Status"
          value={formData.Status || ''}
          onChange={handleChange}
          select
          required
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Currency"
          name="Currency"
          value={formData.Currency || ''}
          onChange={handleChange}
          select
          required
        >
          <MenuItem value="USD">USD</MenuItem>
          <MenuItem value="EUR">EUR</MenuItem>
          <MenuItem value="GBP">GBP</MenuItem>
          <MenuItem value="JPY">JPY</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Country of Trade"
          name="CountryOfTrade"
          value={formData.CountryOfTrade || ''}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="RID"
          name="RID"
          value={formData.RID || ''}
          onChange={handleChange}
          disabled
        />
      </Grid>
    </Grid>
  );

  const renderFixedIncomeFields = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="ISIN"
          name="ISIN"
          value={formData.ISIN || ''}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Maturity Date"
          name="MaturityDate"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.MaturityDate || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Coupon Rate"
          name="CouponRate"
          type="number"
          value={formData.CouponRate || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Coupon Frequency"
          name="CouponFrequency"
          value={formData.CouponFrequency || ''}
          onChange={handleChange}
          select
        >
          <MenuItem value="Annual">Annual</MenuItem>
          <MenuItem value="Semi-Annual">Semi-Annual</MenuItem>
          <MenuItem value="Quarterly">Quarterly</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Instrument Status"
          name="Status"
          value={formData.Status || ''}
          onChange={handleChange}
          select
          required
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Issuer Name"
          name="IssuerName"
          value={formData.IssuerName || ''}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );

  const renderFuturesFields = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Contract Code"
          name="ContractCode"
          value={formData.ContractCode || ''}
          onChange={handleChange}
          required
          disabled
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Underlying Asset"
          name="UnderlyingAsset"
          value={formData.UnderlyingAsset || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Expiry Date"
          name="ExpiryDate"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.ExpiryDate || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Lot Size"
          name="LotSize"
          type="number"
          value={formData.LotSize || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Trading Venue"
          name="TradingVenue"
          value={formData.TradingVenue || ''}
          onChange={handleChange}
          select
          required
        >
          <MenuItem value="CME">CME</MenuItem>
          <MenuItem value="LSE">LSE</MenuItem>
          <MenuItem value="NYSE">NYSE</MenuItem>
          <MenuItem value="SGX">SGX</MenuItem>
          <MenuItem value="EUREX">EUREX</MenuItem>
          <MenuItem value="NSE">NSE</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Currency"
          name="Currency"
          value={formData.Currency || ''}
          onChange={handleChange}
          select
          required
        >
          <MenuItem value="USD">USD</MenuItem>
          <MenuItem value="EUR">EUR</MenuItem>
          <MenuItem value="INR">INR</MenuItem>
          <MenuItem value="JPY">JPY</MenuItem>
          <MenuItem value="GBP">GBP</MenuItem>
          <MenuItem value="CNY">CNY</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  );

  const renderOptionsFields = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Contract Code"
          name="ContractCode"
          value={formData.ContractCode || ''}
          onChange={handleChange}
          required
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Underlying Asset"
          name="UnderlyingAsset"
          value={formData.UnderlyingAsset || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Option Type"
          name="OptionType"
          value={formData.OptionType || ''}
          onChange={handleChange}
          select
        >
          <MenuItem value="Call">Call</MenuItem>
          <MenuItem value="Put">Put</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Expiry Date"
          name="ExpiryDate"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={formData.ExpiryDate || ''}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Lot Size"
          name="LotSize"
          type="number"
          value={formData.LotSize || ''}
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );

  const renderFields = () => {
    if (!instrument) return null;
    if ('ISIN' in instrument && 'Symbol' in instrument) return renderEquityFields();
    if ('MaturityDate' in instrument) return renderFixedIncomeFields();
    if ('ContractCode' in instrument && 'UnderlyingAsset' in instrument && !('OptionType' in instrument)) return renderFuturesFields();
    if ('OptionType' in instrument) return renderOptionsFields();
    return null;
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Instrument</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {renderFields()}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Edit Note"
                name="editNote"
                multiline
                rows={4}
                value={formData.editNote || ''}
                onChange={handleNoteChange}
                required
                helperText="Required: Review the auto-generated note or add your own explanation."
              />
            </Grid>
          </Grid>
          {error && (
            <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditInstrumentModal; 