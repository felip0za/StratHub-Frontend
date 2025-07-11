import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import Navbar from '../../../Components/Navbar/Navbar';
import './Times.css';

function Times() {
  const [time, setTime] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const api = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/times/${id}`);
        setTime(response.data);
      } catch (err) {
        console.error('Erro ao buscar os dados do time:', err);
        setError('ID do time não encontrado ou erro ao carregar.');
      }
    };

    fetchData();
  }, [id, api]);

  const handleEdit = () => {
    navigate(`/editar-time/${id}`);
  };

  const handleAddMember = () => {
    navigate(`/times/${id}/adicionar-membro`);
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p className="error-message">{error}</p>
        </div>
      </>
    );
  }

  if (!time) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Carregando time...</p>
        </div>
      </>
    );
  }

  const imagemTime = time.imagemBase64
    ? `data:image/*;base64,${time.imagemBase64}`
    : "/default-team.png";

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="left-section">
          <div className="logo-section">
            <img className="logo" src={imagemTime} alt="Logo do time" />
            <h2 className="team-title">{time.nome}</h2>
            <p className="description-label">DESCRIÇÃO:</p>
            <p className="description-text">{time.descricao}</p>

            <button className="edit-logo" onClick={handleEdit}>
              Editar Time
            </button>
          </div>
        </div>

        {/* 🔒 Seção de membros será reativada depois */}
        {/* 
        <div className="team-section">
          <h2 className="team-title">MEMBROS</h2>
          {members.length > 0 ? (
            members.map((member, index) => (
              <div className="member-card" key={index}>
                <img
                  src={member.imagem_usuario || "/default-avatar.png"}
                  alt="Foto do membro"
                  className="member-logo"
                />
                <div className="member-info">
                  <strong>{member.nome}</strong>
                  <p>{member.idUbi || 'ID não disponível'}</p>
                </div>
                <div className="kd">KD: {member.kd || 'N/A'}</div>
              </div>
            ))
          ) : (
            <p>Nenhum jogador encontrado.</p>
          )}
          <button className="add-member" onClick={handleAddMember}>
            ADICIONAR MEMBRO +
          </button>
        </div> 
        */}
      </div>
    </>
  );
}

export default Times;
