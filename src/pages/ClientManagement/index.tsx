import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setLatestClient } from '../../store/slices/clientSlice';
import { setLatestForexClient } from '../../store/slices/forexClientSlice';
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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import EditEquityClientModal from '../../components/EditEquityClientModal';
import EditForexClientModal from '../../components/EditForexClientModal';
import AddEquityClientModal from '../../components/AddEquityClientModal';
import AddForexClientModal from '../../components/AddForexClientModal/index';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { addAuditLog } from '../../firebase/services/audit';

interface BaseClient {
  _id: string;
  Counterparty: string;
  KYCStatus: string;
}

interface EquityClient extends BaseClient {
  ClientID: string;
  ReferenceDataValidated: string;
  MarginType: string;
  MarginStatus: string;
  ApprovalStatus: string;
  editNote?: string;
}

interface ForexClient extends BaseClient {
  ClientID: string;
  Portfolio: string;
  Custodian: string;
  NettingEligibility: string;
  KYCStatus: string;
  SanctionsScreening: string;
  ExpenseApprovalStatus: string;
  ApprovalStatus: string;
  editNote?: string;
}

interface RawClientData {
  id: string;
  ClientID?: string;
  ReferenceDataValidated?: string;
  MarginType?: string;
  MarginStatus?: string;
  ApprovalStatus?: string;
  approvalStatus?: string;
  Counterparty?: string;
  KYCStatus?: string;
  CurrencyPair?: string;
  Portfolio?: string;
  Custodian?: string;
  NettingEligibility?: string;
  SanctionsScreening?: string;
  ExpenseApprovalStatus?: string;
  [key: string]: any;
}

const ClientManagement: React.FC = () => {
  const [assetClass, setAssetClass] = useState<'equity' | 'forex'>('equity');
  const [equityClients, setEquityClients] = useState<EquityClient[]>([]);
  const [forexClients, setForexClients] = useState<ForexClient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState<string>('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>('');
  const [selectedEquityClient, setSelectedEquityClient] = useState<EquityClient | null>(null);
  const [selectedForexClient, setSelectedForexClient] = useState<ForexClient | null>(null);
  const [editEquityModalOpen, setEditEquityModalOpen] = useState(false);
  const [editForexModalOpen, setEditForexModalOpen] = useState(false);
  const [addEquityModalOpen, setAddEquityModalOpen] = useState(false);
  const [addForexModalOpen, setAddForexModalOpen] = useState(false);
  const [nextEquityClientID, setNextEquityClientID] = useState<string>('CID0001'); // NEW STATE
  const [nextForexClientID, setNextForexClientID] = useState<string>('CID0001'); // NEW STATE
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const { user, userProfile } = useAuth();
  const [auditNote, setAuditNote] = useState('');
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => Promise<void>)>(null);
  const dispatch = useDispatch();

  const fetchClients = useCallback(async () => {
    try {
      if (assetClass === 'equity') {
        const rawData = await api.getEquityClients() as RawClientData[];
        const data = rawData.map(client => ({
          ...client,
          _id: client.id,
          ClientID: client.ClientID || '',
          ReferenceDataValidated: client.ReferenceDataValidated || '',
          MarginType: client.MarginType || '',
          MarginStatus: client.MarginStatus || '',
          ApprovalStatus: client.ApprovalStatus || '',
          Counterparty: client.Counterparty || '',
          KYCStatus: client.KYCStatus || ''
        })) as EquityClient[];
        setEquityClients(data);
      } else {
        const rawData = await api.getForexClients() as RawClientData[];
        const data = rawData.map(client => ({
          ...client,
          _id: client.id,
          ClientID: client.ClientID || '',
          Portfolio: client.Portfolio || '',
          Custodian: client.Custodian || '',
          NettingEligibility: client.NettingEligibility || '',
          KYCStatus: client.KYCStatus || '',
          SanctionsScreening: client.SanctionsScreening || '',
          ExpenseApprovalStatus: client.ExpenseApprovalStatus || '',
          ApprovalStatus: client.ApprovalStatus || client.approvalStatus || '',
          Counterparty: client.Counterparty || ''
        })) as ForexClient[];
        setForexClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      showNotification('Error fetching clients', 'error');
    }
  }, [assetClass]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Sync latest client to Redux
  useEffect(() => {
    // Dispatch latest client based on asset class
    if (assetClass === 'equity' && equityClients.length > 0) {
      console.log('Dispatching latest equity client to Redux:', equityClients[0]);
      dispatch(setLatestClient(equityClients[0]));
    } else if (assetClass === 'forex' && forexClients.length > 0) {
      console.log('Dispatching latest forex client to Redux:', forexClients[0]);
      dispatch(setLatestForexClient(forexClients[0]));
    }
  }, [equityClients, forexClients, assetClass, dispatch]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let response: { records: any[] };
      if (assetClass === 'equity') {
        response = await api.uploadEquityClientCSV(file) as { records: any[] };
        showNotification('Equity client data imported successfully', 'success');
        if (response && response.records && response.records.length > 0) {
          setEquityClients(prev => [
            ...response.records.map((client: any) => ({ ...client, _id: client.id })),
            ...prev
          ]);
        } else {
          fetchClients();
        }
      } else {
        response = await api.uploadForexClientCSV(file) as { records: any[] };
        showNotification('Forex client data imported successfully', 'success');
        if (response && response.records && response.records.length > 0) {
          setForexClients(prev => [
            ...response.records.map((client: any) => ({ ...client, _id: client.id })),
            ...prev
          ]);
        } else {
          fetchClients();
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Error uploading file', 'error');
    }
  };

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

  const handleEditEquityClient = async (updatedClient: EquityClient) => {
    const note = (updatedClient.editNote ? `${updatedClient.editNote} for ClientID: ${updatedClient.ClientID}` : `Updated Equity Client for ClientID: ${updatedClient.ClientID}`);
    const action = 'Updated Equity Client';
    confirmAudit(note, async () => {
      try {
        await api.updateEquityClient(updatedClient);
        setEquityClients(prevClients =>
          prevClients.map(client =>
            client._id === updatedClient._id ? updatedClient : client
          )
        );
        await addAuditLog({
          user: userProfile?.displayName || user?.email || 'Unknown',
          action,
          instrumentType: 'EquityClient',
          editNote: note,
          changes: updatedClient,
        });
        showNotification('Equity client updated successfully', 'success');
      } catch (error) {
        console.error('Error updating equity client:', error);
        showNotification('Error updating equity client', 'error');
      }
    });
  };

  const handleEditForexClient = async (updatedClient: ForexClient) => {
    const note = (updatedClient.editNote ? `${updatedClient.editNote} for ClientID: ${updatedClient.ClientID}` : `Updated Forex Client for ClientID: ${updatedClient.ClientID}`);
    const action = 'Updated Forex Client';
    confirmAudit(note, async () => {
      try {
        await api.updateForexClient(updatedClient);
        setForexClients(prevClients =>
          prevClients.map(client =>
            client._id === updatedClient._id ? updatedClient : client
          )
        );
        await addAuditLog({
          user: userProfile?.displayName || user?.email || 'Unknown',
          action,
          instrumentType: 'ForexClient',
          editNote: note,
          changes: updatedClient,
        });
        showNotification('Forex client updated successfully', 'success');
      } catch (error) {
        console.error('Error updating forex client:', error);
        showNotification('Error updating forex client', 'error');
      }
    });
  };

  const handleDelete = async (id: string) => {
    const client = assetClass === 'equity'
      ? equityClients.find((c: EquityClient) => c._id === id)
      : forexClients.find((c: ForexClient) => c._id === id);
    const entityType = assetClass === 'equity' ? 'EquityClient' : 'ForexClient';
    let note = '';
    let action = '';
    if (assetClass === 'equity') {
      note = `Deleted ${entityType} for ClientID: ${client?.ClientID}`;
      action = 'Deleted Equity Client';
    } else {
      note = `Deleted ${entityType} for ClientID: ${(client as ForexClient)?.ClientID}`;
      action = 'Deleted Forex Client';
    }
    confirmAudit(note, async () => {
      try {
        if (assetClass === 'equity') {
          await api.deleteEquityClient(id);
          setEquityClients(prevClients => prevClients.filter(client => client._id !== id));
          showNotification('Equity client deleted successfully', 'success');
        } else {
          await api.deleteForexClient(id);
          setForexClients(prevClients => prevClients.filter(client => client._id !== id));
          showNotification('Forex client deleted successfully', 'success');
        }
        await addAuditLog({
          user: userProfile?.displayName || user?.email || 'Unknown',
          action,
          instrumentType: entityType,
          editNote: note,
          changes: client,
        });
      } catch (error) {
        console.error('Error deleting client:', error);
        showNotification('Error deleting client', 'error');
      }
    });
  };

  const handleClearAll = async () => {
    try {
      if (assetClass === 'equity') {
        await api.clearAllEquityClients();
        setEquityClients([]);
        showNotification('All equity clients deleted', 'success');
      } else {
        await api.clearAllForexClients();
        setForexClients([]);
        showNotification('All forex clients deleted', 'success');
      }
    } catch (error) {
      showNotification('Error clearing all clients', 'error');
    } finally {
      setClearDialogOpen(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Calculate counts for Approval Status
  const getApprovalStatusCounts = () => {
    const clients: (EquityClient | ForexClient)[] = assetClass === 'equity' ? equityClients : forexClients;
    // Apply other filters (search, KYC) but not Approval Status
    const filtered = clients.filter((client: any) => {
      const matchesSearch = searchTerm === '' ||
        (client.ClientID && client.ClientID.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.Counterparty && client.Counterparty.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesKyc = !kycFilter || (client.KYCStatus || '').toLowerCase() === kycFilter.toLowerCase();
      return matchesSearch && matchesKyc;
    });
    const approved = filtered.filter((client: any) => (client.ApprovalStatus || '').toLowerCase() === 'approved').length;
    const rejected = filtered.filter((client: any) => (client.ApprovalStatus || '').toLowerCase() === 'rejected').length;
    return { approved, rejected };
  };

  // Filter clients based on search term, KYC status, and Approval Status
  const filteredClients = (): (EquityClient | ForexClient)[] => {
    if (assetClass === 'equity') {
      return equityClients.filter((client: EquityClient) => {
        const matchesSearch = searchTerm === '' ||
          client.ClientID.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.Counterparty.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesKyc = !kycFilter || client.KYCStatus.toLowerCase() === kycFilter.toLowerCase();
        const matchesApproval = !approvalStatusFilter || (client.ApprovalStatus || '').toLowerCase() === approvalStatusFilter.toLowerCase();
        return matchesSearch && matchesKyc && matchesApproval;
      });
    } else {
      return forexClients.filter((client: ForexClient) => {
        const matchesSearch = searchTerm === '' ||
          client.ClientID.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.Counterparty.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesKyc = !kycFilter || client.KYCStatus.toLowerCase() === kycFilter.toLowerCase();
        const matchesApproval = !approvalStatusFilter || (client.ApprovalStatus || '').toLowerCase() === approvalStatusFilter.toLowerCase();
        return matchesSearch && matchesKyc && matchesApproval;
      });
    }
  };

  const handleDownload = async () => {
    try {
      const filters = {
        searchTerm,
        kycFilter,
      };

      if (assetClass === 'equity') {
        await api.downloadEquityClientCSV(filters);
      } else {
        await api.downloadForexClientCSV(filters);
      }
      showNotification('Download started successfully', 'success');
    } catch (error) {
      console.error('Error downloading data:', error);
      showNotification('Error downloading data', 'error');
    }
  };

  // Helper to compute next Client ID based on existing IDs
  const generateNextClientID = (clients: { ClientID: string }[]): string => {
    let maxNumeric = 0;
    clients.forEach((c) => {
      const match = /^CID(\d{4})$/.exec((c.ClientID || '').toUpperCase());
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumeric) maxNumeric = num;
      }
    });
    const nextNum = maxNumeric + 1;
    return `CID${nextNum.toString().padStart(4, '0')}`;
  };

  const renderEquityTable = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Client ID</TableCell>
            <TableCell>Counterparty</TableCell>
            <TableCell>KYC Status</TableCell>
            <TableCell>Reference Data Validated</TableCell>
            <TableCell>Margin Type</TableCell>
            <TableCell>Margin Status</TableCell>
            <TableCell>Approval Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredClients().map((client) => (
            <TableRow key={client._id}>
              <TableCell>{(client as EquityClient).ClientID}</TableCell>
              <TableCell>{client.Counterparty}</TableCell>
              <TableCell>{client.KYCStatus}</TableCell>
              <TableCell>{(client as EquityClient).ReferenceDataValidated}</TableCell>
              <TableCell>{(client as EquityClient).MarginType}</TableCell>
              <TableCell>{(client as EquityClient).MarginStatus}</TableCell>
              <TableCell>{(client as EquityClient).ApprovalStatus}</TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedEquityClient(client as EquityClient);
                    setEditEquityModalOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(client._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderForexTable = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Client ID</TableCell>
            <TableCell>Portfolio</TableCell>
            <TableCell>Counterparty</TableCell>
            <TableCell>Custodian</TableCell>
            <TableCell>Netting Eligibility</TableCell>
            <TableCell>KYC Status</TableCell>
            <TableCell>Sanctions Screening</TableCell>
            <TableCell>Expense Approval Status</TableCell>
            <TableCell>Approval Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredClients().map((client) => (
            <TableRow key={client._id}>
              <TableCell>{(client as ForexClient).ClientID}</TableCell>
              <TableCell>{(client as ForexClient).Portfolio}</TableCell>
              <TableCell>{client.Counterparty}</TableCell>
              <TableCell>{(client as ForexClient).Custodian}</TableCell>
              <TableCell>{(client as ForexClient).NettingEligibility}</TableCell>
              <TableCell>{client.KYCStatus}</TableCell>
              <TableCell>{(client as ForexClient).SanctionsScreening}</TableCell>
              <TableCell>{(client as ForexClient).ExpenseApprovalStatus}</TableCell>
              <TableCell>{(client as ForexClient).ApprovalStatus}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => {
                    setSelectedForexClient(client as ForexClient);
                    setEditForexModalOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(client._id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Client Onboarding
        </Typography>
      </Box>

      {/* Asset Class and Status Filters (like Instrument Management) */}
      <Box mb={4} display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2}>
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Asset Class</InputLabel>
            <Select
              value={assetClass}
              onChange={(e) => setAssetClass(e.target.value as 'equity' | 'forex')}
              label="Asset Class"
            >
              <MenuItem value="equity">Equity</MenuItem>
              <MenuItem value="forex">Forex</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
            Total: {assetClass === 'equity' ? equityClients.length : forexClients.length}
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          size="small"
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl fullWidth size="small">
          <InputLabel id="kyc-status-label" shrink={true}>KYC Status</InputLabel>
          <Select
            labelId="kyc-status-label"
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            label="KYC Status"
            displayEmpty
            renderValue={(selected) => selected === '' ? 'All' : selected.charAt(0).toUpperCase() + selected.slice(1)}
            inputProps={{ 'aria-label': 'KYC Status' }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
          {/* KYC Status Count Display */}
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: 14 }}>
            <span>Completed: {assetClass === 'equity' ? equityClients.filter(c => c.KYCStatus.toLowerCase() === 'completed').length : forexClients.filter(c => c.KYCStatus.toLowerCase() === 'completed').length}</span>
            <span>|</span>
            <span>Pending: {assetClass === 'equity' ? equityClients.filter(c => c.KYCStatus.toLowerCase() === 'pending').length : forexClients.filter(c => c.KYCStatus.toLowerCase() === 'pending').length}</span>
            <span>|</span>
            <span>Failed: {assetClass === 'equity' ? equityClients.filter(c => c.KYCStatus.toLowerCase() === 'failed').length : forexClients.filter(c => c.KYCStatus.toLowerCase() === 'failed').length}</span>
            <span>|</span>
            <span>Total: {assetClass === 'equity' ? equityClients.length : forexClients.length}</span>
          </Box>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel id="approval-status-label" shrink={true}>Approval Status</InputLabel>
          <Select
            labelId="approval-status-label"
            value={approvalStatusFilter}
            onChange={(e) => setApprovalStatusFilter(e.target.value)}
            label="Approval Status"
            displayEmpty
            renderValue={(selected) => selected === '' ? 'All' : selected.charAt(0).toUpperCase() + selected.slice(1)}
            inputProps={{ 'aria-label': 'Approval Status' }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
          {/* Approval Status Count Display */}
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: 14 }}>
            {(() => {
              const { approved, rejected } = getApprovalStatusCounts();
              if (approvalStatusFilter === '') {
                return (
                  <>
                    <span>Approved: {approved}</span>
                    <span>|</span>
                    <span>Rejected: {rejected}</span>
                    <span>|</span>
                    <span>Total: {approved + rejected}</span>
                  </>
                );
              } else if (approvalStatusFilter.toLowerCase() === 'approved') {
                return <span>Approved: {approved}</span>;
              } else if (approvalStatusFilter.toLowerCase() === 'rejected') {
                return <span>Rejected: {rejected}</span>;
              } else {
                return null;
              }
            })()}
          </Box>
        </FormControl>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
        >
          Upload CSV
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileUpload}
          />
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (assetClass === 'equity') {
              setNextEquityClientID(generateNextClientID(equityClients));
              setAddEquityModalOpen(true);
            } else {
              setNextForexClientID(generateNextClientID(forexClients));
              setAddForexModalOpen(true);
            }
          }}
        >
          Add Client
        </Button>
        <Button
          variant="contained"
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
        >
          Download Filtered Data
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setClearDialogOpen(true)}
        >
          Clear All
        </Button>
      </Box>

      {/* Tables */}
      {assetClass === 'equity' ? renderEquityTable() : renderForexTable()}

      {editEquityModalOpen && (
        <EditEquityClientModal
          open={editEquityModalOpen}
          onClose={() => setEditEquityModalOpen(false)}
          onSave={handleEditEquityClient}
          clientData={selectedEquityClient ?? {
            _id: '',
            ClientID: '',
            Counterparty: '',
            KYCStatus: '',
            ReferenceDataValidated: '',
            MarginType: '',
            MarginStatus: '',
            ApprovalStatus: '',
          }}
        />
      )}

      <EditForexClientModal
        open={editForexModalOpen}
        onClose={() => setEditForexModalOpen(false)}
        onSave={handleEditForexClient}
        clientData={selectedForexClient || {
          _id: '',
          ClientID: '',
          Counterparty: '',
          Portfolio: '',
          Custodian: '',
          NettingEligibility: '',
          KYCStatus: '',
          SanctionsScreening: '',
          ExpenseApprovalStatus: '',
          ApprovalStatus: '',
        }}
      />

      {addEquityModalOpen && (
        <AddEquityClientModal
          open={addEquityModalOpen}
          onClose={() => setAddEquityModalOpen(false)}
          initialClientID={nextEquityClientID}
          onSave={async (newClient) => {
            const note = `Added Equity Client for ClientID: ${newClient.ClientID}`;
            confirmAudit(note, async () => {
              try {
                const savedClient = await api.addEquityClient(newClient);
                // Add to beginning of array to show in first row
                setEquityClients(prev => [{ ...savedClient, _id: savedClient.id }, ...prev]);
                await addAuditLog({
                  user: userProfile?.displayName || user?.email || 'Unknown',
                  action: 'Added Equity Client',
                  instrumentType: 'EquityClient',
                  editNote: note,
                  changes: savedClient,
                });
                showNotification('Equity client added successfully', 'success');
              } catch (error) {
                showNotification('Error adding equity client', 'error');
              } finally {
                setAddEquityModalOpen(false);
              }
            });
          }}
        />
      )}

      {addForexModalOpen && (
        <AddForexClientModal
          open={addForexModalOpen}
          onClose={() => setAddForexModalOpen(false)}
          initialClientID={nextForexClientID}
          onSave={async (newClient) => {
            const note = `Added Forex Client for ClientID: ${newClient.ClientID}`;
            confirmAudit(note, async () => {
              try {
                const savedClient = await api.addForexClient(newClient);
                // Add to beginning of array to show in first row
                setForexClients(prev => [{ ...savedClient, _id: savedClient.id }, ...prev]);
                await addAuditLog({
                  user: userProfile?.displayName || user?.email || 'Unknown',
                  action: 'Added Forex Client',
                  instrumentType: 'ForexClient',
                  editNote: note,
                  changes: savedClient,
                });
                showNotification('Forex client added successfully', 'success');
              } catch (error) {
                showNotification('Error adding forex client', 'error');
              } finally {
                setAddForexModalOpen(false);
              }
            });
          }}
        />
      )}

      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Confirm Clear All</DialogTitle>
        <DialogContent>
          Are you sure you want to delete all {assetClass} clients? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearAll} color="error" variant="contained">Clear All</Button>
        </DialogActions>
      </Dialog>

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

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientManagement; 