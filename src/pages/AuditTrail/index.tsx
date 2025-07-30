import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarTodayIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import * as api from '../../services/api';
import { collection, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { differenceInHours, isToday } from 'date-fns';

interface AuditEntry {
  id: string;
  timestamp: any;
  user: string;
  action: string;
  instrumentType: string;
  editNote: string;
  changes: any;
}

const AuditTrail: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAuditTrail();
  }, []);

  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditTrail() as unknown as AuditEntry[];
      setEntries(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit trail');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Instrument Type', 'Edit Note'];
    const csvRows = [
      headers.join(','),
      ...entries.map(entry => [
        `"${new Date(entry.timestamp?.toDate?.() || entry.timestamp).toLocaleString()}"`,
        `"${entry.user}"`,
        `"${entry.action}"`,
        `"${entry.instrumentType}"`,
        `"${entry.editNote.replace(/"/g, '""')}"`
      ].join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'audit-log.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all audit entries? This action cannot be undone.')) {
      try {
        setLoading(true);
        const auditCollection = collection(db, 'audit');
        const querySnapshot = await getDocs(auditCollection);
        
        // Delete all documents in the audit collection
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        setEntries([]);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to clear audit trail');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredEntries = entries.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.user.toLowerCase().includes(searchLower) ||
      entry.action.toLowerCase().includes(searchLower) ||
      entry.instrumentType.toLowerCase().includes(searchLower) ||
      entry.editNote.toLowerCase().includes(searchLower)
    );
  });

  // Calculate dashboard stats
  const now = new Date();
  const totalEntries = entries.length;
  const todayEntries = entries.filter(e => {
    const ts = e.timestamp?.toDate?.() || e.timestamp;
    return isToday(new Date(ts));
  }).length;
  const deleteCount = entries.filter(e => {
    const ts = e.timestamp?.toDate?.() || e.timestamp;
    return e.action?.toLowerCase() === 'delete' && differenceInHours(now, new Date(ts)) < 24;
  }).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Dashboard Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2">Total Entries</Typography>
            <Typography variant="h4">{totalEntries}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2">Today</Typography>
            <Typography variant="h4">{todayEntries}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="error">Deletes</Typography>
            <Typography variant="h4" color="error">{deleteCount}</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Audit Trail
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DescriptionIcon />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ mr: 1 }} />
                  Timestamp
                </Box>
              </TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Instrument Type</TableCell>
              <TableCell>Edit Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEntries.map((entry) => {
              let color: 'success' | 'error' | 'primary' | 'default' = 'default';
              if (entry.action?.toLowerCase() === 'add') color = 'success';
              else if (entry.action?.toLowerCase() === 'delete') color = 'error';
              else if (entry.action?.toLowerCase() === 'update') color = 'primary';
              return (
                <TableRow key={entry.id}>
                  <TableCell>
                    {new Date(entry.timestamp?.toDate?.() || entry.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{entry.user}</TableCell>
                  <TableCell>
                    <Chip label={entry.action} color={color} size="small" />
                  </TableCell>
                  <TableCell>{entry.instrumentType}</TableCell>
                  <TableCell>{entry.editNote}</TableCell>
                </TableRow>
              );
            })}
            {filteredEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No audit entries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AuditTrail; 