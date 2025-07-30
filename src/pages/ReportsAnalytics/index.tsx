import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  PlayArrow as PlayArrowIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

interface ScheduledReport {
  name: string;
  description: string;
  type: string;
  frequency: string;
  lastRun: string;
  nextRun: string;
  recipients: string;
  status: string;
}

const ReportsAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reports] = useState<ScheduledReport[]>([
    {
      name: 'Daily SLA Compliance Report',
      description: 'Daily summary of SLA performance across all operations',
      type: 'SLA',
      frequency: 'Daily',
      lastRun: 'Jun 28, 2025',
      nextRun: 'Jun 29, 2025',
      recipients: '2 recipients',
      status: 'Active',
    },
    {
      name: 'Weekly Data Quality Report',
      description: 'Comprehensive data quality metrics and trends',
      type: 'Data Quality',
      frequency: 'Weekly',
      lastRun: 'Jun 26, 2025',
      nextRun: 'Jul 3, 2025',
      recipients: '1 recipient',
      status: 'Active',
    },
    {
      name: 'Monthly Compliance Audit',
      description: 'Monthly compliance and regulatory reporting',
      type: 'Compliance',
      frequency: 'Monthly',
      lastRun: 'Jun 23, 2025',
      nextRun: 'Jul 23, 2025',
      recipients: '2 recipients',
      status: 'Active',
    },
  ]);

  return (
    <Box sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Reports & Analytics
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Generate reports and view operational analytics
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DescriptionIcon />}
        >
          Generate Report
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="body2" color="textSecondary">
                Data Quality Score
              </Typography>
            </Box>
            <Typography variant="h3">97.8%</Typography>
            <Typography variant="body2" color="success.main">
              ↑ +0.5% vs last week
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="body2" color="textSecondary">
                SLA Compliance Rate
              </Typography>
            </Box>
            <Typography variant="h3">94.2%</Typography>
            <Typography variant="body2" color="error.main">
              ↓ -2.1% vs last week
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="body2" color="textSecondary">
                Average Resolution Time
              </Typography>
            </Box>
            <Typography variant="h3">2.3 hours</Typography>
            <Typography variant="body2" color="success.main">
              ↓ -15 min vs last week
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="body2" color="textSecondary">
                Exception Rate
              </Typography>
            </Box>
            <Typography variant="h3">0.8%</Typography>
            <Typography variant="body2" color="error.main">
              ↑ +0.2% vs last week
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Scheduled Reports" />
          <Tab label="Report Generator" />
          <Tab label="Analytics Dashboard" />
          <Tab label="Report History" />
        </Tabs>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Scheduled Reports
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>REPORT NAME</TableCell>
                <TableCell>TYPE</TableCell>
                <TableCell>FREQUENCY</TableCell>
                <TableCell>LAST RUN</TableCell>
                <TableCell>NEXT RUN</TableCell>
                <TableCell>RECIPIENTS</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{report.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {report.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.frequency}</TableCell>
                  <TableCell>{report.lastRun}</TableCell>
                  <TableCell>{report.nextRun}</TableCell>
                  <TableCell>{report.recipients}</TableCell>
                  <TableCell>
                    <Box sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'success.light',
                      color: 'success.dark',
                    }}>
                      {report.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      startIcon={<PlayArrowIcon />}
                      size="small"
                    >
                      Run
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default ReportsAnalytics; 