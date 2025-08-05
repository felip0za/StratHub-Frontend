import React, { useEffect, useState } from 'react';
import './Ranking.css';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import Navbar from '../../Components/Navbar/Navbar';
import bronze from '../../assets/bronze.png';

function Ranking() {
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const dadosMock = [
        { nome: 'Phantom Squad', pontuacao: 1800, vitorias: 12, derrotas: 3 },
        { nome: 'ViperX', pontuacao: 1720, vitorias: 11, derrotas: 4 },
        { nome: 'Valor Titans', pontuacao: 1680, vitorias: 10, derrotas: 5 },
        { nome: 'Odin Elite', pontuacao: 1600, vitorias: 9, derrotas: 6 },
        { nome: 'Radiant Killers', pontuacao: 1525, vitorias: 8, derrotas: 7 },
      ];

      const ordenado = dadosMock.sort((a, b) => b.pontuacao - a.pontuacao);
      setTimes(ordenado);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Navbar />
      <div className="ranking-wrapper">
        {/* Quadro principal da tabela */}
        <div className="ranking-container">
          <h1 className="ranking-title">ELITE CUP</h1>
          <div className="ranking-header">
            <span>Posição</span>
            <span>Time</span>
            <span>Pontuação</span>
            <span>Vitórias</span>
            <span>Derrotas</span>
          </div>
          <div className="ranking-list">
            {times.map((time, index) => (
              <div key={index} className={`ranking-card ${index === 0 ? 'top-team' : ''}`}>
                <span className="rank-position">#{index + 1}</span>
                <span className="team-name">{time.nome}</span>
                <span className="team-points">{time.pontuacao} pts</span>
                <span className="team-wins">{time.vitorias}</span>
                <span className="team-losses">{time.derrotas}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quadro lateral do Rank com barra de progressão */}
        <div className="rank-box">
          <img src={bronze} alt="Rank Bronze" className="rank-icon" />
          <span className="rank-label">Rank: Bronze</span>
          <div className="rank-progress-container">
            <div className="rank-progress-bar">
              <div className="rank-progress-fill" style={{ width: '40%' }}></div>
            </div>
            <span className="progress-text">800 / 2000 XP</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Ranking;
