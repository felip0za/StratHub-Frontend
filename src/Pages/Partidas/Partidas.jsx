import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import { useApi } from "../../Services/API";
import { useAuth } from "../../contexts/AuthContext";
import "./Partidas.css";

import OregonImg           from "../../assets/Maps/Oregon.png";
import BorderImg           from "../../assets/Maps/border.png";
import ClubHouseImg        from "../../assets/Maps/clubhouse.png";
import BankImg             from "../../assets/Maps/banco.png";
import KafeDostoyevskyImg  from "../../assets/Maps/kafeDostoyevsky.png";
import ChaletImg           from "../../assets/Maps/chalet.png";
import ConsulateImg        from "../../assets/Maps/Consulado.png";
import LairImg             from "../../assets/Maps/covil.png";
import NighthavenLabsImg   from "../../assets/Maps/LaboratorioNighthaven.png";
import AvatarDefault       from "../../assets/avatar-default.png";

const MAP_CONFIG = {
  BANCO:                  { label: "Banco",            img: BankImg },
  OREGON:                 { label: "Oregon",           img: OregonImg },
  FRONTEIRA:              { label: "Fronteira",        img: BorderImg },
  CHALET:                 { label: "Chalet",           img: ChaletImg },
  CLUBHOUSE:              { label: "Clubhouse",        img: ClubHouseImg },
  CONSULADO:              { label: "Consulado",        img: ConsulateImg },
  KAFE:                   { label: "Kafe Dostoyevsky", img: KafeDostoyevskyImg },
  COVIL:                  { label: "Covil",            img: LairImg },
  LABORATORIO_NIGHTHAVEN: { label: "Lab Nighthaven",   img: NighthavenLabsImg },
};

const STATUS_LABEL = {
  ESPERANDO_O_HORARIO:    { texto: "Aguardando horário",     classe: "status-esperando" },
  AGUARDANDO_CONFIRMACAO: { texto: "Aguardando confirmação", classe: "status-aguardando" },
  FASE_DE_BANIMENTO:      { texto: "Fase de banimento",      classe: "status-banimento" },
  EM_ANDAMENTO:           { texto: "Em andamento",           classe: "status-em_andamento" },
  FINALIZADO:             { texto: "Finalizado",             classe: "status-finalizado" },
  WO:                     { texto: "W.O.",                   classe: "status-wo" },
};

const STATUSES_ATIVOS = ["FASE_DE_BANIMENTO", "EM_ANDAMENTO", "FINALIZADO", "WO"];

const Partidas = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const api      = useApi();
  const { user } = useAuth();

  const [loading, setLoading]                   = useState(true);
  const [team1, setTeam1]                       = useState(null);
  const [team2, setTeam2]                       = useState(null);
  const [confirmedIds, setConfirmedIds]         = useState([]);
  const [myConfirmLoading, setMyConfirmLoading] = useState(false);
  const [partidaInfo, setPartidaInfo]           = useState(null);

  const [mapasState, setMapasState] = useState(null);
  const [banPhase, setBanPhase]     = useState(false);
  const [banLoading, setBanLoading] = useState(false);

  const banPhaseRef = useRef(false);
  useEffect(() => {
    banPhaseRef.current = banPhase;
  }, [banPhase]);

  // ── Carrega estado dos mapas ─────────────────────────────────────────────
  const carregarMapas = async () => {
    try {
      const res = await api.get(`/partidas/${id}/mapas`);
      setMapasState(res.data);
    } catch {
      // Mapas ainda nao iniciados
    }
  };

  // ── Carrega partida + confirmacoes ──────────────────────────────────────
  const carregarDados = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);

      const [partidaRes, confirmacoesRes] = await Promise.all([
        api.get(`/partidas/${id}/detalhe`),
        api.get(`/partidas/${id}/confirmacoes`),
      ]);

      const { time1, time2 } = partidaRes.data;
      if (!time1 || !time2) return;

      setTeam1(time1);
      setTeam2(time2);
      setPartidaInfo(partidaRes.data);
      setConfirmedIds(confirmacoesRes.data.map(c => c.idMembro));

      const status = partidaRes.data.statusPartida;
      if (STATUSES_ATIVOS.includes(status)) {
        setBanPhase(true);
        // Garante que mapas sejam carregados imediatamente
        // (resolve tela em branco para espectadores e reentradas)
        if (!banPhaseRef.current) await carregarMapas();
      }
    } catch (err) {
      console.error("Erro ao carregar dados da partida:", err);
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  // ── Polling principal ────────────────────────────────────────────────────
  useEffect(() => {
    let ativo = true;

    carregarDados(true);

    const intervalo = setInterval(() => {
      if (!ativo) return;
      carregarDados(false);
      if (banPhaseRef.current) carregarMapas();
    }, 1000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Inicia ban phase quando todos confirmaram ───────────────────────────
  const allPlayers = team1 && team2 ? [...team1.membros, ...team2.membros] : [];

  useEffect(() => {
    if (allPlayers.length === 0) return;
    if (confirmedIds.length < allPlayers.length) return;
    if (banPhase) return;

    api.post(`/partidas/${id}/mapas/iniciar`)
      .then(res => {
        setMapasState(res.data);
        setBanPhase(true);
      })
      .catch(err => console.error("Erro ao iniciar mapas:", err));
  }, [confirmedIds, allPlayers.length]);

  // ── Loading inicial ──────────────────────────────────────────────────────
  if (loading || !team1 || !team2) {
    return (
      <>
        <Navbar />
        <p style={{ textAlign: "center" }}>Carregando partida...</p>
      </>
    );
  }

  // ── Derived state ────────────────────────────────────────────────────────
  const isParticipant =
    team1.membros.some(p => p.id === user?.id) ||
    team2.membros.some(p => p.id === user?.id);

  const isTime1     = team1.membros.some(p => p.id === user?.id);
  const userTeam    = isTime1 ? team1.nome : team2.nome;
  const myConfirmed = confirmedIds.includes(user?.id);

  const status              = partidaInfo?.statusPartida;
  const mapaDecisivoDefined = mapasState?.mapaDecisivo != null;
  const partidaEncerrada    = status === "FINALIZADO" || status === "WO";

  const scoreTime1 = partidaInfo?.scoreTime1 ?? 0;
  const scoreTime2 = partidaInfo?.scoreTime2 ?? 0;

  // Overtime: ambos chegaram a 6 pontos
  const isOvertime = scoreTime1 >= 6 && scoreTime2 >= 6;

  // Vitória por overtime: alguém chegou a 8
  const isOvertimeVictory =
    partidaEncerrada && (scoreTime1 === 8 || scoreTime2 === 8);

  const totalMapas  = 9;
  const poolSize    = mapasState?.mapas?.length ?? totalMapas;
  const bansFeitos  = totalMapas - poolSize;
  const vezDoTime1  = bansFeitos % 2 === 0;
  const currentTurn = vezDoTime1 ? team1.nome : team2.nome;
  const isMyTurn    = isParticipant && currentTurn === userTeam;

  const getTeamLogo = (team) =>
    team?.imagemBase64
      ? `data:image/*;base64,${team.imagemBase64}`
      : AvatarDefault;

  // ── Confirmar presenca ───────────────────────────────────────────────────
  const handleConfirmarPresenca = async () => {
    if (!isParticipant || myConfirmed || myConfirmLoading) return;
    setMyConfirmLoading(true);
    try {
      await api.post(`/partidas/${id}/confirmar/${user.id}`);
      setConfirmedIds(prev => [...prev, user.id]);
    } catch (err) {
      console.error("Erro ao confirmar presenca:", err);
    } finally {
      setMyConfirmLoading(false);
    }
  };

  // ── Banear mapa ──────────────────────────────────────────────────────────
  const handleBanMap = async (mapaEnum) => {
    if (!isMyTurn || banLoading || mapaDecisivoDefined) return;

    setBanLoading(true);
    try {
      const res = await api.post(
        `/partidas/${id}/mapas/banear/${user.id}`,
        { mapa: mapaEnum }
      );
      setMapasState(res.data);
    } catch (err) {
      console.error("Erro ao banear mapa:", err);
    } finally {
      setBanLoading(false);
    }
  };

  const poolAtual = mapasState?.mapas ?? [];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="match-container">

        <button className="match-back-button" onClick={() => navigate(-1)}>
          Voltar
        </button>

        <h2 className="match-title">Partida</h2>

        {/* Badge de status */}
        {status && STATUS_LABEL[status] && (
          <div className={`match-status ${STATUS_LABEL[status].classe}`}>
            {STATUS_LABEL[status].texto}
            {isOvertime && status === "EM_ANDAMENTO" && (
              <span className="overtime-badge"> — OVERTIME</span>
            )}
          </div>
        )}

        {!isParticipant && (
          <p className="spectator-notice">Voce esta assistindo esta partida</p>
        )}

        <div className="teams-row">
          <TeamCard team={team1} confirmedIds={confirmedIds} getTeamLogo={getTeamLogo} />

          {/* Placar — visível a partir de EM_ANDAMENTO */}
          {["EM_ANDAMENTO", "FINALIZADO", "WO"].includes(status) ? (
            <div className={`scoreboard ${isOvertime ? "overtime" : ""}`}>
              {isOvertime && (
                <div className="overtime-label">OVERTIME</div>
              )}
              <div className="score-row">
                <div className="score-team">
                  <img src={getTeamLogo(team1)} alt={team1.nome} />
                  <span>{team1.nome}</span>
                  <strong className={scoreTime1 > scoreTime2 && partidaEncerrada ? "score-winner" : ""}>
                    {scoreTime1}
                  </strong>
                </div>
                <div className="score-vs">X</div>
                <div className="score-team">
                  <strong className={scoreTime2 > scoreTime1 && partidaEncerrada ? "score-winner" : ""}>
                    {scoreTime2}
                  </strong>
                  <span>{team2.nome}</span>
                  <img src={getTeamLogo(team2)} alt={team2.nome} />
                </div>
              </div>
            </div>
          ) : (
            <div className="vs-box">VS</div>
          )}

          <TeamCard team={team2} confirmedIds={confirmedIds} getTeamLogo={getTeamLogo} />
        </div>

        {/* Vencedor */}
        {partidaEncerrada && partidaInfo?.idTimeVencedor && (
          <h2 className="winner-text">
            🏆 {partidaInfo.idTimeVencedor === team1.id ? team1.nome : team2.nome} venceu!
            {isOvertimeVictory && " (Overtime)"}
            {status === "WO" && " (W.O.)"}
          </h2>
        )}

        {/* ── Fase de confirmacao de presenca ─────────────────────────── */}
        {!banPhase && (
          <div className="status-box">
            {status === "ESPERANDO_O_HORARIO" ? (
              <h2>A partida ainda nao abriu confirmacao</h2>
            ) : (
              <>
                <h2>Aguardando confirmacao dos jogadores...</h2>
                <p>{confirmedIds.length} / {allPlayers.length} confirmados</p>

                {isParticipant && !myConfirmed && (
                  <button
                    className="confirm-presence-btn"
                    onClick={handleConfirmarPresenca}
                    disabled={myConfirmLoading}
                  >
                    {myConfirmLoading ? "Confirmando..." : "Confirmar Presenca"}
                  </button>
                )}

                {isParticipant && myConfirmed && (
                  <p className="confirmed">Presenca confirmada</p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Fase de banimento de mapas ──────────────────────────────── */}
        {banPhase && mapasState && (
          <div className="ban-section">
            <h2>Banimento de Mapas</h2>

            {!mapaDecisivoDefined && (
              <p className="turn-info">
                {!isParticipant
                  ? `${currentTurn} esta escolhendo...`
                  : isMyTurn
                    ? `Sua vez de banir (${currentTurn})`
                    : `Aguarde - ${currentTurn} esta banindo...`}
              </p>
            )}

            <div className="maps-grid">
              {Object.entries(MAP_CONFIG).map(([enumKey, { label, img }]) => {
                const isBanned   = !poolAtual.includes(enumKey);
                const isDecisive = mapasState.mapaDecisivo === enumKey;
                const clickable  = isMyTurn && !isBanned && !mapaDecisivoDefined && !banLoading;

                return (
                  <div
                    key={enumKey}
                    className={`map-card ${isBanned && !isDecisive ? "banned" : ""} ${isDecisive ? "decisive" : ""} ${clickable ? "clickable" : "locked"}`}
                    onClick={() => clickable && handleBanMap(enumKey)}
                  >
                    <img src={img} alt={label} />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>

            {/* ── Mapa decisivo ── */}
            {mapaDecisivoDefined && (
              <div className="final-map">
                <h2>Mapa Definido</h2>
                {MAP_CONFIG[mapasState.mapaDecisivo] && (
                  <>
                    <img
                      src={MAP_CONFIG[mapasState.mapaDecisivo].img}
                      alt={MAP_CONFIG[mapasState.mapaDecisivo].label}
                    />
                    <h3>{MAP_CONFIG[mapasState.mapaDecisivo].label}</h3>
                  </>
                )}

                {status === "EM_ANDAMENTO" && <h2>Partida em andamento!</h2>}
                {status === "FINALIZADO"   && <h2>Partida finalizada!</h2>}
                {status === "WO"           && <h2 className="wo-text">Partida encerrada por W.O.</h2>}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const TeamCard = ({ team, confirmedIds, getTeamLogo }) => (
  <div className="team-card horizontal">
    <div className="team-header">
      <img src={getTeamLogo(team)} className="team-logo" alt={team.nome} />
      <span>{team.nome}</span>
    </div>

    {team.membros.map((player, i) => (
      <div key={i} className="player-row">
        <div className="player-left">
          <img
            src={
              player.imagemUsuario
                ? `data:image/*;base64,${player.imagemUsuario}`
                : AvatarDefault
            }
            className="player-avatar"
            alt={player.nome}
          />
          <span>{player.nome}</span>
        </div>

        {confirmedIds.includes(player.id) ? (
          <span className="confirmed">Confirmado</span>
        ) : (
          <span className="waiting">Aguardando</span>
        )}
      </div>
    ))}
  </div>
);

export default Partidas;