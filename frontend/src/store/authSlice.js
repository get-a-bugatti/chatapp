import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: false,
  userData: null,
  reset: {
    token: null,
    email: null, // works for boht username / email but named as email (for now)
  },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload;
    },
    logout: (state, action) => {
      state.status = false;
      state.userData = null;
      state.reset.email = null;
      state.reset.token = null;
    },
    setResetEmail: (state, action) => {
      state.reset.email = action.payload;
    },
    setResetToken: (state, action) => {
      state.reset.token = action.payload;
    },
    resetResetToken: (state) => {
      state.reset.token = null;
    },
    resetResetEmail: (state) => {
      state.reset.email = null;
    },
  },
});

export const {
  login,
  logout,
  setResetToken,
  resetResetToken,
  setResetEmail,
  resetResetEmail,
} = authSlice.actions;

export default authSlice.reducer;
