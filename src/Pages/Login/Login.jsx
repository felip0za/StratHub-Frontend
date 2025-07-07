import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Services/API"; // Aqui você usa a URL do seu backend
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
      // Envia os dados de email e senha para o backend
      const response = await api.post('/usuario/login', { email, senha });

      // Se o login for bem-sucedido, você pode pegar os dados do usuário (sem a senha) e navegar
      const usuario = response.data;

      console.log('Login sucesso:', usuario);
      // Você pode armazenar informações do usuário no estado global, localStorage, etc.

      navigate('/home');
    } catch (err) {
      console.error('Erro no login:', err);
      // Caso de erro, exibe mensagem de erro adequada
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Ocorreu um erro ao tentar fazer login.');
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
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
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label>Senha</label>
            <input
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
