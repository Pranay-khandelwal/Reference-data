import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardMetrics, InstrumentUpdate } from '../../types';

interface DashboardState {
  metrics: DashboardMetrics;
  instrumentUpdates: InstrumentUpdate[];
  selectedRegion: string;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: {
    totalInstruments: 0,
    activeInstruments: 0,
    pendingValidations: 0,
    dataQualityScore: 0,
  },
  instrumentUpdates: [],
  selectedRegion: 'All Regions',
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setMetrics: (state: DashboardState, action: PayloadAction<DashboardMetrics>) => {
      state.metrics = action.payload;
    },
    setInstrumentUpdates: (state: DashboardState, action: PayloadAction<InstrumentUpdate[]>) => {
      state.instrumentUpdates = action.payload;
    },
    setSelectedRegion: (state: DashboardState, action: PayloadAction<string>) => {
      state.selectedRegion = action.payload;
    },
    setLoading: (state: DashboardState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: DashboardState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMetrics,
  setInstrumentUpdates,
  setSelectedRegion,
  setLoading,
  setError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer; 