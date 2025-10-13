import React, { useState } from 'react';
import './CreateTime.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import { useAuth } from '../../../contexts/AuthContext';

const CreateTime = () => {
  const [apelidoTime, setApelidoTime] = useState('');
  const [nmTime, setNmTime] = useState('');
  const [teDescricao, setTeDescricao] = useState('');
  const [teImagemBase64, setTeImagemBase64] = useState('');
  const [instagram, setInstagram] = useState('');
  const [discord, setDiscord] = useState('');
  const [twitter, setTwitter] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const api = useApi();
  const { userId } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setTeImagemBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nmTime.trim() || !teDescricao.trim() || !teImagemBase64) {
      setError('Por favor, preencha todos os campos obrigatórios e selecione uma imagem.');
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
        apelido: apelidoTime,
        instagram: instagram || null,
        discord: discord || null,
        twitter: twitter || null
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
          <input type="text" value={nmTime} onChange={e => setNmTime(e.target.value)} required />

          <label>Descrição do Time:</label>
          <textarea value={teDescricao} onChange={e => setTeDescricao(e.target.value)} required rows="4" />

          <label>Apelido do Time(TAG):</label>
          <input
            type="text"
            value={apelidoTime}
            onChange={e => setApelidoTime(e.target.value.slice(0, 5))}
            maxLength={5}
            required
          />

          <label>Imagem:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required />

          {teImagemBase64 && (
            <div className="preview-container">
              <p>Pré-visualização da imagem:</p>
              <img src={`data:image/png;base64,${teImagemBase64}`} alt="Pré-visualização" className="preview-img" />
            </div>
          )}

          {/* LINKS OPCIONAIS */}
          <label>Instagram (opcional):</label>
          <input type="url" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/seutime" />

          <label>Discord (opcional):</label>
          <input type="url" value={discord} onChange={e => setDiscord(e.target.value)} placeholder="https://discord.gg/seutime" />

          <label>Twitter (opcional):</label>
          <input type="url" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://twitter.com/seutime" />

          <button type="submit" className="submit-button">Salvar Time</button>
        </form>
      </div>
    </>
  );
};

export default CreateTime;
