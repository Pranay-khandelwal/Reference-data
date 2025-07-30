import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ForexClientState {
  latestForexClient: any | null;
}

const initialState: ForexClientState = {
  latestForexClient: null,
};

const forexClientSlice = createSlice({
  name: 'forexClient',
  initialState,
  reducers: {
    setLatestForexClient: (state, action: PayloadAction<any>) => {
      state.latestForexClient = action.payload;
    },
  },
});

export const { setLatestForexClient } = forexClientSlice.actions;
export default forexClientSlice.reducer; 