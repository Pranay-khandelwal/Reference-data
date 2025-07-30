import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  setPrefilledData, 
  updateFormField, 
  clearFormData, 
  resetToPrefilled 
} from '../../store/slices/consolidatedDataSlice';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, Edit as EditIcon, Cancel as CancelIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import * as api from '../../services/api';

const FOREX_COLUMNS = [
  'CurrencyPair', 'BaseCurrency', 'TermCurrency', 'ExecutionVenue', 'ProductType', 'ClientID_Forex', 'Counterparty', 'BookingLocation', 'Portfolio', 'Custodian_Name', 'NettingEligibility', 'KYC_Status_Forex', 'SanctionsScreening', 'ExpenseApprovalStatus', 'SettlementCurrency', 'EffectiveDate_Forex', 'SettlementInstructions', 'ConfirmationStatus', 'SWIFT_Forex', 'accountNumber', 'IBAN_Forex', 'BSB_Forex', 'SORT_Forex', 'Beneficiary_Client_ID', 'SettlementMethod', 'ZENGIN', 'ABA Routing No.'
];

// Table columns include the id field for display purposes
const TABLE_COLUMNS = [...FOREX_COLUMNS, 'id'];

const emptyRow = FOREX_COLUMNS.reduce((acc, col) => ({ ...acc, [col]: '' }), {});

const ConsolidatedData: React.FC = () => {
  const dispatch = useDispatch();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [uploadRow, setUploadRow] = useState<any>(emptyRow);
  const [uploading, setUploading] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  // Get latest entries from Redux
  const latestInstrument = useSelector((state: RootState) => state.forexInstrument.latestForexInstrument);
  const latestClient = useSelector((state: RootState) => state.forexClient.latestForexClient);
  const latestSSI = useSelector((state: RootState) => state.forexSSI.latestForexSSI);
  
  // Get consolidated data state from Redux
  const { prefilledData, currentFormData, isPrefilled } = useSelector((state: RootState) => state.consolidatedData);

  // Function to prefill form with first row data
  const prefillWithFirstRow = useCallback(() => {
    if (rows.length > 0) {
      const firstRow = rows[0];
      const prefilledRow = { ...firstRow };
      
      // Remove the id field from prefilled data
      delete prefilledRow.id;
      
      dispatch(setPrefilledData(prefilledRow));
      setUploadRow(prefilledRow);
    }
  }, [rows, dispatch]);

  // Function to manually fetch and sync latest data
  const fetchAndSyncLatestData = useCallback(async () => {
    try {
      console.log('=== MANUALLY FETCHING LATEST DATA ===');
      
      // Fetch latest data from each source
      const [latestInstruments, latestClients, latestSSIs] = await Promise.all([
        api.getForexInstruments(),
        api.getForexClients(),
        api.getSSIRecords('forex')
      ]);
      
      console.log('Latest instruments:', latestInstruments);
      console.log('Latest clients:', latestClients);
      console.log('Latest SSIs:', latestSSIs);
      
      // Get the first (newest) record from each source
      const latestInstrument = latestInstruments.length > 0 ? latestInstruments[0] : null;
      const latestClient = latestClients.length > 0 ? latestClients[0] : null;
      const latestSSI = latestSSIs.length > 0 ? latestSSIs[0] : null;
      
      console.log('Selected latest instrument:', latestInstrument);
      console.log('Selected latest client:', latestClient);
      console.log('Selected latest SSI:', latestSSI);
      
      // Create combined data
      const combinedData: any = {};
      
      // Add instrument data
      if (latestInstrument) {
        Object.assign(combinedData, {
          CurrencyPair: latestInstrument.CurrencyPair,
          BaseCurrency: latestInstrument.BaseCurrency,
          TermCurrency: latestInstrument.TermCurrency,
          ExecutionVenue: latestInstrument.ExecutionVenue,
          ProductType: latestInstrument.ProductType,
          Portfolio: latestInstrument.Portfolio,
          TradeSourceSystem: latestInstrument.TradeSourceSystem || 'N/A',
          Custodian: latestInstrument.Custodian,
          SettlementInstructions: latestInstrument.SettlementInstructions,
          NettingEligibility: latestInstrument.NettingEligibility,
          KYCStatus: latestInstrument.KYCStatus,
          SanctionsScreening: latestInstrument.SanctionsScreening,
          CostCenter: latestInstrument.CostCenter,
          ExpenseApprovalStatus: latestInstrument.ExpenseApprovalStatus,
        });
      }
      
      // Add client data
      if (latestClient) {
        Object.assign(combinedData, {
          ClientID_Forex: latestClient.ClientID,
          Counterparty: latestClient.Counterparty,
          Portfolio: latestClient.Portfolio || combinedData.Portfolio,
          Custodian_Name: latestClient.Custodian,
          NettingEligibility: latestClient.NettingEligibility || combinedData.NettingEligibility,
          KYC_Status_Forex: latestClient.KYCStatus,
          SanctionsScreening: latestClient.SanctionsScreening || combinedData.SanctionsScreening,
          ExpenseApprovalStatus: latestClient.ExpenseApprovalStatus || combinedData.ExpenseApprovalStatus,
        });
      }
      
      // Add SSI data - BookingLocation should come from SSI first row
      if (latestSSI) {
        Object.assign(combinedData, {
          BookingLocation: latestSSI.BookingLocation || 'N/A', // Get BookingLocation from SSI first row
          SettlementCurrency: latestSSI.SettlementCurrency,
          SettlementInstructions: latestSSI.SettlementInstruction || combinedData.SettlementInstructions,
          ConfirmationStatus: latestSSI.ConfirmationStatus,
          EffectiveDate_Forex: latestSSI.SettlementDate,
          SWIFT_Forex: latestSSI.swift_bic_code,
          accountNumber: latestSSI.account_number,
          IBAN_Forex: latestSSI.iban,
          BSB_Forex: latestSSI.bsb_code,
          SORT_Forex: latestSSI.sort_code,
          ZENGIN: latestSSI.zengin_code,
          'ABA Routing No.': latestSSI.aba_routing_number,
          SettlementMethod: latestSSI.settlement_method,
          Beneficiary_Client_ID: latestSSI.beneficiary_name,
        });
      }
      
      console.log('Final combined data:', combinedData);
      
      // Set the combined data
      dispatch(setPrefilledData(combinedData));
      setUploadRow(combinedData);
      
    } catch (error) {
      console.error('Error fetching latest data:', error);
    }
  }, [dispatch]);

  // Function to sync with latest data from Redux store
  const syncWithLatestData = useCallback(() => {
    console.log('=== REDUX DATA DEBUG ===');
    console.log('Latest Instrument:', latestInstrument);
    console.log('Latest Client:', latestClient);
    console.log('Latest SSI:', latestSSI);
    
    // Create a combined data object from all three sources
    const combinedData: any = {};
    
    // Track which fields come from which source
    const sourceTracking: any = {};
    
    // Start with instrument data
    if (latestInstrument) {
      console.log('Adding instrument data:', latestInstrument);
      Object.assign(combinedData, {
        CurrencyPair: latestInstrument.CurrencyPair,
        BaseCurrency: latestInstrument.BaseCurrency,
        TermCurrency: latestInstrument.TermCurrency,
        ExecutionVenue: latestInstrument.ExecutionVenue,
        ProductType: latestInstrument.ProductType,
        Portfolio: latestInstrument.Portfolio,
        TradeSourceSystem: latestInstrument.TradeSourceSystem || 'N/A',
        Custodian: latestInstrument.Custodian,
        SettlementInstructions: latestInstrument.SettlementInstructions,
        NettingEligibility: latestInstrument.NettingEligibility,
        KYCStatus: latestInstrument.KYCStatus,
        SanctionsScreening: latestInstrument.SanctionsScreening,
        CostCenter: latestInstrument.CostCenter,
        ExpenseApprovalStatus: latestInstrument.ExpenseApprovalStatus,
      });
      Object.keys(combinedData).forEach(key => {
        sourceTracking[key] = 'Instrument';
      });
    } else {
      console.log('No instrument data available');
    }
    
    // Merge client data (overwrite any duplicate fields)
    if (latestClient) {
      console.log('Adding client data:', latestClient);
      Object.assign(combinedData, {
        ClientID_Forex: latestClient.ClientID,
        Counterparty: latestClient.Counterparty,
        Portfolio: latestClient.Portfolio || combinedData.Portfolio,
        Custodian_Name: latestClient.Custodian,
        NettingEligibility: latestClient.NettingEligibility || combinedData.NettingEligibility,
        KYC_Status_Forex: latestClient.KYCStatus,
        SanctionsScreening: latestClient.SanctionsScreening || combinedData.SanctionsScreening,
        ExpenseApprovalStatus: latestClient.ExpenseApprovalStatus || combinedData.ExpenseApprovalStatus,
      });
      Object.keys(latestClient).forEach(key => {
        if (key !== 'id' && key !== '_id') {
          sourceTracking[key] = 'Client';
        }
      });
    } else {
      console.log('No client data available');
    }
    
    // Merge SSI data (overwrite any duplicate fields) - BookingLocation should come from SSI first row
    if (latestSSI) {
      console.log('Adding SSI data:', latestSSI);
      Object.assign(combinedData, {
        BookingLocation: latestSSI.BookingLocation || 'N/A', // Get BookingLocation from SSI first row
        SettlementCurrency: latestSSI.SettlementCurrency,
        SettlementInstructions: latestSSI.SettlementInstruction || combinedData.SettlementInstructions,
        ConfirmationStatus: latestSSI.ConfirmationStatus,
        EffectiveDate_Forex: latestSSI.SettlementDate,
        SWIFT_Forex: latestSSI.swift_bic_code,
        accountNumber: latestSSI.account_number,
        IBAN_Forex: latestSSI.iban,
        BSB_Forex: latestSSI.bsb_code,
        SORT_Forex: latestSSI.sort_code,
        ZENGIN: latestSSI.zengin_code,
        'ABA Routing No.': latestSSI.aba_routing_number,
        SettlementMethod: latestSSI.settlement_method,
        Beneficiary_Client_ID: latestSSI.beneficiary_name,
      });
      Object.keys(latestSSI).forEach(key => {
        if (key !== 'id' && key !== '_id') {
          sourceTracking[key] = 'SSI';
        }
      });
    } else {
      console.log('No SSI data available');
    }
    
    console.log('Final combined data:', combinedData);
    console.log('Source tracking:', sourceTracking);
    
    // Set the combined data
    dispatch(setPrefilledData(combinedData));
    setUploadRow(combinedData);
    
  }, [latestInstrument, latestClient, latestSSI, dispatch]);

  // Function to handle manual field changes that override prefilled data
  const handleManualFieldChange = (col: string, value: string) => {
    const updatedRow = { ...uploadRow, [col]: value };
    setUploadRow(updatedRow);
    
    // Update Redux state to track the change
    dispatch(updateFormField({ field: col, value }));
  };

  // Function to reset form to prefilled data
  const resetToPrefilledData = () => {
    if (prefilledData) {
      setUploadRow({ ...prefilledData });
      dispatch(resetToPrefilled());
    }
  };

  // Function to clear form completely
  const clearForm = () => {
    setUploadRow(emptyRow);
    dispatch(clearFormData());
  };

  // Function to get count of changed fields
  const getChangedFieldsCount = () => {
    if (!isPrefilled || !prefilledData) return 0;
    return FOREX_COLUMNS.filter(col => uploadRow[col] !== prefilledData[col]).length;
  };

  // Function to get list of changed fields
  const getChangedFields = () => {
    if (!isPrefilled || !prefilledData) return [];
    return FOREX_COLUMNS.filter(col => uploadRow[col] !== prefilledData[col]);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getReferenceData();
      console.log('Fetched data from Firebase:', data);
      
      // Debug: Show the field name transformations
      console.log('=== FIELD NAME MAPPING DEBUG ===');
      FOREX_COLUMNS.forEach(col => {
        const sanitized = col.replace(/[^a-zA-Z0-9_]/g, '_');
        console.log(`Original: "${col}" -> Sanitized: "${sanitized}"`);
      });
      console.log('=== END FIELD NAME MAPPING DEBUG ===');
      
      // Use the data directly without complex mapping
      const mappedData = data.map((row: any) => {
        // Create a new object with all the required columns
        const mappedRow: any = {};
        
        // Initialize all columns with empty values
        FOREX_COLUMNS.forEach(col => {
          mappedRow[col] = '';
        });
        
        // Copy data from Firebase, handling both original and sanitized field names
        Object.keys(row).forEach(key => {
          if (key === 'id') {
            mappedRow.id = row.id;
          } else {
            // Check if the key exactly matches a FOREX_COLUMN
            if (FOREX_COLUMNS.includes(key)) {
              mappedRow[key] = row[key];
            } else {
              // Check if the key is a sanitized version of a FOREX_COLUMN
              // Create a mapping of sanitized keys to original keys
              const sanitizedToOriginal: { [key: string]: string } = {};
              FOREX_COLUMNS.forEach(col => {
                const sanitized = col.replace(/[^a-zA-Z0-9_]/g, '_');
                sanitizedToOriginal[sanitized] = col;
              });
              
              // Debug: Log the current key and available mappings
              console.log(`Processing Firebase key: "${key}"`);
              console.log(`Available sanitized mappings:`, sanitizedToOriginal);
              
              // Check if the current key matches any sanitized version
              if (sanitizedToOriginal[key]) {
                mappedRow[sanitizedToOriginal[key]] = row[key];
                console.log(`✓ Mapped sanitized field "${key}" back to "${sanitizedToOriginal[key]}" with value "${row[key]}"`);
              } else {
                console.log(`✗ No mapping found for key "${key}"`);
              }
            }
          }
        });
        
        return mappedRow;
      });
      
      console.log('Mapped data for table:', mappedData);
      setRows(mappedData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setNotification({ open: true, message: err.message || 'Failed to fetch data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-prefill with first row when data is loaded and no prefilled data exists
  useEffect(() => {
    if (rows.length > 0 && !isPrefilled) {
      prefillWithFirstRow();
    }
  }, [rows, isPrefilled, prefillWithFirstRow]);

  // Sync with latest data from Redux when it changes
  useEffect(() => {
    // Always sync when any Redux state changes, even if some are null
    console.log('Redux state changed, syncing with latest data:', { 
      latestInstrument: latestInstrument ? 'Available' : 'Not available',
      latestClient: latestClient ? 'Available' : 'Not available', 
      latestSSI: latestSSI ? 'Available' : 'Not available'
    });
    syncWithLatestData();
  }, [latestInstrument, latestClient, latestSSI, syncWithLatestData]);

  const handleEdit = (idx: number) => {
    console.log('Starting edit for row index:', idx);
    console.log('Row data:', rows[idx]);
    setEditIdx(idx);
    // Create a clean copy of the row data for editing
    const editData = { ...rows[idx] };
    console.log('Edit data prepared:', editData);
    setEditRow(editData);
  };

  const handleEditChange = (col: string, value: string) => {
    console.log('Editing field:', col, 'New value:', value);
    setEditRow((prev: any) => {
      const updated = { ...prev, [col]: value };
      console.log('Updated edit row:', updated);
      return updated;
    });
  };

  const handleEditSave = async () => {
    console.log('Saving edit...');
    console.log('Edit row data:', editRow);
    console.log('Edit index:', editIdx);
    
    if (!editRow.id) {
      console.error('No document ID found for editing');
      setNotification({ open: true, message: 'No document ID found for editing', severity: 'error' });
      return;
    }
    
    try {
      // Create a clean data object for Firebase update - ALLOW ALL FIELDS TO BE EDITED
      const updateData = { ...editRow };
      
      // Ensure all required fields are present
      FOREX_COLUMNS.forEach(col => {
        if (!(col in updateData)) {
          updateData[col] = '';
        }
      });
      
      console.log('Data to update in Firebase:', updateData);
      
      // Use the edited ID if it was changed, otherwise use the original
      const documentId = editRow.id;
      await api.updateReferenceData(documentId, updateData);
      setNotification({ open: true, message: 'Row updated successfully', severity: 'success' });
      
      // Update the local state
      setRows((prev) => prev.map((row, idx) => (idx === editIdx ? { ...editRow } : row)));
      setEditIdx(null);
      setEditRow(null);
    } catch (err: any) {
      console.error('Error saving edit:', err);
      setNotification({ open: true, message: err.message || 'Failed to update row', severity: 'error' });
    }
  };

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditRow(null);
  };

  const handleDeleteRow = async (id: string) => {
    try {
      await api.deleteReferenceData(id);
      setNotification({ open: true, message: 'Row deleted successfully', severity: 'success' });
      setRows((prev) => prev.filter((row) => row.id !== id));
      setEditIdx(null);
      setEditRow(null);
    } catch (err: any) {
      setNotification({ open: true, message: err.message || 'Failed to delete row', severity: 'error' });
    }
  };

  const handleUploadChange = (col: string, value: string) => {
    handleManualFieldChange(col, value);
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      // Pre-process the row to replace empty fields with "N/A"
      const processedRow = { ...uploadRow };
      
      // Remove the document ID as it's only for matching purposes
      delete processedRow.id;
      
      // Debug: Log the ABA number before processing
      console.log('ABA Routing No. before processing:', processedRow['ABA Routing No.']);
      
      FOREX_COLUMNS.forEach(col => {
        if (processedRow[col] === '' || processedRow[col] === null || processedRow[col] === undefined) {
          processedRow[col] = 'N/A';
        }
      });
      
      // Ensure TradeSourceSystem is never undefined
      if (processedRow.TradeSourceSystem === undefined) {
        processedRow.TradeSourceSystem = 'N/A';
      }
      
      // Ensure ABA Routing No. is properly handled
      if (processedRow['ABA Routing No.'] === undefined || processedRow['ABA Routing No.'] === '') {
        processedRow['ABA Routing No.'] = 'N/A';
      }
      
      // Debug: Log the ABA number after processing
      console.log('ABA Routing No. after processing:', processedRow['ABA Routing No.']);
      console.log('Saving new row to Firebase:', processedRow);
      
      const savedRow = await api.addReferenceData(processedRow);
      console.log('Row saved with new ID:', savedRow);
      
      setNotification({ open: true, message: 'Row uploaded successfully', severity: 'success' });
      
      // Completely clear the form for fresh manual entry
      setUploadRow(emptyRow);
      dispatch(clearFormData());
      
      // Refresh the table to show the new document ID from Firebase
      await fetchData();
      
    } catch (err: any) {
      console.error('Error uploading row:', err);
      setNotification({ open: true, message: err.message || 'Failed to upload row', severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="text"
          size="small"
          onClick={() => setShowButtons(!showButtons)}
          sx={{ 
            minWidth: 'auto', 
            px: 1, 
            py: 0.5,
            fontSize: '0.75rem',
            color: 'text.secondary'
          }}
        >
          {showButtons ? 'Hide Controls' : 'Show Controls'}
        </Button>
        
        {showButtons && (
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={syncWithLatestData}
            >
              Sync Latest Data
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={fetchAndSyncLatestData}
            >
              Fetch & Sync Data
            </Button>
            <Button
              variant="outlined"
              color="info"
              onClick={clearForm}
            >
              Clear Form
            </Button>
          </>
        )}
      </Box>
      <Paper sx={{ mb: 3, p: 2 }}>
        {isPrefilled && (
          <Box sx={{ mb: 2, p: 1, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
            <Typography variant="body2" color="primary">
              ✓ Form prefilled with combined data from Instrument Management, Client Onboarding, and SSI Data Management. You can manually edit any field to override the prefilled values.
            </Typography>
            {getChangedFieldsCount() > 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                📝 {getChangedFieldsCount()} field(s) modified: {getChangedFields().join(', ')}
              </Typography>
            )}
          </Box>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {FOREX_COLUMNS.map((col) => {
            const isChanged = isPrefilled && prefilledData && uploadRow[col] !== prefilledData[col];
            return (
              <TextField
                key={col}
                label={col}
                value={uploadRow[col] || ''}
                onChange={e => handleUploadChange(col, e.target.value)}
                size="small"
                sx={{ 
                  minWidth: 180,
                  '& .MuiInputBase-input': {
                    backgroundColor: isChanged ? '#fff3cd' : 'transparent',
                    borderColor: isChanged ? '#ffc107' : 'transparent',
                  },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: isChanged ? '#ffc107' : undefined,
                    },
                  }
                }}
                InputProps={{
                  readOnly: false,
                }}
                helperText={isChanged ? 'Manually changed' : ''}
              />
            );
          })}
          <Tooltip title={isPrefilled && getChangedFieldsCount() > 0 ? `Saving with ${getChangedFieldsCount()} modified fields` : 'Save new record'}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleUpload}
              disabled={uploading}
              sx={{ alignSelf: 'flex-end', minWidth: 160 }}
            >
              {uploading ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </Tooltip>
        </Box>
      </Paper>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {TABLE_COLUMNS.map((col) => (
                <TableCell key={col}>{col}</TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={TABLE_COLUMNS.length + 1} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={TABLE_COLUMNS.length + 1} align="center">
                  No data found
                </TableCell>
              </TableRow>
            ) : rows.map((row, idx) => (
              <TableRow key={row.id || idx}>
                {TABLE_COLUMNS.map((col) => (
                  <TableCell key={col}>
                    {editIdx === idx ? (
                      <TextField
                        value={editRow && editRow[col] ? editRow[col] : ''}
                        onChange={e => handleEditChange(col, e.target.value)}
                        size="small"
                        InputProps={{
                          readOnly: false, // Remove read-only restriction - all fields editable
                        }}
                        sx={{
                          '& .MuiInputBase-input': {
                            backgroundColor: 'transparent', // Remove gray background
                          }
                        }}
                        fullWidth
                      />
                    ) : (
                      row[col] || ''
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  {editIdx === idx ? (
                    <>
                      <IconButton color="primary" onClick={handleEditSave} title="Save changes">
                        <SaveIcon />
                      </IconButton>
                      <IconButton color="error" onClick={handleEditCancel} title="Cancel edit">
                        <CancelIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteRow(editRow.id)} title="Delete row">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton color="primary" onClick={() => handleEdit(idx)} title="Edit row">
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConsolidatedData; 