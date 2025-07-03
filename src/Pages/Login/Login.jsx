import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Services/API"; // certifique-se de importar corretamente seu `api`
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
      const response = await api.post('/usuario/login', {
        email,
        senha
      });

      console.log('Login sucesso:', response.data);
      navigate('/home'); // redireciona após login
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Email ou senha inválidos.');
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
