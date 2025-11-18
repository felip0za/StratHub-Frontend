import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {

  // Função para decodificar JWT sem bibliotecas
  function decodeJWT(token) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error("Erro ao decodificar JWT:", e);
      return null;
    }
  }

  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      return decodeJWT(storedToken); // decodifica o usuário diretamente
    }
    return null;
  });

  const login = (dados) => {
    const decoded = decodeJWT(dados.token);

    setToken(dados.token);
    setUser(decoded);

    sessionStorage.setItem('token', dados.token);
    sessionStorage.setItem('user', JSON.stringify(decoded));
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

// Hook customizado que também retorna o id do usuário
export function useAuth() {
  const context = useContext(AuthContext);
  const userId = context.user?.id || context.user?.userId || null;
  return { ...context, userId };
}
