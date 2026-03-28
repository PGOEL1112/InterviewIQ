import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {
    /* login user */
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },

    /* logout */

    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },

    /* loading */

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    /* update profile */

    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },

  },
});

export const {
  setUser,
  logoutUser,
  setLoading,
  updateUser,
} = userSlice.actions;

export default userSlice.reducer;