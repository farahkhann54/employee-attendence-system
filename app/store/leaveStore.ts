// Leave Redux slice for leave page (modular)
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  leaves: [],
  loading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    setLeaves(state, action) { state.leaves = action.payload; },
    setLeaveLoading(state, action) { state.loading = action.payload; },
    setLeaveError(state, action) { state.error = action.payload; },
  },
});

export const { setLeaves, setLeaveLoading, setLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
