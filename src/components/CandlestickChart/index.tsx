import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface CandlestickChartProps {
  data: {
    createdAt?: string;
    date?: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  // Helper to format date as 'Mon DD' (e.g., 'Jul 15')
  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const series = [
    {
      data: data.map((d) => ({
        x: d.date
          ? formatShortDate(d.date)
          : (d.createdAt ? formatShortDate(d.createdAt) : ''),
        y: [d.open, d.high, d.low, d.close],
      })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: 350,
    },
    title: {
      text: 'Candlestick Chart',
      align: 'left',
    },
    xaxis: {
      type: 'category',
      labels: {
        show: false, // Hide x-axis labels (dates)
        rotate: -45,
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <Chart
      options={options}
      series={series}
      type="candlestick"
      height={350}
    />
  );
};

export default CandlestickChart; 