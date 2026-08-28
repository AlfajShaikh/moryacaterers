import API from "../../services/axios";


export const searchInvoiceAPI = async (name) => {
    const response = await API.get("/invoice/search", {
        params: {
            name,
        },
    });

    return response.data;
};

export const getConfirmedInvoicesAPI = async () => {
    const response = await API.get("/invoice/confirmed");
    return response.data;
};


export const getInvoiceDetailsAPI = async (mobile) => {
    const response = await API.get(`/invoice/invoice/${mobile}`);
    return response.data;
};

export const submitInvoiceAPI = async (data) => {
    const response = await API.post("/invoice/submit", data);
    return response.data;
};


export const getInvoiceByIdAPI = async (id) => {
    const response = await API.get(`/invoice/data/${id}`);
    return response.data;
};