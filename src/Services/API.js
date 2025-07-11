import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useEffect } from 'react';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

export function useApi() {
  const { token } = useAuth();

  useEffect(() => {
    // Remove qualquer interceptor antigo antes de adicionar um novo
    const interceptor = api.interceptors.request.use(config => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [token]);

  return api;
}
