import API from "../../services/axios";


export const getAllOrdersAPI = async () => {
    const response = await API.get("/order");
    return response.data;
};

export const updateOrderAPI = async (id, data) => {
    const response = await API.put(`/order/${id}`, data);
    return response.data;
};

export const deleteOrderAPI = async (id) => {
    const response = await API.delete(`/order/${id}`);
    return response.data;
};