import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../Services/API';
import Navbar from '../../Components/Navbar/Navbar';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';

import ferro      from '../../assets/ferro.png';
import bronze     from '../../assets/bronze.png';
import prata      from '../../assets/prata.png';
import ouro       from '../../assets/ouro.png';
import platina    from '../../assets/platina.png';
import challenger from '../../assets/challenger.png';
import master     from '../../assets/master.png';

import './EliteCup.css';

const RANK_IMAGE = {
  FERRO: ferro, BRONZE: bronze, PRATA: prata, OURO: ouro,
  PLATINA: platina, CHALLENGER: challenger, MASTER: master,
};

function EliteCup() {
  const [times, setTimes]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [rankSelecionado, setRankSelecionado] = useState('');
  const [meuTime, setMeuTime]               = useState(null);

  const api      = useApi();
  const navigate = useNavigate();

  const handleClickTeam = (timeId) => navigate(`/times/${timeId}`);

  useEffect(() => {
    let intervalo;
    let mounted = true;

    const buscarDados = async (exibirLoading = false) => {
      if (!mounted) return;
      try {
        if (exibirLoading) setLoading(true);
        setError('');

        const resUsuario = await api.get('/times/usuario');
        let usuarioTime  = resUsuario.data;

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
          .map(t => ({ ...t, ehMeuTime: t.id === usuarioTime.id }))
          .sort((a, b) => b.pontuacao - a.pontuacao);

        if (!mounted) return;
        setTimes(listaTimes);
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || err.message || 'Erro ao carregar o ranking.');
      } finally {
        if (mounted && exibirLoading) setLoading(false);
      }
    };

    buscarDados(true);
    intervalo = setInterval(() => { buscarDados(false); }, 10000);
    return () => { mounted = false; clearInterval(intervalo); };
  }, [api]);

  useEffect(() => {
    if (meuTime) {
      document.querySelector('.meu-time')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [meuTime, times]);

  if (loading) return <><Navbar /><LoadingScreen /></>;

  if (error) return (
    <>
      <Navbar />
      <div className="container">
        <p className="error-message">{error}</p>
      </div>
    </>
  );

  const timePontuacao  = meuTime?.pontuacao || 0;
  const pontuacaoProximo = timePontuacao < 800 ? 800 : null;
  const progresso = pontuacaoProximo
    ? Math.min(100, (timePontuacao / pontuacaoProximo) * 100).toFixed(1)
    : 100;

  const rankImage = meuTime?.rank ? RANK_IMAGE[meuTime.rank.toUpperCase()] : null;

  return (
    <>
      <Navbar />
      <div className="ranking-wrapper">

        {/* ── Tabela ── */}
        <div className="ranking-container">
          <h1 className="ranking-title">Elite Cup — {rankSelecionado}</h1>

          <div className="ranking-header">
            <span>Pos.</span>
            <span>Logo</span>
            <span>Time</span>
            <span>Pontos</span>
            <span>V</span>
            <span>D</span>
            <span>Status</span>
          </div>

          <div className="ranking-list">
            {times.map((time, index) => {
              const classificado = time.pontuacao >= 800;
              const imagemTime   = time.imagemBase64
                ? `data:image/*;base64,${time.imagemBase64}`
                : '/default-team.png';

              return (
                <div
                  key={time.id}
                  className={`ranking-card ${time.ehMeuTime ? 'meu-time' : ''}`}
                  onClick={() => handleClickTeam(time.id)}
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

        {/* ── Rank Sidebar ── */}
        {meuTime && (
          <div className="rank-box">
            {rankImage && <img src={rankImage} alt={`Rank ${meuTime.rank}`} className="rank-icon" />}
            <span className="rank-label">Rank: {meuTime.rank}</span>

            <div className="rank-progress-container">
              <div className="rank-progress-bar">
                <div className="rank-progress-fill" style={{ width: `${progresso}%` }} />
              </div>
              {pontuacaoProximo ? (
                <span className="progress-text">{timePontuacao} / {pontuacaoProximo} pts</span>
              ) : (
                <span className="classified-text">✓ Classificado</span>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default EliteCup;