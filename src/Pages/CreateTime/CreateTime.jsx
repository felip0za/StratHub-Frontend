import { useState } from 'react';
import './CreateTime.css';
import Navbar from '../../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import api from '../../Services/API';

const CreateTime = () => {
  const [times, setTimes] = useState({
    nome: '',
    descricao: '',
  });

  const navigate = useNavigate();

  const handleCreateTime = async () => {
    try {
      await api.post('/times', times); // ✅ Usando o api diretamente
      alert('Time criado com sucesso!');
      setTimes({ nome: '', descricao: '' }); // limpa o formulário
      navigate('/times'); // redireciona após criar
    } catch (error) {
      console.error('Erro ao criar time:', error);
      alert('Erro ao criar o time.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (times.nome && times.descricao) {
      handleCreateTime();
    } else {
      alert('Por favor, preencha todos os campos.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-team-page">
        <div className="create-team-container">
          <h2>Criar Meu Time</h2>

          <form onSubmit={handleSubmit}>
            <label className="teamname">Nome do Time:</label>
            <input
              type="text"
              value={times.nome}
              onChange={(e) => setTimes({ ...times, nome: e.target.value })}
              required
            />

            <label className="teamDescription">Descrição do Time:</label>
            <textarea
              value={times.descricao}
              onChange={(e) => setTimes({ ...times, descricao: e.target.value })}
              required
              rows="4"
            />

            <button type="submit" className="submit-btn">
              Criar Time
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTime;
