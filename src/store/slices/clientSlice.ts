import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ClientState {
  latestClient: any | null;
}

const initialState: ClientState = {
  latestClient: null,
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setLatestClient: (state, action: PayloadAction<any>) => {
      state.latestClient = action.payload;
    },
  },
});

export const { setLatestClient } = clientSlice.actions;
export default clientSlice.reducer; 