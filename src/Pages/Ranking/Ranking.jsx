import React, { useEffect, useState } from 'react';
import { useApi } from '../../Services/API';
import Navbar from '../../Components/Navbar/Navbar';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';

import ferro from '../../assets/ferro.png';
import bronze from '../../assets/bronze.png';
import prata from '../../assets/prata.png';
import ouro from '../../assets/ouro.png';
import platina from '../../assets/platina.png';
import challenger from '../../assets/challenger.png';
import master from '../../assets/master.png';

import './Ranking.css';

function Ranking() {
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rankSelecionado, setRankSelecionado] = useState('');
  const [meuTime, setMeuTime] = useState(null);

  const api = useApi();

  const rankToImage = {
    FERRO: ferro,
    BRONZE: bronze,
    PRATA: prata,
    OURO: ouro,
    PLATINA: platina,
    CHALLENGER: challenger,
    MASTER: master,
  };

  useEffect(() => {
    const carregarRanking = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');

        // Buscar o time do usuário logado
        const resUsuario = await api.get('/times/usuario', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resUsuario.data || resUsuario.data.length === 0) {
          setError('Você não possui nenhum time.');
          setLoading(false);
          return;
        }

        const usuarioTime = resUsuario.data[0];

        // Buscar pontuação atual do time
        const resPontuacao = await api.get(`/times/${usuarioTime.id}/pontuacao`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        usuarioTime.pontuacao = resPontuacao.data.pontuacao || 0; // garante valor padrão
        setMeuTime(usuarioTime);

        const rankDoUsuario = usuarioTime.rank?.toLowerCase() || '';
        setRankSelecionado(rankDoUsuario);

        // Buscar todos os times do mesmo rank
        const resTimes = await api.get(`/times/elitecup/${rankDoUsuario}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const listaTimes = resTimes.data
          .map((t) => ({ ...t, ehMeuTime: t.id === usuarioTime.id }))
          .sort((a, b) => b.pontuacao - a.pontuacao);

        setTimes(listaTimes);
        setError('');
      } catch (err) {
        console.error('Erro ao carregar ranking:', err);
        setError('Erro ao carregar o ranking.');
      } finally {
        setLoading(false);
      }
    };

    carregarRanking();
  }, [api]);

  if (loading)
    return (
      <>
        <Navbar />
        <LoadingScreen />
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="container">
          <p className="error-message">{error}</p>
        </div>
      </>
    );

  // Pontuação e barra de progresso
  const timePontuacao = meuTime?.pontuacao || 0;

  const getRankInfo = (pontuacao) => {
    if (pontuacao < 800) {
      return { pontuacaoAtual: pontuacao, pontuacaoProximo: 800 };
    }
    return { pontuacaoAtual: pontuacao, pontuacaoProximo: null };
  };

  const rankInfo = getRankInfo(timePontuacao);
  const progresso = rankInfo.pontuacaoProximo
    ? Math.min(100, (rankInfo.pontuacaoAtual / rankInfo.pontuacaoProximo) * 100).toFixed(1)
    : 100;

  const rankImage = meuTime?.rank ? rankToImage[meuTime.rank.toUpperCase()] : null;

  return (
    <>
      <Navbar />
      <div className="ranking-wrapper">
        {/* Tabela principal */}
        <div className="ranking-container">
          <h1 className="ranking-title">ELITE CUP - {rankSelecionado.toUpperCase()}</h1>
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
                <div key={index} className={`ranking-card ${time.ehMeuTime ? 'meu-time' : ''}`}>
                  <span className="rank-position">#{index + 1}</span>
                  <span className="team-name">{time.nome}</span>
                  <span className="team-points">{time.pontuacao} pts</span>
                  <span className="team-wins">{time.partidasGanhas}</span>
                  <span className="team-losses">{time.partidasPerdidas}</span>
                  <span className={`team-status ${classificado ? 'classificado' : 'nao-classificado'}`}>
                    {classificado ? 'Classificado' : 'Não Classificado'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quadro lateral do meu time */}
        {meuTime && (
          <div className="rank-box">
            {rankImage && <img src={rankImage} alt={`Rank ${meuTime.rank}`} className="rank-icon" />}
            <span className="rank-label">Rank: {meuTime.rank}</span>

            <div className="rank-progress-container">
              <div className="rank-progress-bar">
                <div className="rank-progress-fill" style={{ width: `${progresso}%` }}></div>
              </div>
              {rankInfo.pontuacaoProximo ? (
                <span className="progress-text">
                  {rankInfo.pontuacaoAtual} / {rankInfo.pontuacaoProximo} PONTOS
                </span>
              ) : (
                <span className="classified-text">Classificado</span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Ranking;
