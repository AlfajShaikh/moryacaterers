import API from "../../services/axios";

export const getAllMenusAPI = async () => {
    const response = await API.get("/menitems");
    return response.data;
};

export const saveCustomerMenuAPI = async (data) => {
    const response = await API.post("/order/customer-menu", data);
    return response.data;
};