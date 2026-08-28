import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getConfirmedInvoicesAPI, getInvoiceByIdAPI, getInvoiceDetailsAPI, searchInvoiceAPI, submitInvoiceAPI } from "./invoiceApi";

export const searchInvoice = createAsyncThunk(
    "invoice/search",
    async (name, thunkAPI) => {
        try {
            return await searchInvoiceAPI(name);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || "Unable to search invoice");
        }
    }
);

export const getConfirmedInvoices = createAsyncThunk(
    "invoice/confirmed",
    async (_, thunkAPI) => {
        try {
            return await getConfirmedInvoicesAPI();
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || "Unable to fetch invoices");
        }
    }
);

export const submitInvoice = createAsyncThunk(
    "invoice/submit",
    async (data, thunkAPI) => {
        try {
            return await submitInvoiceAPI(data);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || "Unable to submit invoice");
        }
    }
);

// 🚨 MODIFIED: Here we accept 'mobile' and pass it to API
export const getInvoiceDetails = createAsyncThunk(
    "invoice/details",
    async (mobile, thunkAPI) => {
        try {
            return await getInvoiceDetailsAPI(mobile);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || "Unable to fetch invoice");
        }
    }
);

export const getInvoiceById = createAsyncThunk(
    "invoice/getById",
    async (id, thunkAPI) => {
        try {
            return await getInvoiceByIdAPI(id);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || "Unable to fetch invoice");
        }
    }
);

const invoiceSlice = createSlice({
    name: "invoice",
    initialState: {
        invoices: [],
        invoiceDetails: null,
        invoiceData: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Search
            .addCase(searchInvoice.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(searchInvoice.fulfilled, (state, action) => { state.loading = false; state.invoices = action.payload.data || []; })
            .addCase(searchInvoice.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // Confirmed Invoices
            .addCase(getConfirmedInvoices.pending, (state) => { state.loading = true; })
            .addCase(getConfirmedInvoices.fulfilled, (state, action) => { state.loading = false; state.invoices = action.payload.data || []; })
            .addCase(getConfirmedInvoices.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // 🚨 Invoice Details (Mobile wise)
            .addCase(getInvoiceDetails.pending, (state) => { state.loading = true; })
            .addCase(getInvoiceDetails.fulfilled, (state, action) => { 
                state.loading = false; 
                state.invoiceDetails = action.payload.data; // Stores mobile-wise combined data
            })
            .addCase(getInvoiceDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // Submit
            .addCase(submitInvoice.pending, (state) => { state.loading = true; })
            .addCase(submitInvoice.fulfilled, (state) => { state.loading = false; })
            .addCase(submitInvoice.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // By ID
            .addCase(getInvoiceById.pending, (state) => { state.loading = true; })
            .addCase(getInvoiceById.fulfilled, (state, action) => { state.loading = false; state.invoiceData = action.payload.data; })
            .addCase(getInvoiceById.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    },
});

export default invoiceSlice.reducer;