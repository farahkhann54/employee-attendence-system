import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./(auth)/authSlice";
import attendanceReducer from "./attendanceStore";
import leaveReducer from "./leaveStore";
import dashboardReducer from "./dashboardStore";
import settingsReducer from "./settingsStore";

// Main Redux store with modular slices for each feature
export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    leave: leaveReducer,
    dashboard: dashboardReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;