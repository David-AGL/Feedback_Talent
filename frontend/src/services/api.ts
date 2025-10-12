import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",  // URL de tu backend
  withCredentials: true  // Si usas cookies/auth
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