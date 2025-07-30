import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InstrumentState {
  latestInstrument: any | null;
}

const initialState: InstrumentState = {
  latestInstrument: null,
};

const instrumentSlice = createSlice({
  name: 'instrument',
  initialState,
  reducers: {
    setLatestInstrument: (state, action: PayloadAction<any>) => {
      state.latestInstrument = action.payload;
    },
  },
});

export const { setLatestInstrument } = instrumentSlice.actions;
export default instrumentSlice.reducer; 