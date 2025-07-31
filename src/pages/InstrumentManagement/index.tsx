import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setLatestInstrument } from '../../store/slices/instrumentSlice';
import { setLatestForexInstrument } from '../../store/slices/forexInstrumentSlice';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import AddInstrumentModal from '../../components/AddInstrumentModal';
import EditInstrumentModal from '../../components/EditInstrumentModal';
import EditForexModal from '../../components/EditForexModal';
import * as api from '../../services/api';
import { Instrument } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { addAuditLog } from '../../firebase/services/audit';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export interface EquityInstrument {
  _id: string;
  RID: string;
  ISIN: string;
  Symbol: string;
  TradingVenue: string;
  Currency: string;
  CountryOfTrade: string;
  Status?: string;
}

export interface ForexInstrument {
  _id: string;
  ClientID: string;
  CurrencyPair: string;
  BaseCurrency: string;
  TermCurrency: string;
  ExecutionVenue: string;
  ProductType: string;
  editNote?: string;
}

export interface FixedIncomeInstrument {
  _id: string;
  ISIN: string;
  Status: string;
  MaturityDate: string;
  CouponRate: number;
  CouponFrequency: string;
  IssuerName: string;
}

export interface FuturesInstrument {
  _id: string;
  ContractCode: string;
  UnderlyingAsset: string;
  ExpiryDate: string;
  LotSize: number;
  TradingVenue: string;
  Currency: string;
}

export interface OptionsInstrument {
  _id: string;
  ContractCode: string;
  UnderlyingAsset: string;
  OptionType: 'Call' | 'Put';
  StrikePrice: number;
  ExpiryDate: string;
  LotSize: number;
}

interface RawInstrumentData {
  id: string;
  RID?: string;
  ISIN?: string;
  Symbol?: string;
  TradingVenue?: string;
  Currency?: string;
  CountryOfTrade?: string;
  Status?: string;
  CurrencyPair?: string;
  BaseCurrency?: string;
  TermCurrency?: string;
  ExecutionVenue?: string;
  ProductType?: string;
  ClientID?: string;
  MaturityDate?: string;
  CouponRate?: number;
  CouponFrequency?: string;
  IssuerName?: string;
  ContractCode?: string;
  UnderlyingAsset?: string;
  OptionType?: 'Call' | 'Put';
  StrikePrice?: number;
  LotSize?: number;
  [key: string]: any;
}

interface CSVUploadResponse {
  success: boolean;
  recordsProcessed: number;
  records: any[];
}

const assetClasses = ['Equity', 'Forex', 'Fixed Income', 'Futures', 'Options'];

const InstrumentManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<EquityInstrument | null>(null);
  const [selectedFixedIncome, setSelectedFixedIncome] = useState<FixedIncomeInstrument | null>(null);
  const [selectedFutures, setSelectedFutures] = useState<FuturesInstrument | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<OptionsInstrument | null>(null);
  const [equityInstruments, setEquityInstruments] = useState<EquityInstrument[]>([]);
  const [forexInstruments, setForexInstruments] = useState<ForexInstrument[]>([]);
  const [fixedIncomeInstruments, setFixedIncomeInstruments] = useState<FixedIncomeInstrument[]>([]);
  const [futuresInstruments, setFuturesInstruments] = useState<FuturesInstrument[]>([]);
  const [optionsInstruments, setOptionsInstruments] = useState<OptionsInstrument[]>([]);
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('Equity');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [selectedForex, setSelectedForex] = useState<ForexInstrument | null>(null);
  const [editForexModalOpen, setEditForexModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const { user, userProfile } = useAuth();
  const [auditNote, setAuditNote] = useState('');
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => Promise<void>)>(null);
  const dispatch = useDispatch();

  const fetchInstruments = useCallback(async () => {
    try {
      if (selectedAssetClass === 'Equity' || selectedAssetClass === '') {
        const rawData = await api.getEquityInstruments() as RawInstrumentData[];
        const equityData = rawData.map(instrument => ({
          ...instrument,
          _id: instrument.id,
          RID: instrument.RID || '',
          ISIN: instrument.ISIN || '',
          Symbol: instrument.Symbol || '',
          TradingVenue: instrument.TradingVenue || '',
          Currency: instrument.Currency || '',
          CountryOfTrade: instrument.CountryOfTrade || '',
          Status: instrument.Status || 'Active'
        })) as EquityInstrument[];
        setEquityInstruments(equityData);
      }
      if (selectedAssetClass === 'Forex' || selectedAssetClass === '') {
        const rawData = await api.getForexInstruments() as RawInstrumentData[];
        const forexData = rawData.map(instrument => ({
          ...instrument,
          _id: instrument.id,
          ClientID: instrument.ClientID || '',
          CurrencyPair: instrument.CurrencyPair || '',
          BaseCurrency: instrument.BaseCurrency || '',
          TermCurrency: instrument.TermCurrency || '',
          ExecutionVenue: instrument.ExecutionVenue || '',
          ProductType: instrument.ProductType || '',
        })) as ForexInstrument[];
        setForexInstruments(forexData);
      }
      if (selectedAssetClass === 'Fixed Income' || selectedAssetClass === '') {
        const rawData = await api.getFixedIncomeInstruments() as RawInstrumentData[];
        const fixedIncomeData = rawData.map(instrument => ({
          ...instrument,
          _id: instrument.id,
          ISIN: instrument.ISIN || '',
          Status: instrument.Status || 'Active',
          MaturityDate: instrument.MaturityDate || '',
          CouponRate: instrument.CouponRate || 0,
          CouponFrequency: instrument.CouponFrequency || '',
          IssuerName: instrument.IssuerName || '',
        })) as FixedIncomeInstrument[];
        setFixedIncomeInstruments(fixedIncomeData);
      }
      if (selectedAssetClass === 'Futures' || selectedAssetClass === '') {
        const rawData = await api.getFuturesInstruments() as RawInstrumentData[];
        const futuresData = rawData.map(instrument => ({
          ...instrument,
          _id: instrument.id,
          ContractCode: instrument.ContractCode || '',
          UnderlyingAsset: instrument.UnderlyingAsset || '',
          ExpiryDate: instrument.ExpiryDate || '',
          LotSize: instrument.LotSize || 0,
          TradingVenue: instrument.TradingVenue || '',
          Currency: instrument.Currency || '',
        })) as FuturesInstrument[];
        setFuturesInstruments(futuresData);
      }
      if (selectedAssetClass === 'Options' || selectedAssetClass === '') {
        const rawData = await api.getOptionsInstruments() as RawInstrumentData[];
        const optionsData = rawData.map(instrument => ({
          ...instrument,
          _id: instrument.id,
          ContractCode: instrument.ContractCode || '',
          UnderlyingAsset: instrument.UnderlyingAsset || '',
          OptionType: instrument.OptionType || 'Call',
          StrikePrice: instrument.StrikePrice || 0,
          ExpiryDate: instrument.ExpiryDate || '',
          LotSize: instrument.LotSize || 0,
        })) as OptionsInstrument[];
        setOptionsInstruments(optionsData);
      }
    } catch (error) {
      console.error('Error fetching instruments:', error);
      showNotification('Error fetching instruments', 'error');
    }
  }, [selectedAssetClass]);

  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  // Sync latest instrument to Redux
  useEffect(() => {
    // Dispatch latest instrument based on asset class
    if (selectedAssetClass === 'Equity' && equityInstruments.length > 0) {
      console.log('Dispatching latest equity instrument to Redux:', equityInstruments[0]);
      dispatch(setLatestInstrument(equityInstruments[0]));
    } else if (selectedAssetClass === 'Forex' && forexInstruments.length > 0) {
      console.log('Dispatching latest forex instrument to Redux:', forexInstruments[0]);
      dispatch(setLatestForexInstrument(forexInstruments[0]));
    } else if (selectedAssetClass === 'Fixed Income' && fixedIncomeInstruments.length > 0) {
      // For now, use the general instrument slice for fixed income
      console.log('Dispatching latest fixed income instrument to Redux:', fixedIncomeInstruments[0]);
      dispatch(setLatestInstrument(fixedIncomeInstruments[0]));
    } else if (selectedAssetClass === 'Futures' && futuresInstruments.length > 0) {
      console.log('Dispatching latest futures instrument to Redux:', futuresInstruments[0]);
      dispatch(setLatestInstrument(futuresInstruments[0]));
    } else if (selectedAssetClass === 'Options' && optionsInstruments.length > 0) {
      console.log('Dispatching latest options instrument to Redux:', optionsInstruments[0]);
      dispatch(setLatestInstrument(optionsInstruments[0]));
    }
  }, [equityInstruments, forexInstruments, fixedIncomeInstruments, futuresInstruments, optionsInstruments, selectedAssetClass, dispatch]);

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      showNotification('Please select a file to upload', 'error');
      return;
    }
    
    if (!selectedAssetClass) {
      showNotification('Please select an asset class before uploading', 'error');
      return;
    }
    
    const file = event.target.files[0];
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showNotification('Please upload a CSV file', 'error');
      return;
    }
    
    setUploading(true);
    
    try {
      let response: CSVUploadResponse;
      if (selectedAssetClass === 'Equity') {
        response = await api.uploadEquityCSV(file);
        showNotification(
          `Equity data imported successfully!\n${response.recordsProcessed} records processed.`,
          'success'
        );
        if (response.records && response.records.length > 0) {
          setEquityInstruments(prev => [
            ...response.records.map(inst => ({ ...inst, _id: inst.id })),
            ...prev
          ]);
        } else {
          await fetchInstruments();
        }
      } else if (selectedAssetClass === 'Forex') {
        response = await api.uploadForexCSV(file);
        showNotification(
          `Forex data imported successfully!\n${response.recordsProcessed} records processed.`,
          'success'
        );
        if (response.records && response.records.length > 0) {
          setForexInstruments(prev => [
            ...response.records.map(inst => ({ ...inst, _id: inst.id })),
            ...prev
          ]);
        } else {
          await fetchInstruments();
        }
      } else if (selectedAssetClass === 'Fixed Income') {
        response = await api.uploadFixedIncomeCSV(file);
        showNotification(
          `Fixed Income data imported successfully!\n${response.recordsProcessed} records processed.`,
          'success'
        );
        if (response.records && response.records.length > 0) {
          setFixedIncomeInstruments(prev => [
            ...response.records.map(inst => ({ ...inst, _id: inst.id })),
            ...prev
          ]);
        } else {
          await fetchInstruments();
        }
      } else if (selectedAssetClass === 'Futures') {
        response = await api.uploadFuturesCSV(file);
        showNotification(
          `Futures data imported successfully!\n${response.recordsProcessed} records processed.`,
          'success'
        );
        if (response.records && response.records.length > 0) {
          setFuturesInstruments(prev => [
            ...response.records.map(inst => ({ ...inst, _id: inst.id })),
            ...prev
          ]);
        } else {
          await fetchInstruments();
        }
      } else if (selectedAssetClass === 'Options') {
        response = await api.uploadOptionsCSV(file);
        showNotification(
          `Options data imported successfully!\n${response.recordsProcessed} records processed.`,
          'success'
        );
        if (response.records && response.records.length > 0) {
          setOptionsInstruments(prev => [
            ...response.records.map(inst => ({ ...inst, _id: inst.id })),
            ...prev
          ]);
        } else {
          await fetchInstruments();
        }
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error uploading file';
      const errorDetails = error.response?.data?.details ? `\n\nDetails:\n${JSON.stringify(error.response.data.details, null, 2)}` : '';
      showNotification(`${errorMessage}${errorDetails}`, 'error');
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleClearAllInstruments = async () => {
    if (window.confirm('Are you sure you want to clear all instruments? This action cannot be undone.')) {
      try {
        if (selectedAssetClass === 'Equity') {
          await api.clearAllEquityInstruments();
          setEquityInstruments([]);
        } else if (selectedAssetClass === 'Forex') {
          await api.clearAllForexInstruments();
          setForexInstruments([]);
        } else if (selectedAssetClass === 'Fixed Income') {
          await api.clearAllFixedIncomeInstruments();
          setFixedIncomeInstruments([]);
        } else if (selectedAssetClass === 'Futures') {
          await api.clearAllFuturesInstruments();
          setFuturesInstruments([]);
        } else if (selectedAssetClass === 'Options') {
          await api.clearAllOptionsInstruments();
          setOptionsInstruments([]);
        } else {
          await Promise.all([
            api.clearAllEquityInstruments(),
            api.clearAllForexInstruments()
          ]);
          setEquityInstruments([]);
          setForexInstruments([]);
          setFixedIncomeInstruments([]);
          setFuturesInstruments([]);
          setOptionsInstruments([]);
        }
        showNotification('All instruments cleared successfully', 'success');
      } catch (error) {
        console.error('Error clearing instruments:', error);
        showNotification('Error clearing instruments', 'error');
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  const handleEditInstrument = (instrument: EquityInstrument) => {
    setSelectedInstrument(instrument);
    setIsEditModalOpen(true);
  };

  const handleEditFixedIncome = (instrument: FixedIncomeInstrument) => {
    setSelectedFixedIncome(instrument);
    setIsEditModalOpen(true);
  };

  const handleEditFutures = (instrument: FuturesInstrument) => {
    setSelectedFutures(instrument);
    setIsEditModalOpen(true);
  };

  const handleEditOptions = (instrument: OptionsInstrument) => {
    setSelectedOptions(instrument);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setSelectedInstrument(null);
    setSelectedFixedIncome(null);
    setSelectedFutures(null);
    setSelectedOptions(null);
    setIsEditModalOpen(false);
  };

  const handleEditModalSave = async (updatedInstrument: any) => {
    const entityType = selectedAssetClass;
    let note = '';
    let action = '';
    
    if (entityType === 'Equity') {
      const rid = updatedInstrument.RID || updatedInstrument.ISIN || '';
      note = (updatedInstrument.editNote ? `${updatedInstrument.editNote} for RID: ${rid}` : `Updated ${entityType} instrument for RID: ${rid}`);
      action = 'Updated Equity Instrument';
    } else if (entityType === 'Forex') {
      const currencyPair = updatedInstrument.CurrencyPair || '';
      note = updatedInstrument.editNote || '';
      if (!note.includes('for Currency Pair:')) {
        note = `${note} for Currency Pair: ${currencyPair}`;
      }
      note = note.trim();
      if (!note) note = `Updated ${entityType} instrument for Currency Pair: ${currencyPair}`;
      action = 'Updated Forex Instrument';
    } else if (entityType === 'Fixed Income') {
      const isin = updatedInstrument.ISIN || '';
      note = updatedInstrument.editNote || '';
      if (!note.includes('for ISIN:')) {
        note = `${note} for ISIN: ${isin}`;
      }
      note = note.trim();
      if (!note) note = `Updated ${entityType} instrument for ISIN: ${isin}`;
      action = 'Updated Fixed Income Instrument';
    } else if (entityType === 'Futures') {
      const contractCode = updatedInstrument.ContractCode || '';
      note = updatedInstrument.editNote || '';
      if (!note.includes('for Contract Code:')) {
        note = `${note} for Contract Code: ${contractCode}`;
      }
      note = note.trim();
      if (!note) note = `Updated ${entityType} instrument for Contract Code: ${contractCode}`;
      action = 'Updated Futures Instrument';
    } else if (entityType === 'Options') {
      const contractCode = updatedInstrument.ContractCode || '';
      note = updatedInstrument.editNote || '';
      if (!note.includes('for Contract Code:')) {
        note = `${note} for Contract Code: ${contractCode}`;
      }
      note = note.trim();
      if (!note) note = `Updated ${entityType} instrument for Contract Code: ${contractCode}`;
      action = 'Updated Options Instrument';
    }

    confirmAudit(note, async () => {
      try {
        if (selectedAssetClass === 'Equity') {
          const updated = await api.updateEquityInstrument(updatedInstrument);
          setEquityInstruments((prev) =>
            prev.map((inst) =>
              inst._id === updatedInstrument._id ? { ...inst, ...updated } : inst
            )
          );
        } else if (selectedAssetClass === 'Forex') {
          const updated = await api.updateForexInstrument(updatedInstrument);
          setForexInstruments((prev) =>
            prev.map((inst) =>
              inst._id === updatedInstrument._id ? { ...inst, ...updated } : inst
            )
          );
        } else if (selectedAssetClass === 'Fixed Income') {
          const updated = await api.updateFixedIncomeInstrument(updatedInstrument);
          setFixedIncomeInstruments((prev) =>
            prev.map((inst) =>
              inst._id === updatedInstrument._id ? { ...inst, ...updated } : inst
            )
          );
        } else if (selectedAssetClass === 'Futures') {
          const updated = await api.updateFuturesInstrument(updatedInstrument);
          setFuturesInstruments((prev) =>
            prev.map((inst) =>
              inst._id === updatedInstrument._id ? { ...inst, ...updated } : inst
            )
          );
        } else if (selectedAssetClass === 'Options') {
          const updated = await api.updateOptionsInstrument(updatedInstrument);
          setOptionsInstruments((prev) =>
            prev.map((inst) =>
              inst._id === updatedInstrument._id ? { ...inst, ...updated } : inst
            )
          );
        }
        
        await addAuditLog({
          user: userProfile?.displayName || user?.email || 'Unknown',
          action,
          instrumentType: entityType,
          editNote: note,
          changes: updatedInstrument,
        });
        
        setIsEditModalOpen(false);
        setEditForexModalOpen(false);
        showNotification('Instrument updated successfully', 'success');
      } catch (error) {
        console.error('Error updating instrument:', error);
        showNotification('Error updating instrument', 'error');
      }
    });
  };

  const handleAddInstrumentSave = async (instrumentData: Instrument) => {
    let payload: any = {};
    const entityType = selectedAssetClass;
    let note = '';
    let action = '';
    if (selectedAssetClass === 'Equity') {
      payload = {
        ISIN: instrumentData.ISIN,
        Symbol: instrumentData.symbol,
        TradingVenue: instrumentData.tradingVenue,
        Currency: instrumentData.currency,
        CountryOfTrade: instrumentData.countryOfTrade,
        Status: instrumentData.status, // Pass status
        // Add more fields if required by backend schema
      };
      try {
        const savedInstrument = await api.addEquityInstrument(payload);
        const rid = savedInstrument.RID || savedInstrument.ISIN || '';
        note = `Added new ${entityType} instrument for RID: ${rid}`;
        action = 'Added Equity Instrument';
        await addAuditLog({
          user: userProfile?.displayName || user?.email || 'Unknown',
          action,
          instrumentType: entityType,
          editNote: note,
          changes: savedInstrument,
        });
        // Add to beginning of array to show in first row
        setEquityInstruments(prev => [{
          ...savedInstrument,
          _id: savedInstrument.id,
        }, ...prev]);
        setIsModalOpen(false);
        showNotification('Instrument added successfully', 'success');
      } catch (error) {
        console.error('Error adding instrument:', error);
        showNotification('Error adding instrument', 'error');
      }
      return;
    }
    if (selectedAssetClass === 'Forex') {
      // Build payload with correct field names for Forex
      payload = {
        CurrencyPair: instrumentData.currencyPair,
        BaseCurrency: instrumentData.baseCurrency,
        TermCurrency: instrumentData.termCurrency,
        ExecutionVenue: instrumentData.executionVenue,
        ProductType: instrumentData.productType,
        // Add more fields if required by backend schema
      };
      const currencyPair = instrumentData.currencyPair || '';
      note = `Added new ${entityType} instrument for Currency Pair: ${currencyPair}`;
      action = 'Added Forex Instrument';
      confirmAudit(note, async () => {
        try {
          const savedInstrument = await api.addForexInstrument(payload);
          await addAuditLog({
            user: userProfile?.displayName || user?.email || 'Unknown',
            action,
            instrumentType: entityType,
            editNote: note,
            changes: savedInstrument,
          });
          // Add to beginning of array to show in first row
          setForexInstruments(prev => [{
            ...savedInstrument,
            _id: savedInstrument.id,
          }, ...prev]);
          setIsModalOpen(false);
          showNotification('Instrument added successfully', 'success');
        } catch (error) {
          console.error('Error adding instrument:', error);
          showNotification('Error adding instrument', 'error');
        }
      });
    }
    if (selectedAssetClass === 'Fixed Income') {
      payload = {
        ISIN: instrumentData.ISIN,
        Status: instrumentData.status,
        MaturityDate: instrumentData.maturityDate,
        CouponRate: instrumentData.couponRate,
        CouponFrequency: instrumentData.couponFrequency,
        IssuerName: instrumentData.issuerName,
      };
      const isin = instrumentData.ISIN || '';
      note = `Added new ${entityType} instrument for ISIN: ${isin}`;
      action = 'Added Fixed Income Instrument';
      confirmAudit(note, async () => {
        try {
          const savedInstrument = await api.addFixedIncomeInstrument(payload);
          await addAuditLog({
            user: userProfile?.displayName || user?.email || 'Unknown',
            action,
            instrumentType: entityType,
            editNote: note,
            changes: savedInstrument,
          });
          // Add to beginning of array to show in first row
          setFixedIncomeInstruments(prev => [{
            ...savedInstrument,
            _id: savedInstrument.id,
          }, ...prev]);
          setIsModalOpen(false);
          showNotification('Instrument added successfully', 'success');
        } catch (error) {
          console.error('Error adding instrument:', error);
          showNotification('Error adding instrument', 'error');
        }
      });
    }
    if (selectedAssetClass === 'Futures') {
      payload = {
        ContractCode: instrumentData.contractCode,
        UnderlyingAsset: instrumentData.underlyingAsset,
        ExpiryDate: instrumentData.expiryDate,
        LotSize: instrumentData.lotSize,
        TradingVenue: instrumentData.tradingVenue,
        Currency: instrumentData.currency,
      };
      const contractCode = instrumentData.contractCode || '';
      note = `Added new ${entityType} instrument for Contract Code: ${contractCode}`;
      action = 'Added Futures Instrument';
      confirmAudit(note, async () => {
        try {
          const savedInstrument = await api.addFuturesInstrument(payload);
          await addAuditLog({
            user: userProfile?.displayName || user?.email || 'Unknown',
            action,
            instrumentType: entityType,
            editNote: note,
            changes: savedInstrument,
          });
          // Add to beginning of array to show in first row
          setFuturesInstruments(prev => [{
            ...savedInstrument,
            _id: savedInstrument.id,
          }, ...prev]);
          setIsModalOpen(false);
          showNotification('Instrument added successfully', 'success');
        } catch (error) {
          console.error('Error adding instrument:', error);
          showNotification('Error adding instrument', 'error');
        }
      });
    }
    if (selectedAssetClass === 'Options') {
      payload = {
        ContractCode: instrumentData.contractCode,
        UnderlyingAsset: instrumentData.underlyingAsset,
        OptionType: instrumentData.optionType,
        StrikePrice: instrumentData.strikePrice,
        ExpiryDate: instrumentData.expiryDate,
        LotSize: instrumentData.lotSize,
      };
      const contractCode = instrumentData.contractCode || '';
      note = `Added new ${entityType} instrument for Contract Code: ${contractCode}`;
      action = 'Added Options Instrument';
      confirmAudit(note, async () => {
        try {
          const savedInstrument = await api.addOptionsInstrument(payload);
          await addAuditLog({
            user: userProfile?.displayName || user?.email || 'Unknown',
            action,
            instrumentType: entityType,
            editNote: note,
            changes: savedInstrument,
          });
          // Add to beginning of array to show in first row
          setOptionsInstruments(prev => [{
            ...savedInstrument,
            _id: savedInstrument.id,
          }, ...prev]);
          setIsModalOpen(false);
          showNotification('Instrument added successfully', 'success');
        } catch (error) {
          console.error('Error adding instrument:', error);
          showNotification('Error adding instrument', 'error');
        }
      });
    }
  };

  const handleEditForexModalClose = () => {
    setSelectedForex(null);
    setEditForexModalOpen(false);
  };

  const handleDeleteInstrument = async (id: string) => {
    let arr: (EquityInstrument | ForexInstrument | FixedIncomeInstrument | FuturesInstrument | OptionsInstrument)[] = [];
    switch (selectedAssetClass) {
      case 'Equity':
        arr = equityInstruments;
        break;
      case 'Forex':
        arr = forexInstruments;
        break;
      case 'Fixed Income':
        arr = fixedIncomeInstruments;
        break;
      case 'Futures':
        arr = futuresInstruments;
        break;
      case 'Options':
        arr = optionsInstruments;
        break;
      default:
        break;
    }

    const instrument = arr.find((i) => i._id === id);
    const entityType = selectedAssetClass;
    let note = '';
    let action = '';
    if (selectedAssetClass === 'Equity') {
      const rid = (instrument as EquityInstrument)?.RID || (instrument as EquityInstrument)?.ISIN || '';
      note = `Deleted ${entityType} instrument for RID: ${rid}`;
      action = 'Deleted Equity Instrument';
    } else if (selectedAssetClass === 'Forex') {
      const currencyPair = (instrument as ForexInstrument)?.CurrencyPair || '';
      note = `Deleted ${entityType} instrument for Currency Pair: ${currencyPair}`;
      action = 'Deleted Forex Instrument';
    } else if (selectedAssetClass === 'Fixed Income') {
      const isin = (instrument as FixedIncomeInstrument)?.ISIN || '';
      note = `Deleted ${entityType} instrument for ISIN: ${isin}`;
      action = 'Deleted Fixed Income Instrument';
    } else if (selectedAssetClass === 'Futures') {
      const contractCode = (instrument as FuturesInstrument)?.ContractCode || '';
      note = `Deleted ${entityType} instrument for Contract Code: ${contractCode}`;
      action = 'Deleted Futures Instrument';
    } else if (selectedAssetClass === 'Options') {
      const contractCode = (instrument as OptionsInstrument)?.ContractCode || '';
      note = `Deleted ${entityType} instrument for Contract Code: ${contractCode}`;
      action = 'Deleted Options Instrument';
    }
    confirmAudit(note, async () => {
      try {
        if (selectedAssetClass === 'Equity') {
          await api.deleteEquityInstrument(id);
        } else if (selectedAssetClass === 'Forex') {
          await api.deleteForexInstrument(id);
        } else if (selectedAssetClass === 'Fixed Income') {
          await api.deleteFixedIncomeInstrument(id);
        } else if (selectedAssetClass === 'Futures') {
          await api.deleteFuturesInstrument(id);
        } else if (selectedAssetClass === 'Options') {
          await api.deleteOptionsInstrument(id);
        }
        await addAuditLog({
          user: userProfile?.displayName || user?.email || 'Unknown',
          action,
          instrumentType: entityType,
          editNote: note,
          changes: instrument,
        });
        fetchInstruments();
        showNotification('Instrument deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting instrument:', error);
        showNotification('Error deleting instrument', 'error');
      }
    });
  };

  const handleDownload = async () => {
    try {
      if (selectedAssetClass === 'Equity') {
        await api.downloadEquityInstrumentsCSV(searchTerm);
        showNotification('Download started successfully', 'success');
      } else if (selectedAssetClass === 'Forex') {
        await api.downloadForexInstrumentsCSV(searchTerm);
        showNotification('Download started successfully', 'success');
      } else if (selectedAssetClass === 'Fixed Income') {
        await api.downloadFixedIncomeInstrumentsCSV(searchTerm);
        showNotification('Download started successfully', 'success');
      } else if (selectedAssetClass === 'Futures') {
        await api.downloadFuturesInstrumentsCSV(searchTerm);
        showNotification('Download started successfully', 'success');
      } else if (selectedAssetClass === 'Options') {
        await api.downloadOptionsInstrumentsCSV(searchTerm);
        showNotification('Download started successfully', 'success');
      }
    } catch (error) {
      console.error('Error downloading data:', error);
      showNotification('Error downloading data', 'error');
    }
  };

  const renderEquityTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>RID</TableCell>
            <TableCell>ISIN</TableCell>
            <TableCell>Symbol</TableCell>
            <TableCell>Trading Venue</TableCell>
            <TableCell>Currency</TableCell>
            <TableCell>Country of Trade</TableCell>
            <TableCell>Instrument Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equityInstruments
            .filter((instrument) => {
              // Status filter
              if (statusFilter !== 'All') {
                if (!instrument.Status || instrument.Status !== statusFilter) return false;
              }
              // Search filter
              return Object.values(instrument).some(
                (value) =>
                  value &&
                  value.toString().toLowerCase().includes(searchTerm.toLowerCase())
              );
            })
            .sort((a, b) => {
              // Sort by RID in incrementing order
              if (!a.RID || !b.RID) return 0;
              // Compare as strings, but if numeric part exists, compare numerically
              const prefixA = a.RID.slice(0, -4);
              const prefixB = b.RID.slice(0, -4);
              if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
              const numA = parseInt(a.RID.slice(-4), 10);
              const numB = parseInt(b.RID.slice(-4), 10);
              return numA - numB;
            })
            .map((instrument) => (
              <TableRow key={instrument._id}>
                <TableCell>{instrument.RID}</TableCell>
                <TableCell>{instrument.ISIN}</TableCell>
                <TableCell>{instrument.Symbol}</TableCell>
                <TableCell>{instrument.TradingVenue}</TableCell>
                <TableCell>{instrument.Currency}</TableCell>
                <TableCell>{instrument.CountryOfTrade}</TableCell>
                <TableCell>{instrument.Status || 'N/A'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditInstrument(instrument)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteInstrument(instrument._id)}
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
            <TableCell>Currency Pair</TableCell>
            <TableCell>Base Currency</TableCell>
            <TableCell>Term Currency</TableCell>
            <TableCell>Execution Venue</TableCell>
            <TableCell>Product Type</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forexInstruments.map((forex) => (
            <TableRow key={forex._id}>
              <TableCell>{forex.CurrencyPair}</TableCell>
              <TableCell>{forex.BaseCurrency}</TableCell>
              <TableCell>{forex.TermCurrency}</TableCell>
              <TableCell>{forex.ExecutionVenue}</TableCell>
              <TableCell>{forex.ProductType}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => {
                    setSelectedForex(forex);
                    setEditForexModalOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteInstrument(forex._id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderFixedIncomeTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ISIN</TableCell>
            <TableCell>Instrument Status</TableCell>
            <TableCell>Maturity Date</TableCell>
            <TableCell>Coupon Rate</TableCell>
            <TableCell>Coupon Frequency</TableCell>
            <TableCell>Issuer Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fixedIncomeInstruments
            .filter((instrument) => {
              // Status filter
              if (statusFilter !== 'All') {
                if (!instrument.Status || instrument.Status !== statusFilter) return false;
              }
              // Search filter
              return Object.values(instrument).some(
                (value) =>
                  value &&
                  value.toString().toLowerCase().includes(searchTerm.toLowerCase())
              );
            })
            .map((instrument) => (
              <TableRow key={instrument._id}>
                <TableCell>{instrument.ISIN}</TableCell>
                <TableCell>{instrument.Status}</TableCell>
                <TableCell>{instrument.MaturityDate}</TableCell>
                <TableCell>{instrument.CouponRate}</TableCell>
                <TableCell>{instrument.CouponFrequency}</TableCell>
                <TableCell>{instrument.IssuerName}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditFixedIncome(instrument)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteInstrument(instrument._id)}
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

  const renderFuturesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Contract Code / Symbol</TableCell>
            <TableCell>Underlying Asset</TableCell>
            <TableCell>Expiry Date</TableCell>
            <TableCell>Lot Size</TableCell>
            <TableCell>Trading Venue</TableCell>
            <TableCell>Currency</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {futuresInstruments
            .filter((instrument) =>
              Object.values(instrument).some(
                (value) =>
                  value &&
                  value.toString().toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
            .map((instrument) => (
              <TableRow key={instrument._id}>
                <TableCell>{instrument.ContractCode}</TableCell>
                <TableCell>{instrument.UnderlyingAsset}</TableCell>
                <TableCell>{instrument.ExpiryDate}</TableCell>
                <TableCell>{instrument.LotSize}</TableCell>
                <TableCell>{instrument.TradingVenue}</TableCell>
                <TableCell>{instrument.Currency}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditFutures(instrument)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteInstrument(instrument._id)}
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

  const renderOptionsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Contract Code / Symbol</TableCell>
            <TableCell>Underlying Asset</TableCell>
            <TableCell>Option Type</TableCell>
            <TableCell>Expiry Date</TableCell>
            <TableCell>Lot Size</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {optionsInstruments
            .filter((instrument) =>
              Object.values(instrument).some(
                (value) =>
                  value &&
                  value.toString().toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
            .map((instrument) => (
              <TableRow key={instrument._id}>
                <TableCell>{instrument.ContractCode}</TableCell>
                <TableCell>{instrument.UnderlyingAsset}</TableCell>
                <TableCell>{instrument.OptionType}</TableCell>
                <TableCell>{instrument.ExpiryDate}</TableCell>
                <TableCell>{instrument.LotSize}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditOptions(instrument)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteInstrument(instrument._id)}
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

  return (
    <Box p={3}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Instrument Management
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Manage financial instruments and their reference data
        </Typography>
      </Box>

      {/* Refactored Controls Layout */}
      <Box mb={4} display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} gap={2}>
        {/* Filters and Search (Left) */}
        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Asset Class</InputLabel>
            <Select
              value={selectedAssetClass}
              onChange={(e) => {
                setSelectedAssetClass(e.target.value);
                setStatusFilter('All');
              }}
              label="Asset Class"
            >
              <MenuItem value="">All</MenuItem>
              {assetClasses.map((assetClass) => (
                <MenuItem key={assetClass} value={assetClass}>
                  {assetClass}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedAssetClass && (
            <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120 }}>
              {selectedAssetClass === 'Equity'
                ? `Total: ${equityInstruments.length}`
                : selectedAssetClass === 'Forex'
                ? `Total: ${forexInstruments.length}`
                : selectedAssetClass === 'Fixed Income'
                ? `Total: ${fixedIncomeInstruments.length}`
                : selectedAssetClass === 'Futures'
                ? `Total: ${futuresInstruments.length}`
                : selectedAssetClass === 'Options'
                ? `Total: ${optionsInstruments.length}`
                : ''}
            </Typography>
          )}
          {(selectedAssetClass === 'Equity' || selectedAssetClass === 'Fixed Income') && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Instrument Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Instrument Status"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          )}
          {selectedAssetClass === 'Equity' && (
            <Typography variant="body2" color="textSecondary" sx={{ minWidth: 180 }}>
              {statusFilter !== 'All'
                ? `Count: ${equityInstruments.filter(inst => inst.Status === statusFilter).length}`
                : `Active: ${equityInstruments.filter(inst => inst.Status === 'Active').length}, Inactive: ${equityInstruments.filter(inst => inst.Status === 'Inactive').length}, Total: ${equityInstruments.length}`}
            </Typography>
          )}
          {selectedAssetClass === 'Fixed Income' && (
            <Typography variant="body2" color="textSecondary" sx={{ minWidth: 180 }}>
              {statusFilter !== 'All'
                ? `Count: ${fixedIncomeInstruments.filter(inst => inst.Status === statusFilter).length}`
                : `Active: ${fixedIncomeInstruments.filter(inst => inst.Status === 'Active').length}, Inactive: ${fixedIncomeInstruments.filter(inst => inst.Status === 'Inactive').length}, Total: ${fixedIncomeInstruments.length}`}
            </Typography>
          )}
          <TextField
            size="small"
            placeholder="Search instruments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220 }}
          />
        </Box>
        {/* Actions (Right) */}
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedAssetClass}
          >
            Add Instrument
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleClearAllInstruments}
            color="error"
          >
            Clear All
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<UploadIcon />}
            component="label"
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload CSV'}
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileUpload}
            />
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleDownload}
            disabled={!selectedAssetClass}
          >
            Download CSV
          </Button>
        </Box>
      </Box>

      {uploading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {selectedAssetClass === 'Equity' && renderEquityTable()}
      {selectedAssetClass === 'Forex' && renderForexTable()}
      {selectedAssetClass === 'Fixed Income' && renderFixedIncomeTable()}
      {selectedAssetClass === 'Futures' && renderFuturesTable()}
      {selectedAssetClass === 'Options' && renderOptionsTable()}
      {!selectedAssetClass && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>Equity Instruments</Typography>
          {renderEquityTable()}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Forex Instruments</Typography>
          {renderForexTable()}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Fixed Income Instruments</Typography>
          {renderFixedIncomeTable()}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Futures Instruments</Typography>
          {renderFuturesTable()}
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Options Instruments</Typography>
          {renderOptionsTable()}
        </>
      )}

      <AddInstrumentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddInstrumentSave}
        assetClass={selectedAssetClass}
      />

      <EditInstrumentModal
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        onSave={handleEditModalSave}
        instrument={selectedInstrument || selectedFixedIncome || selectedFutures || selectedOptions}
      />

      <EditForexModal
        open={editForexModalOpen}
        onClose={handleEditForexModalClose}
        onSave={handleEditModalSave}
        forexData={selectedForex}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%', whiteSpace: 'pre-line' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Audit Note Confirmation Modal */}
      <Dialog open={auditModalOpen} onClose={() => setAuditModalOpen(false)}>
        <DialogTitle>Confirm Audit Note</DialogTitle>
        <DialogContent>
          <p>Do you want to save this change and log the following note?</p>
          <Box sx={{ bgcolor: '#E6F7FF', p: 2, borderRadius: 1, mt: 1 }}>{auditNote}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAuditConfirm} variant="contained">Confirm & Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstrumentManagement; 