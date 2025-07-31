import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ForexSSI } from '../../types';

interface ForexSSIState {
  latestForexSSI: ForexSSI | null;
}

const initialState: ForexSSIState = {
  latestForexSSI: null,
};

const forexSSISlice = createSlice({
  name: 'forexSSI',
  initialState,
  reducers: {
    setLatestForexSSI: (state, action: PayloadAction<ForexSSI>) => {
      state.latestForexSSI = action.payload;
    },
  },
});

export const { setLatestForexSSI } = forexSSISlice.actions;
export default forexSSISlice.reducer; 