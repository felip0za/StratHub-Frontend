import React, { useState } from 'react';
import { useApi } from '../../Services/API';
import './Cadastro.css';
import { useNavigate } from 'react-router-dom';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [imagem_usuario, setImagemUsuario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const api = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const usuarioParaEnvio = {
        nome,
        email,
        senha,
        imagem_usuario,
      };

      await api.post('/usuario/cadastrar', usuarioParaEnvio);
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
      const base64String = reader.result.split(',')[1]; // Remove o prefixo
      setImagemUsuario(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="register-container">
      <h2>Cadastro</h2>
      {error && <div className="error-text">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        {imagem_usuario && (
          <div className="preview-container">
            <p>Pré-visualização da imagem:</p>
            <img
              src={`data:image/png;base64,${imagem_usuario}`}
              alt="Pré-visualização"
              className="preview-img"
            />
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
};

export default Cadastro;
