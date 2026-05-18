// Settings Redux slice for settings page (modular)
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  settings: {},
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings(state, action) { state.settings = action.payload; },
    setSettingsLoading(state, action) { state.loading = action.payload; },
    setSettingsError(state, action) { state.error = action.payload; },
  },
});

export const { setSettings, setSettingsLoading, setSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
