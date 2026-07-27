import API from "../../services/axios";

export const loginAPI = async (data) => {
  const response = await API.post("/users/login", data);
  return response.data;
};