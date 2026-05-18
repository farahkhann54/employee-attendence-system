// Attendance Redux slice for attendance page (modular)
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  records: [],
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendance(state, action) { state.records = action.payload; },
    setAttendanceLoading(state, action) { state.loading = action.payload; },
    setAttendanceError(state, action) { state.error = action.payload; },
  },
});

export const { setAttendance, setAttendanceLoading, setAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
