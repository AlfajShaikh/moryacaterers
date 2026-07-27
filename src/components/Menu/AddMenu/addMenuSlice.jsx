import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createMenuAPI, deleteMenuItemAPI, getMenusAPI, updateMenuItemAPI } from "./addMenuApi";

export const createMenu = createAsyncThunk(
    "menu/create",
    async (data, thunkAPI) => {
        try {
            return await createMenuAPI(data);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Unable to create menu"
            );
        }
    }
);

export const getMenus = createAsyncThunk(
    "menu/getMenus",
    async (_, thunkAPI) => {
        try {
            return await getMenusAPI();
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data || "Failed to load menu"
            );
        }
    }
);

export const deleteMenuItem = createAsyncThunk(
    "menu/deleteItem",
    async ({ categoryId, itemId }, thunkAPI) => {
        try {
            await deleteMenuItemAPI(categoryId, itemId);

            return {
                categoryId,
                itemId,
            };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const updateMenuItem = createAsyncThunk(
    "menu/updateItem",
    async ({ categoryId, itemId, data }, thunkAPI) => {
        try {
            const response = await updateMenuItemAPI(
                categoryId,
                itemId,
                data
            );

            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

const initialState = {
    menus: [],
    loading: false,
    error: null,
};

const addMenuSlice = createSlice({
    name: "menu",
    initialState,

    reducers: {
        clearStatus(state) {
            state.success = false;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(createMenu.pending, (state) => {
                state.loading = true;
                state.success = false;
            })

            .addCase(createMenu.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })

            .addCase(createMenu.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getMenus.pending, (state) => {
                state.loading = true;
            })

            .addCase(getMenus.fulfilled, (state, action) => {
                state.loading = false;
                state.menus = action.payload.data;
            })

            .addCase(getMenus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            }).addCase(deleteMenuItem.fulfilled, (state, action) => {

                const { categoryId, itemId } = action.payload;

                const category = state.menus.find(
                    menu => menu._id === categoryId
                );

                if (category) {
                    category.menuItems = category.menuItems.filter(
                        item => item._id !== itemId
                    );
                }
            })

            .addCase(updateMenuItem.fulfilled, (state, action) => {

                const updatedCategory = action.payload;

                const index = state.menus.findIndex(
                    menu => menu._id === updatedCategory._id
                );

                if (index !== -1) {
                    state.menus[index] = updatedCategory;
                }

            });;
    },
});

export const { clearStatus } = addMenuSlice.actions;

export default addMenuSlice.reducer;