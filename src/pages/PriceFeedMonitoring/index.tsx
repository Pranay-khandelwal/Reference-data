import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  BarChart as BarChartIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getLatestPrices as getPrices, addPrice, deletePrice, deletePriceHistory, uploadPriceCSV, getPriceHistory } from '../../services/api';
import CandlestickChart from '../../components/CandlestickChart';

interface PriceUpdate {
  _id: string;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  createdAt?: string;
  date?: string;
}

interface RawPriceData {
  id: string;
  symbol?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  createdAt?: string;
  date?: string;
  [key: string]: any;
}

const PriceFeedMonitoring: React.FC = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [prices, setPrices] = useState<PriceUpdate[]>([]);
  const [history, setHistory] = useState<PriceUpdate[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPrices = async () => {
    try {
      const data = await getPrices() as PriceUpdate[];
      setPrices(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleAddOpen = () => {
    setAddOpen(true);
  };

  const handleAddClose = () => {
    setAddOpen(false);
    setNewSymbol('');
  };

  const handleAddPrice = async () => {
    try {
      await addPrice({ symbol: newSymbol, open: 0, high: 0, low: 0, close: 0, volume: 0, date: new Date().toISOString() });
      handleAddClose();
      fetchPrices();
    } catch (error) {
      console.error('Error adding symbol:', error);
    }
  };

  const handleDeleteHistory = async () => {
    if (!selectedSymbol) return;
    try {
      await deletePriceHistory(selectedSymbol);
      // Refresh the view, or simply clear it if it's symbol-specific
      setHistory([]);
      closeHistory();
    } catch (error) {
      console.error('Error deleting history:', error);
    }
  };

  const openHistory = async (symbol: string) => {
    try {
      // Always fetch from backend
      const rawData = await getPriceHistory(symbol) as RawPriceData[];
      const data = rawData.map(price => ({
        ...price,
        _id: price.id,
        symbol: price.symbol || '',
        open: price.open || 0,
        high: price.high || 0,
        low: price.low || 0,
        close: price.close || 0,
        volume: price.volume || 0,
        createdAt: price.createdAt || '',
        date: price.date || ''
      })) as PriceUpdate[];
      setHistory(data);
      setSelectedSymbol(symbol);
      setTabIndex(0);
      setHistoryOpen(true);
    } catch (err) {
      setHistory([]); // Show blank if no data
      setSelectedSymbol(symbol);
      setTabIndex(0);
      setHistoryOpen(true);
      console.error('Error opening history:', err);
    }
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setHistory([]);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSymbol) return;
    try {
      await uploadPriceCSV(file, selectedSymbol);
      // Refresh history after upload
      const rawData = await getPriceHistory(selectedSymbol) as RawPriceData[];
      const data = rawData.map(price => ({
        ...price,
        _id: price.id,
        symbol: price.symbol || '',
        open: price.open || 0,
        high: price.high || 0,
        low: price.low || 0,
        close: price.close || 0,
        volume: price.volume || 0,
        createdAt: price.createdAt || '',
        date: price.date || ''
      })) as PriceUpdate[];
      setHistory(data);
    } catch (error) {
      alert('Error uploading CSV: ' + (error as Error).message);
    }
  };

  // Helper to aggregate data by week or month
  const aggregateHistory = (data: PriceUpdate[], mode: 'daily' | 'weekly' | 'monthly') => {
    if (mode === 'daily') return data;
    const grouped: { [key: string]: PriceUpdate[] } = {};
    data.forEach((item) => {
      const dateObj = item.date ? new Date(item.date) : (item.createdAt ? new Date(item.createdAt) : null);
      if (!dateObj) return;
      let key = '';
      if (mode === 'weekly') {
        // Get year-week string
        const year = dateObj.getFullYear();
        const week = Math.ceil(
          ((dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(dateObj.getFullYear(), 0, 1).getDay() + 1) / 7
        );
        key = `${year}-W${week}`;
      } else if (mode === 'monthly') {
        key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`;
      }
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    // Aggregate OHLC for each group
    return Object.values(grouped).map((group) => {
      const sorted = group.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return da - db;
      });
      return {
        ...sorted[0],
        open: sorted[0].open,
        close: sorted[sorted.length - 1].close,
        high: Math.max(...group.map((d) => d.high)),
        low: Math.min(...group.map((d) => d.low)),
        date: sorted[0].date, // Use first date in group for x-axis
      };
    });
  };

  return (
    <Box sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Price Feed Monitoring
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Monitor real-time data feeds and pricing sources
          </Typography>
        </Box>
        <Box>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
            onClick={handleAddOpen}
          >
            Add New Symbol
          </Button>
          {/* Refresh button removed as requested */}
        </Box>
      </Box>

      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Price Updates
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SYMBOL</TableCell>
                <TableCell>MORE DATA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prices.map((price) => (
                <TableRow key={price._id}>
                  <TableCell>{price.symbol}</TableCell>
                  <TableCell>
                    <IconButton sx={{ mr: 1 }} onClick={() => openHistory(price.symbol)}>
                      <BarChartIcon />
                    </IconButton>
                    <IconButton color="error" onClick={async () => {
                      try {
                        await deletePrice(price._id);
                        setPrices(prev => prev.filter(p => p._id !== price._id));
                      } catch (err) {
                        console.error('Error deleting price:', err);
                      }
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog open={addOpen} onClose={handleAddClose}>
        <DialogTitle>Add New Symbol</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Symbol"
            fullWidth
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancel</Button>
          <Button onClick={handleAddPrice}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onClose={closeHistory} fullWidth maxWidth="md">
        <DialogTitle>Historical Price Data - {selectedSymbol}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleCSVUpload}
            />
            <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
              Upload CSV
            </Button>
          </Box>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
            <Tab label="Table" />
            <Tab label="Chart" />
          </Tabs>
          {tabIndex === 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Open</TableCell>
                    <TableCell>High</TableCell>
                    <TableCell>Low</TableCell>
                    <TableCell>Close</TableCell>
                    <TableCell>Volume</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No data available</TableCell>
                    </TableRow>
                  ) : (
                    history.map((h) => (
                      <TableRow key={h._id}>
                        <TableCell>{h.date ? new Date(h.date).toLocaleDateString() : ''}</TableCell>
                        <TableCell>{h.open}</TableCell>
                        <TableCell>{h.high}</TableCell>
                        <TableCell>{h.low}</TableCell>
                        <TableCell>{h.close}</TableCell>
                        <TableCell>{h.volume}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tabIndex === 1 && (
            <Box>
              <FormControl sx={{ mb: 2, minWidth: 120 }} size="small">
                <InputLabel id="timeframe-label">Timeframe</InputLabel>
                <Select
                  labelId="timeframe-label"
                  value={timeframe}
                  label="Timeframe"
                  onChange={(e) => setTimeframe(e.target.value as 'daily' | 'weekly' | 'monthly')}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
              <CandlestickChart data={aggregateHistory(history, timeframe)} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteHistory} color="error">Delete All History</Button>
          <Button onClick={closeHistory}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PriceFeedMonitoring; 