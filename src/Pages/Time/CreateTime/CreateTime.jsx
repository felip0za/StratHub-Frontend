import React, { useState } from 'react';
import './CreateTime.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import { useAuth } from '../../../contexts/AuthContext';

const CreateTime = () => {
  const [nmTime, setNmTime] = useState('');
  const [teDescricao, setTeDescricao] = useState('');
  const [teImagemBase64, setTeImagemBase64] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const api = useApi();
  const { userId } = useAuth(); // <-- pega ID do contexto, de forma segura

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1]; // remove o prefixo
      setTeImagemBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nmTime.trim() || !teDescricao.trim() || !teImagemBase64) {
      setError('Por favor, preencha todos os campos e selecione uma imagem.');
      return;
    }

    if (!userId) {
      setError('Usuário não autenticado.');
      return;
    }

    try {
      const novoTime = {
        nome: nmTime,
        descricao: teDescricao,
        imagemBase64: teImagemBase64,
        id_criador: parseInt(userId, 10),
      };

      const response = await api.post('/times', novoTime);
      const timeId = response.data.id_time || response.data.id;

      if (timeId) {
        alert('Time criado com sucesso!');
        navigate(`/times/${timeId}`);
      } else {
        alert('Time criado, mas não foi possível obter o ID para redirecionamento.');
      }
    } catch (err) {
      console.error('Erro ao criar time:', err);
      setError('Erro ao criar o time. Verifique os dados e tente novamente.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-team-container">
        <h1 className="title">Criar Novo Time</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="create-team-form">
          <label>Nome do Time:</label>
          <input
            type="text"
            value={nmTime}
            onChange={e => setNmTime(e.target.value)}
            required
          />

          <label>Descrição do Time:</label>
          <textarea
            value={teDescricao}
            onChange={e => setTeDescricao(e.target.value)}
            required
            rows="4"
          />

          <label>Imagem:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />

          {teImagemBase64 && (
            <div className="preview-container">
              <p>Pré-visualização da imagem:</p>
              <img
                src={`data:image/png;base64,${teImagemBase64}`}
                alt="Pré-visualização"
                className="preview-img"
              />
            </div>
          )}

          <button type="submit" className="submit-button">
            Salvar Time
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateTime;
