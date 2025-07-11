// src/Services/API.js ou onde você armazena o hook

import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useMemo } from 'react';

export function useApi() {
  const { token } = useAuth();

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: 'http://localhost:8080',
    });

    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return instance;
  }, [token]);

  return api;
}
