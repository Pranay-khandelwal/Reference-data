import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setLatestSSI } from '../../store/slices/ssiSlice';
import { setLatestForexSSI } from '../../store/slices/forexSSISlice';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import * as api from '../../services/api';
import Collapse from '@mui/material/Collapse';
import { useAuth } from '../../contexts/AuthContext';
import { addAuditLog } from '../../firebase/services/audit';

const equitySettlementCycles = ['T+1', 'T+2'];
const settlementCurrencies = ['USD', 'AUD', 'JPY', 'EUR', 'GBP'];
const ssiStatusEquity = ['Settled', 'Pending', 'Failed'];
const ssiStatusForex = ['Settled', 'Pending', 'Failed'];
const marginTypes = ['Initial', 'Variation'];
const marginStatuses = ['Satisfied', 'Pending', 'Failed'];

const settlementMethodOptions: Record<string, string[]> = {
  USD: ['Fedwire', 'CHIPS'],
  AUD: ['RTGS'],
  JPY: ['Zengin', 'RTGS'],
  EUR: ['SEPA', 'SWIFT'],
  GBP: ['CHAPS', 'BACS', 'SWIFT'],
};

const currencyFieldConfig: Record<string, { required: string[]; optional: string[] }> = {
  USD: {
    required: ['aba_routing_number'],
    optional: ['swift_bic_code', 'beneficiary_name', 'account_number'],
  },
  AUD: {
    required: ['bsb_code'],
    optional: ['swift_bic_code', 'beneficiary_name', 'account_number'],
  },
  JPY: {
    required: ['swift_bic_code', 'beneficiary_name', 'account_number'],
    optional: ['zengin_code'],
  },
  EUR: {
    required: ['iban', 'swift_bic_code', 'beneficiary_name'],
    optional: ['account_number'],
  },
  GBP: {
    required: ['sort_code'],
    optional: ['swift_bic_code', 'beneficiary_name', 'account_number'],
  },
};

const forexCurrencyFieldConfig: Record<string, { required: string[]; optional: string[]; settlementMethods: string[] }> = {
  USD: {
    required: ['aba_routing_number', 'account_number'],
    optional: ['swift_bic_code', 'beneficiary_name'],
    settlementMethods: ['Fedwire', 'CHIPS'],
  },
  AUD: {
    required: ['bsb_code', 'account_number'],
    optional: ['swift_bic_code', 'beneficiary_name'],
    settlementMethods: ['RTGS'],
  },
  JPY: {
    required: ['swift_bic_code', 'account_number'],
    optional: ['zengin_code', 'beneficiary_name'],
    settlementMethods: ['Zengin', 'RTGS'],
  },
  EUR: {
    required: ['iban'],
    optional: ['swift_bic_code', 'beneficiary_name', 'account_number'],
    settlementMethods: ['SEPA', 'SWIFT'],
  },
  GBP: {
    required: ['sort_code', 'account_number'],
    optional: ['swift_bic_code', 'beneficiary_name'],
    settlementMethods: ['CHAPS', 'BACS', 'SWIFT'],
  },
};

const AddEditSSIModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  assetClass: 'equity' | 'forex';
  record: any | null;
}> = ({ open, onClose, onSave, assetClass, record }) => {
  const [form, setForm] = useState<any>(record || {});
  // Dropdown options for Forex fields
  const [clientIdOptions, setClientIdOptions] = useState<string[]>([]);
  const [counterpartyOptions, setCounterpartyOptions] = useState<string[]>([]);
  const [currencyPairOptions, setCurrencyPairOptions] = useState<string[]>([]);

  // State for equity client data
  const [equityClients, setEquityClients] = useState<any[]>([]);

  const [editNote, setEditNote] = useState('');
  const [editNoteError, setEditNoteError] = useState('');
  const [formError, setFormError] = useState<string>('');
  useEffect(() => {
    if (open) {
      setForm(record || {});
      setEditNote('');
      setEditNoteError('');
      setFormError('');
    }
  }, [open, record, assetClass]);

  // Load dropdown data dynamically when modal opens
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (assetClass === 'forex') {
        try {
          const forexClients = await api.getForexClients();
          const ids = Array.from(new Set(forexClients.map((c: any) => c.ClientID).filter(Boolean)));
          const cps = Array.from(new Set(forexClients.map((c: any) => c.Counterparty).filter(Boolean)));
          setClientIdOptions(ids);
          setCounterpartyOptions(cps);
          const instruments = await api.getForexInstruments();
          const pairs = Array.from(new Set(instruments.map((i: any) => (i.CurrencyPair || i.symbol || i.Symbol)).filter(Boolean)));
          setCurrencyPairOptions(pairs);
        } catch (error) {
          console.error('Error fetching dropdown data for SSI modal:', error);
        }
      } else if (assetClass === 'equity') {
        try {
          const clients = await api.getEquityClients();
          setEquityClients(clients);
        } catch (error) {
          console.error('Error fetching equity clients:', error);
        }
      }
    };
    if (open) {
      fetchDropdownData();
    }
  }, [open, assetClass]);

  // Auto-generate edit note when editing
  useEffect(() => {
    if (!record) return;
    const changes: string[] = [];
    Object.keys(form).forEach((key) => {
      if (key !== 'editNote' && form[key] !== record[key]) {
        changes.push(`${key} changed from "${record[key] ?? ''}" to "${form[key] ?? ''}"`);
      }
    });
    if (changes.length > 0) {
      setEditNote(changes.join('; '));
    }
  }, [form, record]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name!]: value }));
  };
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name!]: value }));
  };

  const handleEquityClientChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    const selectedClient = equityClients.find(c => c.ClientID === value);
    if (selectedClient) {
      setForm((prev: any) => ({
        ...prev,
        [name!]: value,
        Counterparty: selectedClient.Counterparty,
        MarginType: selectedClient.MarginType,
        MarginStatus: selectedClient.MarginStatus,
      }));
    } else {
      setForm((prev: any) => ({
        ...prev,
        [name!]: value,
        Counterparty: '',
        MarginType: '',
        MarginStatus: '',
      }));
    }
  };

  const handleEditNoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditNote(e.target.value);
    if (e.target.value) setEditNoteError('');
  };

  // Helper to build a complete, string-only payload
  const buildPayload = () => {
    const requiredFields = [
      'ClientID', 'Counterparty', 'CustodianName', 'CustodianAccountNo', 'BeneficiaryClientID',
      'SettlementCycle', 'SettlementCurrency', 'SettlementDate', 'ConfirmationStatus', 'MarginType', 'MarginStatus'
    ];
    const safeString = (val: any) => (typeof val === 'string' ? val : '');
    const payload: any = {};
    requiredFields.forEach(field => {
      payload[field] = safeString(form[field]);
    });
    // Add all other fields from form
    Object.keys(form).forEach(field => {
      if (!(field in payload)) {
        payload[field] = safeString(form[field]);
      }
    });
    payload.editNote = editNote;
    return payload;
  };

  const handleSubmit = () => {
    setFormError('');
    if (record) {
      if (!editNote) {
        setEditNoteError('Edit Note is required.');
        return;
      }
    }
    // Currency-specific validation for equity
    if (assetClass === 'equity') {
      const currency = form.SettlementCurrency;
      if (currency && currencyFieldConfig[currency]) {
        const { required, optional } = currencyFieldConfig[currency];
        for (const field of required) {
          if (!form[field] || form[field].trim() === '') {
            setFormError(`Missing required field for ${currency}: ${field.replace(/_/g, ' ')}`);
            return;
          }
        }
        // Set 'N/A' for empty optional fields
        const newForm = { ...form };
        for (const field of optional) {
          if (!newForm[field] || newForm[field].trim() === '') {
            newForm[field] = 'N/A';
          }
        }
        // Also set 'N/A' for account_number for EUR if not provided
        if (currency === 'EUR' && (!newForm.account_number || newForm.account_number.trim() === '')) {
          newForm.account_number = 'N/A';
        }
        // Set settlement_method if present
        if (settlementMethodOptions[currency]) {
          newForm.settlement_method = form.settlement_method || '';
        }
        onSave({ ...buildPayload(), ...newForm });
        return;
      }
    }
    // Default save for non-currency-specific
    onSave(buildPayload());
  };

  const isForexFormValid = assetClass !== 'forex' || (
    form.ClientID &&
    form.Counterparty &&
    form.CurrencyPair &&
    form.SettlementCurrency &&
    forexCurrencyFieldConfig[form.SettlementCurrency] &&
    forexCurrencyFieldConfig[form.SettlementCurrency].required.every((field) => form[field] && form[field].trim() !== '')
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{record ? 'Edit SSI' : 'Add SSI'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {assetClass === 'equity' ? (
            <>
              <FormControl fullWidth>
                <InputLabel>Client Id</InputLabel>
                <Select
                  name="ClientID"
                  value={form.ClientID || ''}
                  onChange={handleEquityClientChange}
                  label="Client Id"
                >
                  {equityClients.map((client) => (
                    <MenuItem key={client.ClientID} value={client.ClientID}>{client.ClientID}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Counterparty</InputLabel>
                <Select
                  name="Counterparty"
                  value={form.Counterparty || ''}
                  onChange={handleSelectChange}
                  label="Counterparty"
                >
                  <MenuItem value={form.Counterparty || ''}>{form.Counterparty || ''}</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Custodian Name" name="CustodianName" value={form.CustodianName || ''} onChange={handleInputChange} fullWidth />
              <TextField label="Custodian Ac no" name="CustodianAccountNo" value={form.CustodianAccountNo || ''} onChange={handleInputChange} fullWidth />
              <TextField label="Beneficiary Client ID" name="BeneficiaryClientID" value={form.BeneficiaryClientID || ''} onChange={handleInputChange} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Settlement Cycle</InputLabel>
                <Select name="SettlementCycle" value={form.SettlementCycle || ''} onChange={handleSelectChange} label="Settlement Cycle">
                  {equitySettlementCycles.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Settlement Currency</InputLabel>
                <Select name="SettlementCurrency" value={form.SettlementCurrency || ''} onChange={handleSelectChange} label="Settlement Currency">
                  {settlementCurrencies.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              {/* Currency-specific fields */}
              {form.SettlementCurrency && currencyFieldConfig[form.SettlementCurrency] && (
                <>
                  {currencyFieldConfig[form.SettlementCurrency].required.map((field) => (
                    <TextField
                      key={field}
                      label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + (field === 'aba_routing_number' || field === 'bsb_code' || field === 'sort_code' ? ' *' : '')}
                      name={field}
                      value={form[field] || ''}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  ))}
                  {currencyFieldConfig[form.SettlementCurrency].optional.map((field) => (
                    <TextField
                      key={field}
                      label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      name={field}
                      value={form[field] || ''}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  ))}
                  {/* Settlement Method Dropdown */}
                  {settlementMethodOptions[form.SettlementCurrency] && (
                    <FormControl fullWidth>
                      <InputLabel>Settlement Method</InputLabel>
                      <Select
                        name="settlement_method"
                        value={form.settlement_method || ''}
                        onChange={handleSelectChange}
                        label="Settlement Method"
                      >
                        {settlementMethodOptions[form.SettlementCurrency].map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              )}
              {/* Replace DatePicker with TextField for date input */}
              <TextField
                label="Effective Date"
                name="SettlementDate"
                type="date"
                value={form.SettlementDate ? (typeof form.SettlementDate === 'string' ? form.SettlementDate : new Date(form.SettlementDate).toISOString().slice(0, 10)) : ''}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Confirmation Status</InputLabel>
                <Select name="ConfirmationStatus" value={form.ConfirmationStatus || ''} onChange={handleSelectChange} label="Confirmation Status">
                  {ssiStatusEquity.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Margin type</InputLabel>
                <Select
                  name="MarginType"
                  value={form.MarginType || ''}
                  onChange={handleSelectChange}
                  label="Margin type"
                >
                  <MenuItem value={form.MarginType || ''}>{form.MarginType || ''}</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Margin status</InputLabel>
                <Select
                  name="MarginStatus"
                  value={form.MarginStatus || ''}
                  onChange={handleSelectChange}
                  label="Margin status"
                >
                  <MenuItem value={form.MarginStatus || ''}>{form.MarginStatus || ''}</MenuItem>
                </Select>
              </FormControl>
            </>
          ) : (
            <>
              <FormControl fullWidth>
                <InputLabel>Client ID</InputLabel>
                <Select
                  name="ClientID"
                  value={form.ClientID || ''}
                  onChange={handleSelectChange}
                  label="Client ID"
                >
                  <MenuItem value=""><em>-- Select Client ID --</em></MenuItem>
                  {clientIdOptions.map((id) => (
                    <MenuItem key={id} value={id}>{id}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Counterparty</InputLabel>
                <Select
                  name="Counterparty"
                  value={form.Counterparty || ''}
                  onChange={handleSelectChange}
                  label="Counterparty"
                >
                  <MenuItem value=""><em>-- Select Counterparty --</em></MenuItem>
                  {counterpartyOptions.map((cp) => (
                    <MenuItem key={cp} value={cp}>{cp}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Booking Location"
                name="BookingLocation"
                value={form.BookingLocation || ''}
                onChange={handleInputChange}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Currency Pair</InputLabel>
                <Select
                  name="CurrencyPair"
                  value={form.CurrencyPair || ''}
                  onChange={handleSelectChange}
                  label="Currency Pair"
                >
                  <MenuItem value=""><em>-- Select Currency Pair --</em></MenuItem>
                  {currencyPairOptions.map((pair) => (
                    <MenuItem key={pair} value={pair}>{pair}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Settlement Currency</InputLabel>
                <Select name="SettlementCurrency" value={form.SettlementCurrency || ''} onChange={handleSelectChange} label="Settlement Currency">
                  {settlementCurrencies.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              {/* Currency-specific fields for Forex */}
              {form.SettlementCurrency && forexCurrencyFieldConfig[form.SettlementCurrency] && (
                <>
                  {forexCurrencyFieldConfig[form.SettlementCurrency].required.map((field) => (
                    <TextField
                      key={field}
                      label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' *'}
                      name={field}
                      value={form[field] || ''}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  ))}
                  {forexCurrencyFieldConfig[form.SettlementCurrency].optional.map((field) => (
                    <TextField
                      key={field}
                      label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      name={field}
                      value={form[field] || ''}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  ))}
                  {/* Settlement Method Dropdown */}
                  <FormControl fullWidth>
                    <InputLabel>Settlement Method</InputLabel>
                    <Select
                      name="settlement_method"
                      value={form.settlement_method || ''}
                      onChange={handleSelectChange}
                      label="Settlement Method"
                    >
                      {forexCurrencyFieldConfig[form.SettlementCurrency].settlementMethods.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
              <TextField
                label="Effective Date"
                name="SettlementDate"
                type="date"
                value={form.SettlementDate ? (typeof form.SettlementDate === 'string' ? form.SettlementDate : new Date(form.SettlementDate).toISOString().slice(0, 10)) : ''}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Confirmation Status</InputLabel>
                <Select name="ConfirmationStatus" value={form.ConfirmationStatus || ''} onChange={handleSelectChange} label="Confirmation Status">
                  {ssiStatusForex.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Settlement Instruction</InputLabel>
                <Select name="SettlementInstruction" value={form.SettlementInstruction || ''} onChange={handleSelectChange} label="Settlement Instruction" required>
                  <MenuItem value="Special">Special</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          {record && (
            <TextField
              label="Edit Note"
              name="editNote"
              multiline
              rows={4}
              value={editNote}
              onChange={handleEditNoteChange}
              required
              error={!!editNoteError}
              helperText={editNoteError || 'Required: Provide a note explaining why you are making these changes'}
              fullWidth
            />
          )}
          {formError && <Alert severity="error">{formError}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isForexFormValid && assetClass === 'forex'}>{record ? 'Update' : 'Add'}</Button>
      </DialogActions>
    </Dialog>
  );
};

const SSIManagement: React.FC = () => {
  const [assetClass, setAssetClass] = useState<'equity' | 'forex'>('equity');
  const [equitySSI, setEquitySSI] = useState<any[]>([]);
  const [forexSSI, setForexSSI] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currencyPair, setCurrencyPair] = useState('');
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const { user, userProfile } = useAuth();
  const [auditNote, setAuditNote] = useState('');
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => Promise<void>)>(null);
  const dispatch = useDispatch();

  const fetchSSI = useCallback(async () => {
    try {
      if (assetClass === 'equity') {
        const data = await api.getSSIRecords('equity', searchTerm);
        setEquitySSI(data);
      } else {
        const data = await api.getSSIRecords('forex', searchTerm, currencyPair);
        setForexSSI(data);
      }
    } catch (error) {
      console.error('Error fetching SSI records:', error);
      setNotification({ open: true, message: 'Error fetching SSI records', severity: 'error' });
    }
  }, [assetClass, searchTerm, currencyPair]);

  useEffect(() => {
    fetchSSI();
  }, [fetchSSI]);

  // Sync latest SSI to Redux
  useEffect(() => {
    // Dispatch latest SSI based on asset class
    if (assetClass === 'equity' && equitySSI.length > 0) {
      console.log('Dispatching latest equity SSI to Redux:', equitySSI[0]);
      dispatch(setLatestSSI(equitySSI[0]));
    } else if (assetClass === 'forex' && forexSSI.length > 0) {
      console.log('Dispatching latest forex SSI to Redux:', forexSSI[0]);
      dispatch(setLatestForexSSI(forexSSI[0]));
    }
  }, [equitySSI, forexSSI, assetClass, dispatch]);

  // Helper to show audit confirmation modal
  const confirmAudit = (note: string, action: () => Promise<void>) => {
    setAuditNote(note);
    setPendingAction(() => action);
    setAuditModalOpen(true);
  };

  const handleAuditConfirm = async () => {
    setAuditModalOpen(false);
    if (pendingAction) await pendingAction();
    setPendingAction(null);
  };

  // --- Add/Edit/Delete logic with audit logging ---

  const handleSave = async (data: any) => {
    const entityType = assetClass === 'equity' ? 'EquitySSI' : 'ForexSSI';
    let note = '';
    note = (data.editNote ? `${data.editNote} for ClientID: ${data.ClientID}` : `Updated ${entityType} for ClientID: ${data.ClientID}`);
    const action = editRecord ? 'Updated SSI' : 'Added SSI';
    confirmAudit(note, async () => {
      try {
        if (editRecord) {
          await api.updateSSIRecord(assetClass, editRecord._id, data);
        } else {
          let savedSSI: any;
          savedSSI = await api.addSSIRecord(assetClass, data);
          if (assetClass === 'equity') {
            // Add to beginning of array to show in first row
            setEquitySSI(prev => [savedSSI, ...prev]);
          } else {
            // Add to beginning of array to show in first row
            setForexSSI(prev => [savedSSI, ...prev]);
          }
        }
        await addAuditLog({
          user: userProfile?.displayName || user?.email || 'Unknown',
          action,
          instrumentType: entityType,
          editNote: note,
          changes: data,
        });
        setNotification({ open: true, message: editRecord ? 'Record updated successfully' : 'Record added successfully', severity: 'success' });
        setAddEditModalOpen(false);
        setEditRecord(null);
        fetchSSI();
      } catch (error) {
        console.error('Error saving record:', error);
        setNotification({ open: true, message: 'Error saving record', severity: 'error' });
      }
    });
  };

  const handleDelete = async (id: string) => {
    const record = assetClass === 'equity' ? equitySSI.find((r) => r._id === id) : forexSSI.find((r) => r._id === id);
    const entityType = assetClass === 'equity' ? 'EquitySSI' : 'ForexSSI';
    let note = '';
    note = `Deleted ${entityType} for ClientID: ${record?.ClientID}`;
    const action = 'Deleted SSI';
    confirmAudit(note, async () => {
      try {
        await api.deleteSSIRecord(assetClass, id);
        await addAuditLog({
          user: userProfile?.displayName || user?.email || 'Unknown',
          action,
          instrumentType: entityType,
          editNote: note,
          changes: record,
        });
        fetchSSI();
        setNotification({ open: true, message: 'Record deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting record:', error);
        setNotification({ open: true, message: 'Error deleting record', severity: 'error' });
      }
    });
  };

  const handleAddEdit = (record?: any) => {
    setEditRecord(record || null);
    setAddEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setAddEditModalOpen(false);
    setEditRecord(null);
  }

  const renderEquityTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Client Id</TableCell>
            <TableCell>Counterparty</TableCell>
            <TableCell>Custodian Name</TableCell>
            <TableCell>Custodian Ac no</TableCell>
            <TableCell>Beneficiary Client ID</TableCell>
            <TableCell>Settlement Cycle</TableCell>
            <TableCell>Settlement Currency</TableCell>
            <TableCell>Effective Date</TableCell>
            <TableCell>Confirmation Status</TableCell>
            <TableCell>Margin type</TableCell>
            <TableCell>Margin status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equitySSI.map((row) => {
            const currency = row.SettlementCurrency;
            const config = currency && currencyFieldConfig[currency] ? currencyFieldConfig[currency] : { required: [], optional: [] };
            const allFields = [...config.required, ...config.optional, 'settlement_method'];
            return (
              <React.Fragment key={row._id}>
                <TableRow>
                  <TableCell>
                    <IconButton size="small" onClick={() => setExpandedRow(expandedRow === row._id ? null : row._id)}>
                      {expandedRow === row._id ? '-' : '+'}
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.ClientID}</TableCell>
                  <TableCell>{row.Counterparty}</TableCell>
                  <TableCell>{row.CustodianName}</TableCell>
                  <TableCell>{row.CustodianAccountNo}</TableCell>
                  <TableCell>{row.BeneficiaryClientID}</TableCell>
                  <TableCell>{row.SettlementCycle}</TableCell>
                  <TableCell>{row.SettlementCurrency}</TableCell>
                  <TableCell>{row.SettlementDate ? new Date(row.SettlementDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{row.ConfirmationStatus}</TableCell>
                  <TableCell>{row.MarginType}</TableCell>
                  <TableCell>{row.MarginStatus}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleAddEdit(row)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={13}>
                    <Collapse in={expandedRow === row._id} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="subtitle2" gutterBottom>Settlement Details</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {allFields.filter((field) => row[field] && row[field] !== 'N/A' && row[field] !== '').map((field) => {
                            let label = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            if (field === 'settlement_method') label = 'Method';
                            if (field === 'swift_bic_code') label = 'SWIFT';
                            if (field === 'aba_routing_number') label = 'ABA';
                            if (field === 'bsb_code') label = 'BSB';
                            if (field === 'zengin_code') label = 'Zengin';
                            if (field === 'iban') label = 'IBAN';
                            if (field === 'sort_code') label = 'Sort Code';
                            if (field === 'beneficiary_name') label = 'Beneficiary';
                            if (field === 'account_number') label = 'Account No';
                            return (
                              <Box key={field} sx={{ minWidth: 180 }}>
                                <strong>{label}:</strong> {row[field]}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderForexTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Client Id</TableCell>
            <TableCell>Counterparty</TableCell>
            <TableCell>Booking Location</TableCell>
            <TableCell>Currency Pair</TableCell>
            <TableCell>Settlement Currency</TableCell>
            <TableCell>Effective Date</TableCell>
            <TableCell>Settlement Instruction</TableCell>
            <TableCell>Confirmation Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forexSSI.map((row) => {
            const currency = row.SettlementCurrency;
            const config = forexCurrencyFieldConfig[currency] || { required: [], optional: [], settlementMethods: [] };
            const allFields = [...config.required, ...config.optional, 'settlement_method'];
            return (
              <React.Fragment key={row._id}>
                <TableRow>
                  <TableCell>
                    <IconButton size="small" onClick={() => setExpandedRow(expandedRow === row._id ? null : row._id)}>
                      {expandedRow === row._id ? '-' : '+'}
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.ClientID}</TableCell>
                  <TableCell>{row.Counterparty}</TableCell>
                  <TableCell>{row.BookingLocation}</TableCell>
                  <TableCell>{row.CurrencyPair}</TableCell>
                  <TableCell>{row.SettlementCurrency}</TableCell>
                  <TableCell>{row.SettlementDate ? new Date(row.SettlementDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{row.SettlementInstruction}</TableCell>
                  <TableCell>{row.ConfirmationStatus}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleAddEdit(row)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(row._id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                    <Collapse in={expandedRow === row._id} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="subtitle2" gutterBottom>Settlement Details</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {allFields.filter((field) => row[field] && row[field] !== 'N/A' && row[field] !== '').map((field) => {
                            let label = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            if (field === 'settlement_method') label = 'Method';
                            if (field === 'swift_bic_code') label = 'SWIFT';
                            if (field === 'aba_routing_number') label = 'ABA';
                            if (field === 'bsb_code') label = 'BSB';
                            if (field === 'zengin_code') label = 'Zengin';
                            if (field === 'iban') label = 'IBAN';
                            if (field === 'sort_code') label = 'Sort Code';
                            if (field === 'beneficiary_name') label = 'Beneficiary';
                            if (field === 'account_number') label = 'Account No';
                            return (
                              <Box key={field} sx={{ minWidth: 180 }}>
                                <strong>{label}:</strong> {row[field]}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>SSI Data Management</Typography>
      </Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 180, maxWidth: 240 }}>
          <InputLabel>Asset Class</InputLabel>
          <Select value={assetClass} label="Asset Class" onChange={e => setAssetClass(e.target.value as 'equity' | 'forex')}>
            <MenuItem value="equity">Equity</MenuItem>
            <MenuItem value="forex">Forex</MenuItem>
          </Select>
        </FormControl>
        <TextField size="small" label="Search by Client ID" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} sx={{ minWidth: 220, maxWidth: 320 }} />
        {assetClass === 'forex' && (
          <TextField size="small" label="Search by Currency Pair" value={currencyPair} onChange={e => setCurrencyPair(e.target.value)} sx={{ minWidth: 180, maxWidth: 240 }} />
        )}
      </Box>
      <Box sx={{ mb: 4 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddEdit()}>Add SSI</Button>
      </Box>
      {assetClass === 'equity' ? renderEquityTable() : renderForexTable()}
      <AddEditSSIModal
        open={addEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        assetClass={assetClass}
        record={editRecord}
      />
      <Snackbar open={notification.open} autoHideDuration={3000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>{notification.message}</Alert>
      </Snackbar>
      <Dialog open={auditModalOpen} onClose={() => setAuditModalOpen(false)}>
        <DialogTitle>Confirm Audit Note</DialogTitle>
        <DialogContent>
          <p>Do you want to save this change and log the following note?</p>
          <Box sx={{ bgcolor: '#f0f4ff', p: 2, borderRadius: 1, mt: 1 }}>{auditNote}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAuditConfirm} variant="contained">Confirm & Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SSIManagement; 