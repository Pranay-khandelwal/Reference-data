import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ForexClient } from '../../types';

interface ForexClientState {
  latestForexClient: ForexClient | null;
}

const initialState: ForexClientState = {
  latestForexClient: null,
};

const forexClientSlice = createSlice({
  name: 'forexClient',
  initialState,
  reducers: {
    setLatestForexClient: (state, action: PayloadAction<ForexClient>) => {
      state.latestForexClient = action.payload;
    },
  },
});

export const { setLatestForexClient } = forexClientSlice.actions;
export default forexClientSlice.reducer; 