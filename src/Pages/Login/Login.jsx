import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";  // import com chaves
import StratHub from "/src/assets/StratHub.png";
import './Login.css';
import { useAuth } from "../../contexts/AuthContext";

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const api = useApi(); // chama aqui para usar

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/usuario/login', { email, senha });
      const { token, id } = response.data;

      if (token && id) {
        login(token, id);
        navigate('/home');
      } else {
        setError("Dados de resposta inválidos. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Erro ao fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickSignin = () => {
    navigate('/cadastro');
  };

  return (
    <div className="login-page">
      <img src={StratHub} alt="Logo StratHub" className="login-logo" />
      <div className="login-container">
        <h2>Entrar na sua conta</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="********"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="divider">ou</div>

        <button type="button" className="button-sign-in" onClick={handleClickSignin}>
          Cadastre-se
        </button>
      </div>
    </div>
  );
}

export default Login;
