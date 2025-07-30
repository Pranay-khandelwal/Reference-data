import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import AddInstrumentModal from '../../components/AddInstrumentModal';
import { getRecentEquityInstruments, getEquityInstruments, getForexInstruments, getPrices, addEquityInstrument } from '../../services/api';

interface RecentEquityInstrument {
  _id: string;
  RID: string;
  ISIN: string;
  Symbol: string;
  Currency: string;
  Status?: string; // Add Status property
}

// Enhanced Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: number | string;
  change?: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: 'up' | 'down' | 'neutral';
  showTrend: boolean;
  subtitle?: string;
  compact?: boolean;
}> = ({ title, value, change, suffix, icon, color, bgColor, trend = 'neutral', showTrend, subtitle, compact }) => (
  <Card sx={{ 
    height: '100%',
    background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}08 100%)`,
    border: `1px solid ${bgColor}20`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${color} 0%, ${bgColor} 100%)`,
    }
  }}>
    <CardContent sx={{ p: compact ? 2 : 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: compact ? 1 : 2 }}>
        <Box sx={{ 
          p: compact ? 1 : 1.5, 
          borderRadius: 2, 
          bgcolor: `${bgColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {React.cloneElement(icon as React.ReactElement, { 
            sx: { color: color, fontSize: compact ? 20 : 24 } 
          })}
        </Box>
        
      </Box>
      
      <Typography variant="h3" component="div" sx={{ 
        fontWeight: 700, 
        color: 'text.primary',
        mb: 1,
        fontSize: compact ? '1.5rem' : { xs: '1.75rem', md: '2.125rem' }
      }}>
        {value}{suffix}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500, fontSize: compact ? '0.95rem' : undefined }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
      {showTrend && change !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {trend === 'up' ? (
            <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
          ) : trend === 'down' ? (
            <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
          ) : null}
          <Typography
            variant="caption"
            sx={{ 
              color: trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          >
            {trend !== 'neutral' ? `${Math.abs(change)}%` : 'No change'} vs yesterday
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

// Quick Action Card Component
const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick: () => void;
}> = ({ title, description, icon, color, bgColor, onClick }) => (
  <Card 
    onClick={onClick} 
    sx={{ 
      cursor: 'pointer',
      height: '100%',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
      }
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          bgcolor: `${bgColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {React.cloneElement(icon as React.ReactElement, { 
            sx: { color: color, fontSize: 24 } 
          })}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
        </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [addInstrumentOpen, setAddInstrumentOpen] = React.useState(false);
  const [recentInstruments, setRecentInstruments] = useState<RecentEquityInstrument[]>([]);
  const [equityInstrumentCount, setEquityInstrumentCount] = useState<number>(0);
  const [forexInstrumentCount, setForexInstrumentCount] = useState<number>(0);
  const [activeEquityCount, setActiveEquityCount] = useState<number>(0);
  const [inactiveEquityCount, setInactiveEquityCount] = useState<number>(0);
  const [priceFeedSymbolCount, setPriceFeedSymbolCount] = useState<number>(0);

  useEffect(() => {
    const fetchRecentInstruments = async () => {
      try {
        const data = await getRecentEquityInstruments() as unknown as RecentEquityInstrument[];
        setRecentInstruments(data);
      } catch (error) {
        console.error('Error fetching recent instruments:', error);
      }
    };

    const fetchInstrumentCounts = async () => {
      try {
        const [equity, forex, recent] = await Promise.all([
          getEquityInstruments(),
          getForexInstruments(),
          getRecentEquityInstruments()
        ]);
        setRecentInstruments(recent as unknown as RecentEquityInstrument[]);
        setEquityInstrumentCount((equity?.length || 0));
        setForexInstrumentCount((forex?.length || 0));
        // Count Active/Inactive equity instruments
        const activeCount = (equity || []).filter((inst: any) => inst.Status === 'Active').length;
        const inactiveCount = (equity || []).filter((inst: any) => inst.Status === 'Inactive').length;
        setActiveEquityCount(activeCount);
        setInactiveEquityCount(inactiveCount);
      } catch (error) {
        setEquityInstrumentCount(0);
        setForexInstrumentCount(0);
        setActiveEquityCount(0);
        setInactiveEquityCount(0);
      }
    };

    // Removed fetchKYCCounts logic for pending/completed KYC counts

    const fetchPriceFeedSymbolCount = async () => {
      try {
        const prices = await getPrices();
        setPriceFeedSymbolCount(prices.length);
      } catch (error) {
        setPriceFeedSymbolCount(0);
      }
    };

    fetchRecentInstruments();
    fetchInstrumentCounts();
    // fetchKYCCounts removed
    fetchPriceFeedSymbolCount();
  }, []);

  // Add Instrument Handlers
  const handleAddInstrument = async (data: any) => {
    setAddInstrumentOpen(false);
    try {
      // Map modal fields to backend schema
      const payload = {
        ISIN: data.ISIN,
        Symbol: data.symbol,
        TradingVenue: data.tradingVenue,
        Currency: data.currency,
        CountryOfTrade: data.countryOfTrade,
        FXRateApplied: data.fxRateApplied,
        PricingSource: data.pricingSource,
      };
      await addEquityInstrument(payload);
      // Refresh recent instruments and counts
      const [recent, equity, forex] = await Promise.all([
        getRecentEquityInstruments(),
        getEquityInstruments(),
        getForexInstruments()
      ]);
      setRecentInstruments(recent as unknown as RecentEquityInstrument[]);
      setEquityInstrumentCount((equity?.length || 0));
      setForexInstrumentCount((forex?.length || 0));
      // Show notification (replace with Snackbar if you have one)
      window.alert('Instrument added!');
    } catch (error: any) {
      window.alert('Error adding instrument: ' + (error.message || error));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        bgcolor: 'background.paper', 
        borderRadius: 3,
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
    <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Reference Data Dashboard
          </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Real-time monitoring and management overview
          </Typography>
        </Box>
          {/* Region selector removed */}
        </Box>
        
        {/* Welcome Message */}
        <Box sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            Welcome back, Kshitij Kadam! 👋
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Here's what's happening with your reference data today
          </Typography>
        </Box>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={2} sx={{ mb: 1 }}>
        {/* Left: Metrics and Table */}
        <Grid item xs={12} md={9}>
          {/* Metric Cards Row */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <MetricCard
                title="Equity Instruments"
                value={equityInstrumentCount}
                icon={<AccountBalanceIcon />}
                color="#2563EB"
                bgColor="#3B82F6"
                showTrend={false}
                compact
                subtitle={`Active: ${activeEquityCount} | Inactive: ${inactiveEquityCount}`}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MetricCard
                title="Forex Instruments"
                value={forexInstrumentCount}
                icon={<TimelineIcon />}
                color="#3B82F6"
                bgColor="#DBEAFE"
                showTrend={false}
                compact
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MetricCard
                title="Price Feed Symbols"
                value={priceFeedSymbolCount}
                icon={<ShowChartIcon />}
                color="#10B981"
                bgColor="#D1FAE5"
                showTrend={false}
                compact
              />
            </Grid>
          </Grid>
          {/* Recent Instruments Table directly below metrics */}
          <Box mt={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ 
                  p: 3, 
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Recent Instruments Added
                  </Typography>
                  {/* Visibility / Download buttons removed */}
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>RID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>ISIN</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>SYMBOL</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>CURRENCY</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>INSTRUMENT STATUS</TableCell> {/* Changed header */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentInstruments.slice(0, 5).map((instrument) => (
                        <TableRow key={instrument._id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {instrument.RID}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {instrument.ISIN}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {instrument.Symbol}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={instrument.Currency} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'primary.light', 
                                color: 'primary.contrastText',
                                fontWeight: 500
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={instrument.Status || 'N/A'} // Use instrument.Status
                              size="small" 
                              sx={{ 
                                bgcolor: instrument.Status === 'Active' ? 'success.light' : 'warning.light', 
                                color: instrument.Status === 'Active' ? 'success.dark' : 'warning.dark',
                                fontWeight: 500
                              }} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Grid>
        {/* Right: Quick Actions */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              Quick Actions
            </Typography>
            <QuickActionCard
              title="Add Instrument"
              description="Create new instrument record"
              icon={<AddIcon />}
              color="#2563EB"
              bgColor="#3B82F6"
              onClick={() => setAddInstrumentOpen(true)}
            />
            {/* Run Validation quick action removed */}
          </Stack>
        </Grid>
      </Grid>

      {/* Add Instrument Modal */}
      <AddInstrumentModal
        open={addInstrumentOpen}
        onClose={() => setAddInstrumentOpen(false)}
        onSave={handleAddInstrument}
      />
      
    </Box>
  );
};

export default Dashboard; 