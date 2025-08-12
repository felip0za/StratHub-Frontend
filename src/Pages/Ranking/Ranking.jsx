import React, { useEffect, useState } from 'react';
import './Ranking.css';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import Navbar from '../../Components/Navbar/Navbar';
import platina from '../../assets/platina.png';
// futuros imports: prata, ouro etc

function Ranking() {
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);

  const userXP = 100; // PONTOS DO USUÁRIO

  const getRankInfo = (xp) => {
    if (xp < 800) {
      return {
        nome: "platina",
        img: platina,
        xpAtual: xp,
        xpProximo: 800,
      };
    }

    return {
      nome: "platina",
      img: platina,
      xpAtual: xp,
      xpProximo: null,
    };
  };

  const rankInfo = getRankInfo(userXP);
  const progresso = rankInfo.xpProximo
    ? Math.min(100, (rankInfo.xpAtual / rankInfo.xpProximo) * 100).toFixed(1)
    : 0;

  useEffect(() => {
    setTimeout(() => {
      const dadosMock = [
        { nome: 'Phantom Squad', vitorias: 12, derrotas: 3 },
        { nome: 'ViperX', vitorias: 11, derrotas: 4 },
        { nome: 'Valor Titans', vitorias: 10, derrotas: 5 },
        { nome: 'Odin Elite', vitorias: 9, derrotas: 6 },
        { nome: 'Radiant Killers', vitorias: 8, derrotas: 7 },
      ];

      // Recalcula pontuação com base nas vitórias e derrotas
      const comPontuacao = dadosMock.map(time => ({
        ...time,
        pontuacao: (time.vitorias * 50) + (time.derrotas * 25),
      }));

      const ordenado = comPontuacao.sort((a, b) => b.pontuacao - a.pontuacao);
      setTimes(ordenado);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <div className="ranking-wrapper">
        {/* Quadro principal da tabela */}
        <div className="ranking-container">
          <h1 className="ranking-title">ELITE CUP</h1>
          <div className="ranking-header">
            <span>#</span>
            <span>Time</span>
            <span>Pontuação</span>
            <span>Vitórias</span>
            <span>Derrotas</span>
            <span>Status</span>
          </div>
          <div className="ranking-list">
            {times.map((time, index) => {
              const classificado = time.pontuacao >= 800;
              return (
                <div key={index} className={`ranking-card ${index === 0 ? 'top-team' : ''}`}>
                  <span className="rank-position">#{index + 1}</span>
                  <span className="team-name">{time.nome}</span>
                  <span className="team-points">{time.pontuacao} pts</span>
                  <span className="team-wins">{time.vitorias}</span>
                  <span className="team-losses">{time.derrotas}</span>
                  <span className={`team-status ${classificado ? 'classificado' : 'nao-classificado'}`}>
                    {classificado ? 'Classificado' : 'Não Classificado'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quadro lateral do Rank */}
        <div className="rank-box">
          <img src={rankInfo.img} alt={`Rank ${rankInfo.nome}`} className="rank-icon" />
          <span className="rank-label">Rank: {rankInfo.nome}</span>

          <div className="rank-progress-container">
            {rankInfo.xpProximo && (
              <>
                <div className="rank-progress-bar">
                  <div
                    className="rank-progress-fill"
                    style={{ width: `${progresso}%` }}
                  ></div>
                </div>
                <span className="progress-text">{rankInfo.xpAtual} pontos</span>
              </>
            )}

            {rankInfo.xpAtual >= 800 && (
              <span className="classified-text">Classificados</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Ranking;
