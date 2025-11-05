import { createContext, useContext, useState, useEffect } from 'react';
import { useApi } from '../Services/API'; // 👈 Certifique-se de que o hook está no caminho certo

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const api = useApi();

  const [token, setToken] = useState(() => sessionStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // 🔄 Atualiza idTime automaticamente sempre que o usuário logado mudar
  useEffect(() => {
    const atualizarTimeUsuario = async () => {
      if (!user?.id) return;

      try {
        // 🔹 Busca o usuário completo no backend para pegar o time atual
        const response = await api.get(`/usuarios/${user.id}`);
        const usuarioAtualizado = response.data;

        // 🔹 Atualiza o state e o sessionStorage
        setUser((prev) => ({
          ...prev,
          idTime: usuarioAtualizado.time?.id || null,
        }));

        const updatedUser = {
          ...user,
          idTime: usuarioAtualizado.time?.id || null,
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Erro ao atualizar idTime do usuário:', err);
      }
    };

    atualizarTimeUsuario();
  }, [user?.id]); // roda quando o id do usuário mudar

  // 🔐 Login
  const login = (dados) => {
    setToken(dados.token);
    setUser(dados);
    sessionStorage.setItem('token', dados.token);
    sessionStorage.setItem('user', JSON.stringify(dados));
  };

  // 🚪 Logout
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

// Hook customizado
export function useAuth() {
  const context = useContext(AuthContext);
  const userId = context.user?.id || null;
  const idTime = context.user?.idTime || null;
  return { ...context, userId, idTime };
}
