import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import adicionado
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

import './EliteCup.css';

function EliteCup() {
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rankSelecionado, setRankSelecionado] = useState('');
  const [meuTime, setMeuTime] = useState(null);

  const api = useApi();
  const navigate = useNavigate(); // ✅ hook adicionado

  const handleClickTeam = (timeId) => {
    navigate(`/timesprofile/${timeId}`); // ✅ redireciona para o perfil do time
  };
  
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
    let intervalo;
    let mounted = true;

    const buscarDados = async (exibirLoading = false) => {
      if (!mounted) return;

      try {
        if (exibirLoading) setLoading(true);
        setError('');

        const resUsuario = await api.get('/times/usuario');
        let usuarioTime = resUsuario.data;

        if (!usuarioTime) {
          setError('Você não possui um time.');
          setMeuTime(null);
          if (exibirLoading) setLoading(false);
          return;
        }

        if (Array.isArray(usuarioTime)) usuarioTime = usuarioTime[0];

        if (!usuarioTime?.id && !usuarioTime?.id_time) {
          setError('Você não possui time.');
          setMeuTime(null);
          setTimes([]);
          if (exibirLoading) setLoading(false);
          return;
        }

        if (!mounted) return;
        setMeuTime(usuarioTime);

        const rankUpper = (usuarioTime.rank || '').toUpperCase();
        setRankSelecionado(rankUpper);

        const resTimes = await api.get(`/times/elitecup/${rankUpper.toLowerCase()}`);
        if (!resTimes.data || !Array.isArray(resTimes.data)) {
          setError('Erro: resposta inválida para times do ranking.');
          setTimes([]);
          if (exibirLoading) setLoading(false);
          return;
        }

        const listaTimes = resTimes.data
          .map((t) => ({ ...t, ehMeuTime: t.id === usuarioTime.id }))
          .sort((a, b) => b.pontuacao - a.pontuacao);

        if (!mounted) return;
        setTimes(listaTimes);
      } catch (err) {
        if (!mounted) return;
        const mensagem =
          err.response?.data?.message ||
          err.message ||
          'Erro ao carregar o ranking.';
        setError(mensagem);
      } finally {
        if (mounted && exibirLoading) setLoading(false);
      }
    };

    buscarDados(true);

    intervalo = setInterval(() => {
      buscarDados(false);
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalo);
    };
  }, [api]);

  useEffect(() => {
    if (meuTime) {
      const meuTimeCard = document.querySelector('.meu-time');
      if (meuTimeCard) {
        meuTimeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [meuTime, times]);

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
        <div className="ranking-container">
          <h1 className="ranking-title">ELITE CUP - {rankSelecionado}</h1>
          <div className="ranking-header">
            <span>Posição</span>
            <span>Logo</span>
            <span>Time</span>
            <span>Pontos</span>
            <span>Vitórias</span>
            <span>Derrotas</span>
            <span>Status</span>
          </div>
          <div className="ranking-list">
            {times.map((time, index) => {
              const classificado = time.pontuacao >= 800;
              const imagemTime = time.imagemBase64
                ? `data:image/*;base64,${time.imagemBase64}`
                : "/default-team.png";

              return (
                <div
                  key={time.id}
                  className={`ranking-card ${time.ehMeuTime ? 'meu-time' : ''}`}
                  onClick={() => handleClickTeam(time.id)} // ✅ clique redireciona para perfil do time
                  style={{ cursor: 'pointer' }} // ✅ visual de clique
                >
                  <span className="rank-position">#{index + 1}</span>
                  <span className="rank-logo">
                    <img src={imagemTime} alt={time.nome} className="team-logo" />
                  </span>
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

export default EliteCup;
