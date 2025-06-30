import { useEffect, useState } from 'react';
import './Times.css';
import Navbar from '../../Components/Navbar/Navbar';
import StratHub from "/src/assets/StratHub.png";
import api from '../../Services/API';
import { useNavigate, useParams } from 'react-router-dom';

function Times() {
  const [time, setTime] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();  // ✅ Captura o ID da URL

  useEffect(() => {
    const fetchTimeById = async () => {
      try {
        const response = await api.get(`/times/${id}`);
        setTime(response.data);
      } catch (error) {
        console.error('Erro ao buscar o time:', error);
        setError('ID do time não encontrado ou erro ao carregar.');
      }
    };

    fetchTimeById();
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
        <div className="team-container">
          <div className="logo-section">
            <div className="logo-border">
              <img src={StratHub} alt="Logo do sistema" className="logo" />
            </div>
            <h1 className="description-title">DESCRIÇÃO:</h1>
            <p className='description-label'>{time.descricao}</p>
            <div className="button-group">
              <button onClick={handleEdit} className="edit-time">Editar time</button>
            </div>
          </div>

          <div className="team-section">
            <h2 className="team-name">{time.nome}</h2>
            <div className="player-list">
              <div className="member-card">
                <img src={StratHub} alt="Logo do sistema" className="member-logo" />
                <div className="member-info">
                  <p className="member-name">apelido: [apelido]</p>
                  <p className="member-id">ubi: [ubi]</p>
                  <p className="kd-info">KD: [kd]</p>
                </div>
              </div>
            </div>
            <div className="button-group">
              <button className="add-member">ADICIONAR MEMBRO +</button>
            </div>

            <div className='tournament-titles'>
              <h2 className='tournament-title'>TÍTULOS:</h2>
              <div className="title-card">
                <div className="title-info">
                  <h1 className="tournament-name">[Nome do campeonato]</h1>
                  <p className="placement">[Colocação]</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Times;
