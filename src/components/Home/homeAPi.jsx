import API from "../../services/axios";


export const getDashboardCountsAPI = async () => {
    const response = await API.get("/dashboard/counts");
    return response.data;
};


export const markReadApi = async () => {
    const response = await API.put("/dashboard/mark-read");
    return response.data;
};