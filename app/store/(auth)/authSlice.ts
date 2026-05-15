import { AuthState, UserProfile } from "@/types/auth-types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // 🔥 Login ke waqt pura user set karne ke liye
    // authSlice.ts mein
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      // Yahan '| null' add karein
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    // 🔥 Profile Completion ya Settings update ke liye
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        // ...state.user (purana data) + action.payload (naya data)
        state.user = { ...state.user, ...action.payload };
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setUser, updateProfile, setError, logout } =
  AuthSlice.actions;
export default AuthSlice.reducer;
