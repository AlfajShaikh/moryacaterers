import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI } from "./loginApi";

export const loginUser = createAsyncThunk(
  "login/loginUser",
  async (data, thunkAPI) => {
    try {
      return await loginAPI(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Login Failed"
      );
    }
  }
);

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
    state.loading = false;
    state.user = action.payload.data;
    state.token = action.payload.token;
    state.error = null;

    localStorage.setItem("token", action.payload.token);
    localStorage.setItem(
        "user",
        JSON.stringify(action.payload.data)
    );
    localStorage.setItem("isLoggedIn", "true");
})

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = loginSlice.actions;

export default loginSlice.reducer;