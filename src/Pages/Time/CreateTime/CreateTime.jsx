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

    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem válido.');
      return;
    }

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
      setError('⚠️ Preencha todos os campos obrigatórios e envie uma imagem.');
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
        twitter: twitter || null,
      };

      const response = await api.post('/times', novoTime);
      const timeId = response.data.id_time || response.data.id;

      if (timeId) {
        alert('✅ Time criado com sucesso!');
        navigate(`/times/${timeId}`);
      } else {
        alert('Time criado, mas sem ID retornado.');
      }
    } catch (err) {
      console.error('Erro ao criar time:', err);
      setError('Erro ao criar o time. Verifique os dados e tente novamente.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-time-page">
        <div className="create-card">
          <h1 className="form-title">🏆 Criar Novo Time</h1>
          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="team-form">
            <div className="form-group">
              <label>Nome do Time</label>
              <input
                type="text"
                value={nmTime}
                onChange={(e) => setNmTime(e.target.value)}
                required
                placeholder="Ex: The Dragons Fury"
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={teDescricao}
                onChange={(e) => setTeDescricao(e.target.value)}
                required
                placeholder="Fale um pouco sobre o time..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Apelido / Tag</label>
              <input
                type="text"
                value={apelidoTime}
                onChange={(e) => setApelidoTime(e.target.value.slice(0, 5).toUpperCase())}
                maxLength={5}
                required
                placeholder="Ex: TDF"
              />
              <small className="tag-hint">Máx. 5 caracteres</small>
            </div>

            <div className="form-group">
              <label>Imagem do Time</label>
              <input type="file" accept="image/*" onChange={handleImageChange} required />
              {teImagemBase64 && (
                <div className="preview-box">
                  <img
                    src={`data:image/png;base64,${teImagemBase64}`}
                    alt="Preview"
                    className="team-preview"
                  />
                </div>
              )}
            </div>

            <div className="social-group">
              <h3>🌐 Redes Sociais (opcional)</h3>
              <input
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Instagram (https://instagram.com/seutime)"
              />
              <input
                type="url"
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="Discord (https://discord.gg/seutime)"
              />
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="Twitter (https://twitter.com/seutime)"
              />
            </div>

            <button type="submit" className="btn-create">
              Criar Time
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTime;
