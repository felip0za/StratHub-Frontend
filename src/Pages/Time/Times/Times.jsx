import React, { useEffect, useState } from 'react';
import api from '../../../Services/API';
import Navbar from '../../../Components/Navbar/Navbar';
import './Times.css';
import { useNavigate, useParams } from 'react-router-dom';

function Times() {
  const [time, setTime] = useState(null);
  const [members, setMembers] = useState([]); 
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Buscar o time
        const timeResponse = await api.get(`/times/${id}`);
        setTime(timeResponse.data);

      } catch (error) {
        console.error('Erro ao buscar os dados do time:', error);
        setError('ID do time não encontrado ou erro ao carregar.');
      }
    };

    fetchData();
  }, [id]);

  const handleEdit = (e) => {
    e.preventDefault();
    navigate("/login");
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
              src={time.imagemBase64}
            />
            <h2 className="team-title">{time.nome}</h2>
            <p className="description-label">DESCRIÇÃO:</p>
            <p className='description-label'>{time.descricao}</p>
            <button className="edit-logo" onClick={handleEdit}>Editar Time</button>
          </div>
        </div>

        <div className="team-section">
          <h2 className="team-title">MEMBROS</h2>

          {members.length > 0 ? (
            members.map((member, index) => (
              <div className="member-card" key={index}>
                <img src={member.imageUrl || "/logo.png"} alt="Logo Membro" className="member-logo" />
                <div className="member-info">
                  <strong>{member.nome}</strong>
                  <p>{member.idUbi}</p>
                </div>
                <div className="kd">KD: {member.kd}</div>
              </div>
            ))
          ) : (
            <p>Nenhum jogador encontrado.</p>
          )}

          <button className="add-member">ADICIONAR MEMBRO +</button>
        </div>
      </div>
    </>
  );
}

export default Times;
