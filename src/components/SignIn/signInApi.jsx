import API from "../../services/axios";


// export const loginAPI = async (data) => {
//   const response = await API.post("/auth/login", data);
//   return response.data;
// };

export const signUpAPI = async (data) => {
    const response = await API.post("/users/adduser", data);
    return response.data;
};

// signInApi.js

export const getUsersAPI = async () => {
    const response = await API.get("/users");
    return response.data;
};

export const deleteUserAPI = async (id) => {
    const response = await API.delete(`/users/${id}`);
    return response.data;
}


export const updateUserAPI = async (id, data) => {
    const response = await API.put(`/users/${id}`, data);
    return response.data;
}




