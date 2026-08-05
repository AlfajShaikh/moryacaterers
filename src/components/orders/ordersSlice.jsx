import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteOrderAPI, getAllOrdersAPI, removeOrderItemAPI, updateOrderAPI } from "./ordersApi";

export const getAllOrders = createAsyncThunk(
    "orders/getAllOrders",
    async (_, thunkAPI) => {
        try {
            return await getAllOrdersAPI();
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Unable to fetch orders"
            );
        }
    }
);

export const updateOrder = createAsyncThunk(
    "orders/updateOrder",
    async ({ id, data }, thunkAPI) => {
        try {
            return await updateOrderAPI(id, data);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Unable to update order"
            );
        }
    }
);


export const deleteOrder = createAsyncThunk(
    "orders/deleteOrder",
    async (id, thunkAPI) => {
        try {
            await deleteOrderAPI(id);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Unable to delete order"
            );
        }
    }
);


export const removeOrderItem = createAsyncThunk(
    "orders/removeOrderItem",
    async (data, thunkAPI) => {
        try {
            return await removeOrderItemAPI(data);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Unable to remove item"
            );
        }
    }
);

const initialState = {
    orders: [],
    loading: false,
    error: null,
};

const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder

            .addCase(getAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(getAllOrders.fulfilled, (state, action) => {
                state.loading = false;

                // API may return either array or {data:[]}
                state.orders = action.payload.data || action.payload;
            })

            .addCase(getAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            }).addCase(updateOrder.fulfilled, (state, action) => {

                const updated = action.payload.data || action.payload;

                const index = state.orders.findIndex(
                    (item) => item._id === updated._id
                );

                if (index !== -1) {
                    state.orders[index] = updated;
                }
            })

            .addCase(updateOrder.rejected, (state, action) => {
                state.error = action.payload;
            }).addCase(deleteOrder.pending, (state) => {
                state.loading = true;
            })

            .addCase(deleteOrder.fulfilled, (state, action) => {
                state.loading = false;

                state.orders = state.orders.filter(
                    order => order._id !== action.payload
                );
            })

            .addCase(deleteOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            }).addCase(removeOrderItem.fulfilled, (state, action) => {
                const updated = action.payload.data || action.payload;

                const index = state.orders.findIndex(
                    (x) => x._id === updated._id
                );

                if (index !== -1) {
                    state.orders[index] = updated;
                }
            });
    },
});

export default ordersSlice.reducer;