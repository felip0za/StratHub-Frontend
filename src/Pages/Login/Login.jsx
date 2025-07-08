import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Services/API";
import StratHub from "/src/assets/StratHub.png";
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/usuario/login', { email, senha });
      const { token, id } = response.data;

      if (token && id) {
        // Salvar token e id do usuário no localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", id);

        console.log("Login bem-sucedido:", response.data);
        navigate('/home');
      } else {
        setError("Dados de resposta inválidos. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erro inesperado. Verifique sua conexão e tente novamente.");
      }
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
