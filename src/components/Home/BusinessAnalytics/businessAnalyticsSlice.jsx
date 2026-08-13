import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAnalyticsAPI } from "./businessAnalyticsApi";

export const getAnalytics = createAsyncThunk(
    "analytics/getAnalytics",
    async (_, thunkAPI) => {
        try {
            return await getAnalyticsAPI();
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || "Unable to fetch analytics"
            );
        }
    }
);

const initialState = {
    data: null,
    loading: false,
    error: null,
};

const analyticsSlice = createSlice({
    name: "analytics",

    initialState,

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(getAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload?.data || null;
            })

            .addCase(getAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default analyticsSlice.reducer;