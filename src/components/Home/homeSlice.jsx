import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardCountsAPI, markReadApi } from "./homeAPi";

export const getDashboardCounts = createAsyncThunk(
    "dashboard/counts",
    async (_, thunkAPI) => {
        try {
            return await getDashboardCountsAPI();
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data);
        }
    }
);


export const markRead = createAsyncThunk(
    "dashboard/markRead",
    async () => {
        return await markReadApi();
    }
);

const homeSlice = createSlice({
    name: "dashboard",

    initialState: {
        counts: {},
        loading: false,
        error: null,
    },

    reducers: {},

    extraReducers: (builder) => {
        builder

            .addCase(getDashboardCounts.pending, (state) => {
                state.loading = true;
            })

            .addCase(getDashboardCounts.fulfilled, (state, action) => {
                state.loading = false;
                state.counts = action.payload.data;
            })

            .addCase(getDashboardCounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            }).addCase(markRead.fulfilled, (state) => {
                state.counts.unreadOrderCount = 0;
            });;
    },
});

export default homeSlice.reducer;