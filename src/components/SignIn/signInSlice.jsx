import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteUserAPI, getUsersAPI, signUpAPI, updateUserAPI } from "./signInApi";
import { createSlice } from "@reduxjs/toolkit";




export const registerUser = createAsyncThunk(
    "auth/register",
    async (data, thunkAPI) => {
        try {
            return await signUpAPI(data);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Registration Failed"
            );
        }
    }
);




export const getUsers = createAsyncThunk(
    "users/getAll",
    async (_, thunkAPI) => {
        try {
            return await getUsersAPI();
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || "Unable to fetch users"
            );
        }
    }
);

export const deleteUser = createAsyncThunk(
    "users/delete",
    async (id, thunkAPI) => {
        try {
            await deleteUserAPI(id);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const updateUser = createAsyncThunk(
    "users/update",
    async ({ id, data }, thunkAPI) => {
        try {
            const response = await updateUserAPI(id, data);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);





const initialState = {
    users: [],
    loading: false,
    error: null,
};

const signInSlice = createSlice({
    name: "signin",
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            localStorage.removeItem("token");
        },
    },



    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            }).addCase(getUsers.pending, (state) => {
                state.loading = true;
            })

            .addCase(getUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data;
            })

            .addCase(getUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })// Delete
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(
                    (user) => user._id !== action.payload
                );
            })

            // Update
            .addCase(updateUser.fulfilled, (state, action) => {
                const updatedUser = action.payload;

                const index = state.users.findIndex(
                    (user) => user._id === updatedUser._id
                );

                if (index !== -1) {
                    state.users[index] = updatedUser;
                }
            });
    },
});

export const { logout } = signInSlice.actions;

export default signInSlice.reducer;