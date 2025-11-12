import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Si usas cookies/session; remove si usas sólo Authorization header
});

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

export const getTopCompanies = async () => {
  const res = await api.get('/responses/top-companies');
  return res.data
};