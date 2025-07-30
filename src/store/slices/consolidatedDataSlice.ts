import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConsolidatedDataState {
  prefilledData: any | null;
  currentFormData: any | null;
  isPrefilled: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: ConsolidatedDataState = {
  prefilledData: null,
  currentFormData: null,
  isPrefilled: false,
  loading: false,
  error: null,
};

const consolidatedDataSlice = createSlice({
  name: 'consolidatedData',
  initialState,
  reducers: {
    setPrefilledData: (state, action: PayloadAction<any>) => {
      state.prefilledData = action.payload;
      state.currentFormData = { ...action.payload };
      state.isPrefilled = true;
    },
    updateFormField: (state, action: PayloadAction<{ field: string; value: string }>) => {
      if (state.currentFormData) {
        state.currentFormData[action.payload.field] = action.payload.value;
      }
    },
    clearFormData: (state) => {
      state.currentFormData = null;
      state.isPrefilled = false;
    },
    resetToPrefilled: (state) => {
      if (state.prefilledData) {
        state.currentFormData = { ...state.prefilledData };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPrefilledData,
  updateFormField,
  clearFormData,
  resetToPrefilled,
  setLoading,
  setError,
} = consolidatedDataSlice.actions;

export default consolidatedDataSlice.reducer; 