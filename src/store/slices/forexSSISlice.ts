import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ForexSSIState {
  latestForexSSI: any | null;
}

const initialState: ForexSSIState = {
  latestForexSSI: null,
};

const forexSSISlice = createSlice({
  name: 'forexSSI',
  initialState,
  reducers: {
    setLatestForexSSI: (state, action: PayloadAction<any>) => {
      state.latestForexSSI = action.payload;
    },
  },
});

export const { setLatestForexSSI } = forexSSISlice.actions;
export default forexSSISlice.reducer; 