import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useMemo } from 'react';

export function useApi() {
  const { token } = useAuth();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: 'http://localhost:8080',
    });

    // Sempre adiciona Authorization se o token existir
    instance.interceptors.request.use(
      config => {
        if (token) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`,
          };
        }
        return config;
      },
      error => Promise.reject(error)
    );

    return instance;
  }, [token]);

  return api;
}
