import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const token = localStorage.getItem("token");
        if (token) {
          const response = await api.post("/auth/refresh");
          const { token: newToken } = response.data;

          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed, clear storage and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Manual signup
  signup: async (name, email, password) => {
    const response = await api.post("/auth/signup", { name, email, password });
    return response.data;
  },

  // Manual login
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Google OAuth
  googleAuth: async (credential) => {
    const response = await api.post("/auth/google", { credential });
    return response.data;
  },

  // Get current user
  getUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },
};

// Cases API methods
export const casesAPI = {
  getCases: async () => {
    const response = await api.get("/cases");
    return response.data;
  },

  getCase: async (id) => {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  },

  createCase: async (caseData) => {
    const response = await api.post("/cases", caseData);
    return response.data;
  },

  updateCase: async (id, updates) => {
    const response = await api.put(`/cases/${id}`, updates);
    return response.data;
  },

  deleteCase: async (id) => {
    const response = await api.delete(`/cases/${id}`);
    return response.data;
  },
};

// Documents API methods
export const documentsAPI = {
  getDocuments: async (caseId) => {
    const response = await api.get(`/documents/case/${caseId}`);
    return response.data;
  },

  uploadDocument: async (caseId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("case_id", caseId);

    const response = await api.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};

// Notes API methods
export const notesAPI = {
  getNotes: async (caseId) => {
    const response = await api.get(`/notes/case/${caseId}`);
    return response.data;
  },

  createNote: async (noteData) => {
    const response = await api.post("/notes", noteData);
    return response.data;
  },

  updateNote: async (id, updates) => {
    const response = await api.put(`/notes/${id}`, updates);
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};

// Speeches API methods
export const speechesAPI = {
  getSpeeches: async (caseId) => {
    const response = await api.get(`/speeches/case/${caseId}`);
    return response.data;
  },

  createSpeech: async (speechData) => {
    const response = await api.post("/speeches", speechData);
    return response.data;
  },

  updateSpeech: async (id, updates) => {
    const response = await api.put(`/speeches/${id}`, updates);
    return response.data;
  },

  deleteSpeech: async (id) => {
    const response = await api.delete(`/speeches/${id}`);
    return response.data;
  },
};

export default api;
