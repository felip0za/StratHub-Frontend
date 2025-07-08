import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

// Função para criar uma instância axios que puxe o token do contexto
export function useApi() {
  const { token } = useAuth();

  const api = axios.create({
    baseURL: "http://localhost:8080", // ajuste para seu backend
  });

  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
}
