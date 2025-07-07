import React, { useState, useEffect } from 'react';
import './CreateTime.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import api from '../../../Services/API';

const CreateTime = ({ id }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemBase64, setImagemBase64] = useState('');
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        if (!id) {
          alert('Usuário não autenticado.');
          return;
        }

        const { data } = await api.get(`/usuario/${id}`);
        setUsuario(data);
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
      }
    };

    fetchUsuario();
  }, [id]);

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

    if (!usuario || !usuario.id) {
      alert('Usuário não autenticado.');
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
        await api.put(`/usuario/${usuario.id}`, {
          timeId: timeId,
        });

        alert('Time criado e associado ao usuário com sucesso!');
        navigate(`/times/${timeId}`);
      }
    } catch (error) {
      console.error('Erro ao criar time ou associar ao usuário:', error);
      alert('Erro ao criar o time. Verifique os dados e tente novamente.');
    }
  };

  return (
    <>
      <Navbar id={id} />
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
