 import React, { useState } from 'react';
import { useApi } from '../../Services/API';
import './Cadastro.css';
import { useNavigate } from 'react-router-dom';

const Cadastro = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [ubiConnect, setUbiConnect] = useState('');
  const [imagemUsuario, setImagemUsuario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const api = useApi();

  const handleNext = () => {
    if (step === 1 && !email) {
      setError('Digite um e-mail válido.');
      return;
    }
    if (step === 2 && confirmEmail !== email) {
      setError('O e-mail de confirmação não corresponde.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Ajustado para os nomes corretos do backend
    const usuarioParaEnvio = {
      email: email,
      senha: senha,
      nome: nome,
      ubiConnect: ubiConnect,
      imagemUsuario: imagemUsuario || null,
      rank: "Unranked", // valor default
      kd: 0.0 // valor default
    };

    try {
      const response = await api.post('/usuario/cadastrar', usuarioParaEnvio);
      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (err) {
      console.error('Erro no cadastro:', err);
      if (err.response?.data?.erro) {
        setError(err.response.data.erro);
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setImagemUsuario(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="register-container">
      <h2>Cadastro - Etapa {step} de 3</h2>
      {error && <div className="error-text">{error}</div>}

      {/* ETAPA 1 - EMAIL */}
      {step === 1 && (
        <form onSubmit={(e) => e.preventDefault()}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="wizard-buttons">
            <button type="button" onClick={handleNext}>Próximo</button>
          </div>
        </form>
      )}

      {/* ETAPA 2 - CONFIRMAR EMAIL */}
      {step === 2 && (
        <form onSubmit={(e) => e.preventDefault()}>
          <label>Confirme seu Email</label>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            required
          />
          <div className="wizard-buttons">
            <button type="button" onClick={handleBack}>Voltar</button>
            <button type="button" onClick={handleNext}>Próximo</button>
          </div>
        </form>
      )}

      {/* ETAPA 3 - DADOS DO PERFIL */}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <label>Apelido</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <label>UbisoftConnect</label>
          <input
            type="text"
            value={ubiConnect}
            onChange={(e) => setUbiConnect(e.target.value)}
            required
          />

          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <label>Imagem de perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {imagemUsuario && (
            <div className="preview-container">
              <p>Pré-visualização da imagem:</p>
              <img
                src={`data:image/png;base64,${imagemUsuario}`}
                alt="Pré-visualização"
                className="preview-img"
              />
            </div>
          )}

          <div className="wizard-buttons">
            <button type="button" onClick={handleBack}>Voltar</button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Cadastro;
