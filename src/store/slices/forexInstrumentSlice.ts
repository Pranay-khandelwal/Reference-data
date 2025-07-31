import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ForexInstrument } from '../../types';

interface ForexInstrumentState {
  latestForexInstrument: ForexInstrument | null;
}

const initialState: ForexInstrumentState = {
  latestForexInstrument: null,
};

const forexInstrumentSlice = createSlice({
  name: 'forexInstrument',
  initialState,
  reducers: {
    setLatestForexInstrument: (state, action: PayloadAction<ForexInstrument>) => {
      state.latestForexInstrument = action.payload;
    },
  },
});

export const { setLatestForexInstrument } = forexInstrumentSlice.actions;
export default forexInstrumentSlice.reducer; 