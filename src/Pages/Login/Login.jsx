import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StratHub from "/src/assets/StratHub.png";
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin@example.com' && senha === '123456') {
        navigate('/home');
      } else {
        setError('Usuário ou senha inválidos.');
      }
      setIsLoading(false);
    }, 1000);
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
