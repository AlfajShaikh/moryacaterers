import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllMenusAPI, saveCustomerMenuAPI } from "./menuApi";

export const getAllMenus = createAsyncThunk(
    "menu/getAllMenus",
    async (_, thunkAPI) => {
        try {
            return await getAllMenusAPI();
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Unable to fetch menus"
            );
        }
    }
);

export const saveCustomerMenu = createAsyncThunk(
    "menu/saveCustomerMenu",
    async (data, thunkAPI) => {
        try {
            return await saveCustomerMenuAPI(data);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Unable to save menu"
            );
        }
    }
);

const initialState = {
    menus: [],
       dateWiseCount: [],
    loading: false,
    saving: false,
    success: false,
    error: null,
};

const menuSlice = createSlice({
    name: "menuList",
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(getAllMenus.pending, (state) => {
                state.loading = true;
            })

          .addCase(getAllMenus.fulfilled, (state, action) => {
    state.loading = false;
    state.menus = action.payload.data;
    state.dateWiseCount = action.payload.dateWiseCount || [];
})

            .addCase(getAllMenus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            }).addCase(saveCustomerMenu.pending, (state) => {
                state.saving = true;
            })

            .addCase(saveCustomerMenu.fulfilled, (state) => {
                state.saving = false;
                state.success = true;
            })

            .addCase(saveCustomerMenu.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            });
    },
});




export default menuSlice.reducer;