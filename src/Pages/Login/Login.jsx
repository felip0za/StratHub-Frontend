import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";
import { useAuth } from "../../contexts/AuthContext";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import StratHubLogo from "/src/assets/StratHub.png";
import "./Login.css";

const Login = () => {
  const [email, setEmail]       = useState("");
  const [senha, setSenha]       = useState("");
  const [error, setError]       = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const api      = useApi();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post("/usuario/login", { email, senha });
      const dados = response.data;
      if (dados.token && dados.id) {
        login(dados);
        navigate("/usuario/" + dados.id);
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    } catch {
      setError("Email ou senha incorretos.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="login-page">
      <div className="background-overlay" />

      <div className="login-card">
        <img src={StratHubLogo} alt="StratHub" className="login-logo" />

        <h2>Bem-vindo de volta</h2>
        <p className="subtitle">Acesse sua conta para continuar</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-btn">Entrar</button>
        </form>

        <div className="divider">ou</div>

        <button className="signup-btn" onClick={() => navigate("/cadastro")}>
          Criar conta
        </button>
      </div>
    </div>
  );
};

export default Login;