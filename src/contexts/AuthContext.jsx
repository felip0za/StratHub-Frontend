import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (dados) => {
    setToken(dados.token);
    setUser(dados);

    sessionStorage.setItem('token', dados.token);
    sessionStorage.setItem('user', JSON.stringify(dados));
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar acesso a userId
export function useAuth() {
  const context = useContext(AuthContext);
  const userId = context.user?.id || null;
  return { ...context, userId };
}
