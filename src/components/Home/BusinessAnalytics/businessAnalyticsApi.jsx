import API from "../../../services/axios";




export const getAnalyticsAPI = async () => {
    const response = await API.get("/analytics");
    return response.data;
};