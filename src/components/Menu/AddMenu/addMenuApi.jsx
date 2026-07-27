import API from "../../../services/axios";

export const createMenuAPI = async (data) => {
  const response = await API.post("/menitems", data);
  return response.data;
};


export const getMenusAPI = async () => {
  const response = await API.get("/menitems");
  return response.data;
};  


export const deleteMenuItemAPI = async (categoryId, itemId) => {
  const response = await API.delete(
    `/menitems/delete-item/${categoryId}/${itemId}`
  );

  return response.data;
};

export const updateMenuItemAPI = async (
  categoryId,
  itemId,
  data
) => {
  const response = await API.put(
    `/menitems/update-item/${categoryId}/${itemId}`,
    data
  );

  return response.data;
};