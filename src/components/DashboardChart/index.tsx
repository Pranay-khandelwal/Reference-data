import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

interface DashboardChartProps {
  title: string;
  data: ChartDataPoint[];
  height?: number;
  type?: 'bar' | 'line' | 'area';
}

const DashboardChart: React.FC<DashboardChartProps> = ({ 
  title, 
  data, 
  height = 200, 
  type = 'bar' 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));

  const renderBarChart = () => (
    <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: height - 60, px: 2 }}>
      {data.map((point, index) => (
        <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              width: '80%',
              height: `${((point.value - minValue) / (maxValue - minValue)) * 100}%`,
              minHeight: 20,
              bgcolor: point.color,
              borderRadius: '4px 4px 0 0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scaleY(1.05)',
                boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
              }
            }}
          />
          <Typography variant="caption" sx={{ mt: 1, fontWeight: 500, fontSize: '0.75rem' }}>
            {point.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  const renderLineChart = () => (
    <Box sx={{ position: 'relative', height: height - 60, px: 2, py: 1 }}>
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        <polyline
          fill="none"
          stroke="#00AEEF"
          strokeWidth="3"
          points={data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (((point.value - minValue) / (maxValue - minValue)) * 100);
            return `${x}%,${y}%`;
          }).join(' ')}
        />
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - (((point.value - minValue) / (maxValue - minValue)) * 100);
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={`${y}%`}
              r="4"
              fill="#00AEEF"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </Box>
  );

  const renderAreaChart = () => (
    <Box sx={{ position: 'relative', height: height - 60, px: 2, py: 1 }}>
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00AEEF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00AEEF" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          fill="url(#areaGradient)"
          d={`M 0,100 ${data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (((point.value - minValue) / (maxValue - minValue)) * 100);
            return `L ${x},${y}`;
          }).join(' ')} L 100,100 Z`}
        />
        <polyline
          fill="none"
          stroke="#00AEEF"
          strokeWidth="3"
          points={data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (((point.value - minValue) / (maxValue - minValue)) * 100);
            return `${x}%,${y}%`;
          }).join(' ')}
        />
      </svg>
    </Box>
  );

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <Paper sx={{ 
      p: 3, 
      height: height,
      borderRadius: 3,
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      {renderChart()}
    </Paper>
  );
};

export default DashboardChart;