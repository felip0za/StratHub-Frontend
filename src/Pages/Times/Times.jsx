import { useEffect, useState } from 'react';
import './Times.css';
import Navbar from '../../Components/Navbar/Navbar';
import StratHub from "/src/assets/StratHub.png";
import api from '../../Services/API';

function Times() {
  const [times, setTimes] = useState([]); // Lista de times vindos da API

  // Buscar dados da API quando o componente for montado
  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const response = await api.get('/times');
        setTimes(response.data);
      } catch (error) {
        console.error('Erro ao buscar times:', error);
        alert('Erro ao carregar times');
      }
    };

    fetchTimes();
  }, []);

  const handleEdit = (e) => {
    e.preventDefault();
    // navegação ainda não implementada
    // navigate("/login");
  };

  return (
    <>
      <Navbar />
      <div className="container">
        {times.length === 0 ? (
          <p>Carregando times...</p>
        ) : (
          times.map((time, index) => (
            <div key={index} className="team-container">
              {/* Lado esquerdo - Logo e informações */}
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

              {/* Lado direito - seção de membros e títulos */}
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

                {/* Títulos - conteúdo estático por enquanto */}
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
          ))
        )}
      </div>
    </>
  );
}

export default Times;
