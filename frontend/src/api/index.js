import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
    }
});

export const api = {
    createUser: async (product) => {
        let response = await apiClient.post("/api/products", product);
        return response.data;
    },
    getProducts: async () => {
        let response = await apiClient.get("/api/products");
        return response.data
    },
    getProduct: async (id) => {
        let response = await apiClient.get(`/api/products/:${id}`);
        return response.data;
    },
    patchProduct: async (product, id) => {
        let response = await apiClient.patch(`/api/products/:${id}`);
        return response.data;
    },
    deleteProduct: async (id) => {
        let response = await apiClient.delete(`/api/products/:${id}`);
        return response.data;
    }
}