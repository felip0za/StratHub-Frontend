import React, { useState } from 'react';
import './CreateTime.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../Services/API';  // IMPORTANTE: usar o hook useApi

const CreateTime = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemBase64, setImagemBase64] = useState('');
  const navigate = useNavigate();
  const api = useApi(); // Usa a instância axios com token do contexto

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome.trim() || !descricao.trim() || !imagemBase64) {
      alert('Por favor, preencha todos os campos e selecione uma imagem.');
      return;
    }

    try {
      const time = {
        nome,
        descricao,
        imagemBase64: imagemBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
      };

      const response = await api.post('/times', time);
      const timeId = response.data.id;

      if (timeId) {
        alert('Time criado com sucesso!');
        navigate(`/times/${timeId}`);
      }
    } catch (error) {
      console.error('Erro ao criar time:', error);
      alert('Erro ao criar o time. Verifique os dados e tente novamente.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-team-container">
        <h1 className="title">Criar Novo Time</h1>
        <form onSubmit={handleSubmit} className="create-team-form">
          <label>Nome do Time:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <label>Descrição do Time:</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
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

          {imagemBase64 && (
            <div className="preview-container">
              <p>Pré-visualização da imagem:</p>
              <img src={imagemBase64} alt="Pré-visualização" className="preview-img" />
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
