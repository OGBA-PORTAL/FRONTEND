import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies automatically
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach token from localStorage if available
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
