import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:4000",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function registerUser(userData) {
    return await api.post('/users/register', userData);
}

export async function loginUser(credentials) {
    // Hits your router.post("/login", userController.loginUser)
    return await api.post('/users/login', credentials);
}

export default api;