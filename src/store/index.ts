import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import instrumentReducer from './slices/instrumentSlice';
import clientReducer from './slices/clientSlice';
import ssiReducer from './slices/ssiSlice';
import forexInstrumentReducer from './slices/forexInstrumentSlice';
import forexClientReducer from './slices/forexClientSlice';
import forexSSIReducer from './slices/forexSSISlice';
import consolidatedDataReducer from './slices/consolidatedDataSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    instrument: instrumentReducer,
    client: clientReducer,
    ssi: ssiReducer,
    forexInstrument: forexInstrumentReducer,
    forexClient: forexClientReducer,
    forexSSI: forexSSIReducer,
    consolidatedData: consolidatedDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 