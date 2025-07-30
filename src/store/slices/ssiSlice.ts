import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SSIState {
  latestSSI: any | null;
}

const initialState: SSIState = {
  latestSSI: null,
};

const ssiSlice = createSlice({
  name: 'ssi',
  initialState,
  reducers: {
    setLatestSSI: (state, action: PayloadAction<any>) => {
      state.latestSSI = action.payload;
    },
  },
});

export const { setLatestSSI } = ssiSlice.actions;
export default ssiSlice.reducer; 