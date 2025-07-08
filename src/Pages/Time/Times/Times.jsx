import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import Navbar from '../../../Components/Navbar/Navbar';
import './Times.css';

function Times() {
  const [time, setTime] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const api = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timeResponse = await api.get(`/times/${id}`);
        setTime(timeResponse.data);

        const membersResponse = await api.get(`/times/${id}/membros`);
        setMembers(membersResponse.data || []);
      } catch (error) {
        console.error('Erro ao buscar os dados do time:', error);
        setError('ID do time não encontrado ou erro ao carregar.');
      }
    };

    fetchData();
  }, [id, api]);

  const handleEdit = (e) => {
    e.preventDefault();
    navigate(`/editar-time/${id}`);
  };

  const handleAddMember = () => {
    navigate(`/times/${id}/adicionar-membro`);
  };

  if (error) {
    return (
      <>
        <Navbar />
        <p>{error}</p>
      </>
    );
  }

  if (!time) {
    return (
      <>
        <Navbar />
        <p>Carregando time...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="left-section">
          <div className="logo-section">
            <img
              className="logo"
              src={time.imagemBase64 || "/default-team.png"}
              alt="Logo do time"
            />
            <h2 className="team-title">{time.nome}</h2>
            <p className="description-label">DESCRIÇÃO:</p>
            <p className="description-label">{time.descricao}</p>
            <button className="edit-logo" onClick={handleEdit}>Editar Time</button>
          </div>
        </div>

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

          <button className="add-member" onClick={handleAddMember}>ADICIONAR MEMBRO +</button>
        </div>
      </div>
    </>
  );
}

export default Times;
