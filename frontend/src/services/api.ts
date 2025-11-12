import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Si usas cookies/session; remove si usas sólo Authorization header
});

// Attach Authorization header from localStorage token on every request
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token && config && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore localStorage errors
  }
  return config;
});

// Optional: global response handler for 401 to clear invalid token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Token invalid or not provided. Clear stored token to avoid loops.
      try { localStorage.removeItem('token'); } catch {};
    }
    return Promise.reject(err);
  }
);

export const login = async (email: string, password: string) => {
  return api.post("/auth/login", { email, password });  // Asume endpoint en backend
};

export const submitSurvey = async (data: any) => {
  return api.post("/feedback", data);  // Endpoint para encuestas
};

export const getRatings = async () => {
  return api.get("/ratings");  // Endpoint para dashboard de empresas
};

export const getResponseSummary= async(companyUserId: string) =>{
  return api.get(`/responses/company/${companyUserId}/summary`);
}
export const getAllResponses= async(companyUserId: string) =>{
  return api.get(`/responses/company/${companyUserId}`);
}

export const getTopCompanies = async (category?: string) => {
  if (category && category !== 'general') {
    const res = await api.get(`/responses/top-companies/category/${encodeURIComponent(category)}`);
    return res.data;
  }
  const res = await api.get('/responses/top-companies');
  return res.data;
};
