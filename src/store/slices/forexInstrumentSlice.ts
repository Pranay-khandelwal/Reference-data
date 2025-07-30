import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ForexInstrumentState {
  latestForexInstrument: any | null;
}

const initialState: ForexInstrumentState = {
  latestForexInstrument: null,
};

const forexInstrumentSlice = createSlice({
  name: 'forexInstrument',
  initialState,
  reducers: {
    setLatestForexInstrument: (state, action: PayloadAction<any>) => {
      state.latestForexInstrument = action.payload;
    },
  },
});

export const { setLatestForexInstrument } = forexInstrumentSlice.actions;
export default forexInstrumentSlice.reducer; 