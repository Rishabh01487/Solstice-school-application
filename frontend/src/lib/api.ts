import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem("refresh_token");
                if (refreshToken) {
                    const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
                        refresh_token: refreshToken,
                    });
                    localStorage.setItem("access_token", data.access_token);
                    originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                    return apiClient(originalRequest);
                }
            } catch (_) {
                localStorage.clear();
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authApi = {
    login: (email: string, password: string) =>
        apiClient.post("/api/v1/auth/login", { email, password }),
    loginWithFirebase: (firebase_token: string) =>
        apiClient.post("/api/v1/auth/firebase-login", { firebase_token }),
    logout: () => apiClient.post("/api/v1/auth/logout"),
    me: () => apiClient.get("/api/v1/auth/me"),
};

// Students API
export const studentsApi = {
    list: (params?: Record<string, unknown>) =>
        apiClient.get("/api/v1/students", { params }),
    get: (id: string) => apiClient.get(`/api/v1/students/${id}`),
    create: (data: unknown) => apiClient.post("/api/v1/students", data),
    update: (id: string, data: unknown) =>
        apiClient.patch(`/api/v1/students/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/v1/students/${id}`),
};

// Teachers API
export const teachersApi = {
    list: (params?: Record<string, unknown>) =>
        apiClient.get("/api/v1/teachers", { params }),
    get: (id: string) => apiClient.get(`/api/v1/teachers/${id}`),
};

// Attendance API
export const attendanceApi = {
    getReport: (params?: Record<string, unknown>) =>
        apiClient.get("/api/v1/attendance", { params }),
};

// Finance API
export const financeApi = {
    getFees: (params?: Record<string, unknown>) =>
        apiClient.get("/api/v1/finance/fees", { params }),
    getInvoices: (params?: Record<string, unknown>) =>
        apiClient.get("/api/v1/finance/invoices", { params }),
};

// Reports API
export const reportsApi = {
    getDashboardStats: () => apiClient.get("/api/v1/reports/dashboard"),
};
