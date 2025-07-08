import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [userId, setUserId] = useState(() => sessionStorage.getItem('userId') || null);

  const login = (newToken, id) => {
    setToken(newToken);
    setUserId(id);
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('userId', id);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
