import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  SelectChangeEvent,
  Tabs,
  Tab,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface Instrument {
  _id?: string;
  ISIN?: string;
  instrumentName?: string;
  assetClass: string;
  issuer?: string;
  sector?: string;
  country?: string;
  currency?: string;
  // Equity specific fields
  symbol?: string;
  clientId?: string;
  counterparty?: string;
  tradingVenue?: string;
  countryOfTrade?: string;
  kycStatus?: string;
  referenceDataValidated?: boolean;
  collateralRequired?: boolean;
  marginType?: string;
  marginStatus?: string;
  fxRateApplied?: number;
  // Forex specific fields
  currencyPair?: string;
  baseCurrency?: string;
  termCurrency?: string;
  executionVenue?: string;
  productType?: string;
  bookingLocation?: string;
  portfolio?: string;
  tradeSourceSystem?: string;
  custodian?: string;
  settlementInstructions?: string;
  nettingEligibility?: boolean;
  sanctionsScreening?: string;
  settlementCurrency?: string;
  costCenter?: string;
  expenseApprovalStatus?: string;
  status?: string; // Added status field
  // Fixed Income specific fields
  maturityDate?: string;
  couponRate?: number;
  couponFrequency?: string;
  issuerName?: string;
  // Futures specific fields
  contractCode?: string;
  underlyingAsset?: string;
  expiryDate?: string;
  lotSize?: number;
  // Options specific fields
  optionType?: 'Call' | 'Put';
  strikePrice?: number;
}

interface AddInstrumentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (instrumentData: Instrument) => void;
  assetClass?: string;
  editingInstrument?: Instrument | null;
}

const AddInstrumentModal: React.FC<AddInstrumentModalProps> = ({
  open,
  onClose,
  onSave,
  assetClass,
  editingInstrument,
}) => {
  const [formData, setFormData] = useState<Instrument>({
    ISIN: '',
    instrumentName: '',
    assetClass: assetClass || '',
    issuer: '',
    sector: '',
    country: '',
    currency: '',
    // Equity fields
    symbol: '',
    clientId: '',
    counterparty: '',
    tradingVenue: '',
    countryOfTrade: '',
    kycStatus: '',
    referenceDataValidated: false,
    collateralRequired: false,
    marginType: '',
    marginStatus: '',
    fxRateApplied: 0,
    // Forex fields
    currencyPair: '',
    baseCurrency: '',
    termCurrency: '',
    executionVenue: '',
    productType: '',
    bookingLocation: '',
    portfolio: '',
    tradeSourceSystem: '',
    custodian: '',
    settlementInstructions: '',
    nettingEligibility: false,
    sanctionsScreening: '',
    settlementCurrency: '',
    costCenter: '',
    expenseApprovalStatus: '',
    status: 'Active', // Initialize status
    // Fixed Income fields
    maturityDate: '',
    couponRate: 0,
    couponFrequency: '',
    issuerName: '',
    // Futures fields
    contractCode: '',
    underlyingAsset: '',
    expiryDate: '',
    lotSize: 0,
    // Options fields
    optionType: 'Call',
    strikePrice: 0,
  });

  // Populate form when editing or adding
  useEffect(() => {
    if (open) {
      const initialAssetClass = assetClass || (editingInstrument ? editingInstrument.assetClass : '');
      const initialData = {
        ISIN: '',
        instrumentName: '',
        assetClass: initialAssetClass,
        issuer: '',
        sector: '',
        country: '',
        currency: '',
        symbol: '',
        clientId: '',
        counterparty: '',
        tradingVenue: '',
        countryOfTrade: '',
        kycStatus: '',
        referenceDataValidated: false,
        collateralRequired: false,
        marginType: '',
        marginStatus: '',
        fxRateApplied: 0,
        currencyPair: '',
        baseCurrency: '',
        termCurrency: '',
        executionVenue: '',
        productType: '',
        bookingLocation: '',
        portfolio: '',
        tradeSourceSystem: '',
        custodian: '',
        settlementInstructions: '',
        nettingEligibility: false,
        sanctionsScreening: '',
        settlementCurrency: '',
        costCenter: '',
        expenseApprovalStatus: '',
        status: 'Active',
        maturityDate: '',
        couponRate: 0,
        couponFrequency: '',
        issuerName: '',
        contractCode: '',
        underlyingAsset: '',
        expiryDate: '',
        lotSize: 0,
        optionType: 'Call',
        strikePrice: 0,
        ...editingInstrument,
      };
      setFormData(initialData as Instrument);
    }
  }, [editingInstrument, open, assetClass]);

  const handleTextChange = (field: string) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSelectChange = (field: string) => (
    event: SelectChangeEvent
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const renderEquityFields = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="ISIN"
        value={formData.ISIN}
        onChange={handleTextChange('ISIN')}
        fullWidth
      />
      <TextField
        label="Symbol"
        value={formData.symbol}
        onChange={handleTextChange('symbol')}
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel>Trading Venue</InputLabel>
        <Select
          value={formData.tradingVenue}
          label="Trading Venue"
          onChange={handleSelectChange('tradingVenue')}
        >
          {['NASDAQ', 'NYSE', 'BSE', 'LSE'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Currency</InputLabel>
        <Select
          value={formData.currency}
          label="Currency"
          onChange={handleSelectChange('currency')}
        >
          {['USD', 'EUR', 'GBP', 'JPY'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Country of Trade"
        value={formData.countryOfTrade}
        onChange={handleTextChange('countryOfTrade')}
        fullWidth
      />
      {/* Instrument Status Dropdown */}
      <FormControl fullWidth>
        <InputLabel>Instrument Status</InputLabel>
        <Select
          value={formData.status || ''}
          label="Instrument Status"
          onChange={handleSelectChange('status')}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  const renderFixedIncomeFields = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="ISIN"
        value={formData.ISIN}
        onChange={handleTextChange('ISIN')}
        fullWidth
      />
      <TextField
        label="Maturity Date"
        value={formData.maturityDate}
        onChange={handleTextChange('maturityDate')}
        fullWidth
        type="date"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Coupon Rate"
        value={formData.couponRate}
        onChange={handleTextChange('couponRate')}
        fullWidth
        type="number"
      />
      <FormControl fullWidth>
        <InputLabel>Coupon Frequency</InputLabel>
        <Select
          value={formData.couponFrequency}
          label="Coupon Frequency"
          onChange={handleSelectChange('couponFrequency')}
        >
          {['Annual', 'Semi-Annual', 'Quarterly', 'Monthly'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Issuer Name"
        value={formData.issuerName}
        onChange={handleTextChange('issuerName')}
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel>Instrument Status</InputLabel>
        <Select
          value={formData.status || ''}
          label="Instrument Status"
          onChange={handleSelectChange('status')}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  const renderFuturesFields = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Contract Code"
        value={formData.contractCode}
        onChange={handleTextChange('contractCode')}
        fullWidth
      />
      <TextField
        label="Underlying Asset"
        value={formData.underlyingAsset}
        onChange={handleTextChange('underlyingAsset')}
        fullWidth
      />
      <TextField
        label="Expiry Date"
        value={formData.expiryDate}
        onChange={handleTextChange('expiryDate')}
        fullWidth
        type="date"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Lot Size"
        value={formData.lotSize}
        onChange={handleTextChange('lotSize')}
        fullWidth
        type="number"
      />
      <FormControl fullWidth>
        <InputLabel>Trading Venue</InputLabel>
        <Select
          value={formData.tradingVenue}
          label="Trading Venue"
          onChange={handleSelectChange('tradingVenue')}
        >
          {['CME', 'EUREX', 'ICE'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Currency</InputLabel>
        <Select
          value={formData.currency}
          label="Currency"
          onChange={handleSelectChange('currency')}
        >
          {['USD', 'EUR', 'GBP'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  const renderOptionsFields = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Contract Code"
        value={formData.contractCode}
        onChange={handleTextChange('contractCode')}
        fullWidth
      />
      <TextField
        label="Underlying Asset"
        value={formData.underlyingAsset}
        onChange={handleTextChange('underlyingAsset')}
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel>Option Type</InputLabel>
        <Select
          value={formData.optionType}
          label="Option Type"
          onChange={handleSelectChange('optionType')}
        >
          <MenuItem value="Call">Call</MenuItem>
          <MenuItem value="Put">Put</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Expiry Date"
        value={formData.expiryDate}
        onChange={handleTextChange('expiryDate')}
        fullWidth
        type="date"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Lot Size"
        value={formData.lotSize}
        onChange={handleTextChange('lotSize')}
        fullWidth
        type="number"
      />
    </Box>
  );


  const renderForexFields = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Currency Pair"
        value={formData.currencyPair}
        onChange={handleTextChange('currencyPair')}
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel>Base Currency</InputLabel>
        <Select
          value={formData.baseCurrency}
          label="Base Currency"
          onChange={handleSelectChange('baseCurrency')}
        >
          {['USD', 'EUR', 'GBP', 'JPY'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Term Currency</InputLabel>
        <Select
          value={formData.termCurrency}
          label="Term Currency"
          onChange={handleSelectChange('termCurrency')}
        >
          {['USD', 'EUR', 'GBP', 'JPY'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Execution Venue</InputLabel>
        <Select
          value={formData.executionVenue}
          label="Execution Venue"
          onChange={handleSelectChange('executionVenue')}
        >
          {['CME', 'EUREX', 'LSE'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Product Type</InputLabel>
        <Select
          value={formData.productType}
          label="Product Type"
          onChange={handleSelectChange('productType')}
        >
          {['Spot', 'Forward', 'Swap'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  const renderContent = () => {
    switch (assetClass) {
      case 'Equity':
        return renderEquityFields();
      case 'Forex':
        return renderForexFields();
      case 'Fixed Income':
        return renderFixedIncomeFields();
      case 'Futures':
        return renderFuturesFields();
      case 'Options':
        return renderOptionsFields();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingInstrument ? 'Edit Instrument' : 'Add New Instrument'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {renderContent()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.assetClass}
        >
          {editingInstrument ? 'Update Instrument' : 'Add Instrument'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddInstrumentModal; 