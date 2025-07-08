import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  // Função para logar e salvar token + id
  function login(newToken, newUserId) {
    setToken(newToken);
    setUserId(newUserId);
  }

  // Função para deslogar e limpar dados
  function logout() {
    setToken(null);
    setUserId(null);
  }

  return (
    <AuthContext.Provider value={{ token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto em qualquer componente
export function useAuth() {
  return useContext(AuthContext);
}
 