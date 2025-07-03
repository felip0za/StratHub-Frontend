import React, { useState } from 'react';
import api from '../../Services/API';
import './Cadastro.css';
import { useNavigate } from 'react-router-dom';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [imagem_usuario, setimagem_usuario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setimagem_usuario(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!nome.trim() || !email.trim() || !senha.trim() || !imagem_usuario) {
      setError('Por favor, preencha todos os campos e selecione uma imagem.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/usuario/cadastrar', {
        nome,
        email,
        senha,
        imagem_usuario: imagem_usuario.replace(/^data:image\/[a-z]+;base64,/, ''),
      });

      console.log('Cadastro feito com sucesso:', response.data);
      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setError('Erro ao cadastrar. Verifique os dados ou tente outro e-mail.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Cadastro</h2>

        {error && <p className="error-text">{error}</p>}

        <label>Nome:</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Senha:</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <label>Imagem:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />

        {imagem_usuario && (
          <div className="preview-container">
            <p>Pré-visualização da imagem:</p>
            <img
              src={imagem_usuario}
              alt="Pré-visualização"
              className="preview-img"
            />
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Concluir Cadastro'}
        </button>
      </form>
    </div>
  );
};

export default Cadastro;
