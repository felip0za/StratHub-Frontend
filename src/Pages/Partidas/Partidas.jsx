import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import { useApi } from "../../Services/API";
import { useAuth } from "../../contexts/AuthContext";
import "./Partidas.css";

import OregonImg from "../../assets/Maps/oregon.png";
import BorderImg from "../../assets/Maps/border.png";
import ClubHouseImg from "../../assets/Maps/clubhouse.png";
import BankImg from "../../assets/Maps/banco.png";
import KafeDostoyevskyImg from "../../assets/Maps/kafeDostoyevsky.png";
import ChaletImg from "../../assets/Maps/chalet.png";
import ConsulateImg from "../../assets/Maps/Consulado.png";
import LairImg from "../../assets/Maps/covil.png";
import NighthavenLabsImg from "../../assets/Maps/LaboratorioNighthaven.png";

import AvatarDefault from "../../assets/avatar-default.png";

const maps = [
  { name: "Oregon", img: OregonImg },
  { name: "Clubhouse", img: ClubHouseImg },
  { name: "Banco", img: BankImg },
  { name: "Chalet", img: ChaletImg },
  { name: "Kafe Dostoyevsky", img: KafeDostoyevskyImg },
  { name: "Fronteira", img: BorderImg },
  { name: "Consulado", img: ConsulateImg },
  { name: "Covil", img: LairImg },
  { name: "Lab Nighthaven", img: NighthavenLabsImg },
];

const Partidas = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const api = useApi();
  const { user } = useAuth();

  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);

  const [confirmedPlayers, setConfirmedPlayers] = useState([]);
  const [banPhase, setBanPhase] = useState(false);
  const [bannedMaps, setBannedMaps] = useState([]);
  const [countdown, setCountdown] = useState(20);
  const [currentTurn, setCurrentTurn] = useState("");

  const [team1Ready, setTeam1Ready] = useState(false);
  const [team2Ready, setTeam2Ready] = useState(false);
  const [woTeam, setWoTeam] = useState(null);

  useEffect(() => {
    api.get(`/partidas/${id}`)
      .then(res => {
        setTeam1(res.data.time1);
        setTeam2(res.data.time2);
        setCurrentTurn(res.data.time1.nome);
      })
      .catch(err => console.error("Erro ao buscar partida:", err));
  }, [id]);

  if (!team1 || !team2) {
    return (
      <>
        <Navbar />
        <p style={{ textAlign: "center" }}>Carregando partida...</p>
      </>
    );
  }

  const allPlayers = [
    ...team1.membros.map(p => p.nome),
    ...team2.membros.map(p => p.nome)
  ];

  const userTeam =
    team1.membros.some(p => p.id === user.id) ? team1.nome : team2.nome;

  useEffect(() => {
    allPlayers.forEach((player, index) => {
      setTimeout(() => {
        setConfirmedPlayers(prev =>
          prev.includes(player) ? prev : [...prev, player]
        );
      }, 1200 + index * 800);
    });
  }, [team1, team2]);

  useEffect(() => {
    if (bannedMaps.length === maps.length - 1 && !woTeam && !(team1Ready && team2Ready)) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);

            if (team1Ready && !team2Ready) setWoTeam(team2.nome);
            if (team2Ready && !team1Ready) setWoTeam(team1.nome);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [team1Ready, team2Ready, bannedMaps]);

  useEffect(() => {
    if (confirmedPlayers.length === allPlayers.length) {
      setBanPhase(true);
    }
  }, [confirmedPlayers]);

  const getTeamLogo = (team) => {
    return team.imagemBase64
      ? `data:image/*;base64,${team.imagemBase64}`
      : AvatarDefault;
  };

  const banMap = (map) => {
    if (bannedMaps.find(m => m.mapName === map.name)) return;
    if (bannedMaps.length >= maps.length - 1) return;

    setBannedMaps(prev => [...prev, { mapName: map.name, team: currentTurn }]);
    setCurrentTurn(prev => prev === team1.nome ? team2.nome : team1.nome);
  };

  const handleStartMatch = () => {
    if (userTeam === team1.nome) setTeam1Ready(true);
    if (userTeam === team2.nome) setTeam2Ready(true);
  };

  const finalMap = maps.find(
    m => !bannedMaps.find(b => b.mapName === m.name)
  );

  return (
    <>
      <Navbar />
      <div className="match-container">

        <button className="match-back-button" onClick={() => navigate(-1)}>
          Voltar
        </button>

        <h2 className="match-title">Partida</h2>

        <div className="teams-row">

          <TeamCard team={team1} confirmedPlayers={confirmedPlayers} getTeamLogo={getTeamLogo} />

          <div className="vs-box">VS</div>

          <TeamCard team={team2} confirmedPlayers={confirmedPlayers} getTeamLogo={getTeamLogo} />

        </div>

        {!banPhase && (
          <div className="status-box">
            <h2>Aguardando confirmação dos jogadores...</h2>
            <p>{confirmedPlayers.length} / {allPlayers.length}</p>
          </div>
        )}

        {banPhase && (
          <div className="ban-section">
            <h2>Banimento de Mapas</h2>

            <p className={`turn-info ${bannedMaps.length === maps.length - 1 ? "map-defined" : ""}`}>
              {bannedMaps.length === maps.length - 1
                ? "Mapa Definido"
                : currentTurn === userTeam
                  ? `Sua vez de banir (${currentTurn})`
                  : `⏳ Espere o time ${currentTurn} está banindo, aguarde um momento...`}
            </p>

            <div className="maps-grid">
              {maps.map(map => {
                const bannedInfo = bannedMaps.find(b => b.mapName === map.name);

                return (
                  <div
                    key={map.name}
                    className={`map-card ${bannedInfo ? "banned" : ""}`}
                    onClick={() => banMap(map)}
                  >
                    <img src={map.img} alt={map.name} />

                    {bannedInfo && (
                      <div className="ban-overlay">
                        <img
                          src={getTeamLogo(bannedInfo.team === team1.nome ? team1 : team2)}
                          className="ban-logo"
                        />
                      </div>
                    )}

                    <span>{map.name}</span>
                  </div>
                );
              })}
            </div>

            {finalMap && bannedMaps.length === maps.length - 1 && (
              <div className="final-map">
                <h2>Mapa Definido</h2>
                <img src={finalMap.img} />
                <h3>{finalMap.name}</h3>

                {!woTeam && !(team1Ready && team2Ready) && (
                  <>
                    <p>⏳ Tempo restante: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}</p>

                    <button className="start-match" onClick={handleStartMatch}>
                      Confirmar Início ({userTeam})
                    </button>

                    <p>{team1Ready ? `✅ ${team1.nome} confirmou` : `⏳ ${team1.nome} aguardando`}</p>
                    <p>{team2Ready ? `✅ ${team2.nome} confirmou` : `⏳ ${team2.nome} aguardando`}</p>
                  </>
                )}

                {team1Ready && team2Ready && (
                  <h2>🎮 Partida iniciada!</h2>
                )}

                {woTeam && (
                  <h2 className="wo-text">❌ {woTeam} perdeu por W.O.</h2>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const TeamCard = ({ team, confirmedPlayers, getTeamLogo }) => {
  return (
    <div className="team-card horizontal">

      <div className="team-header">
        <img src={getTeamLogo(team)} className="team-logo" />
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
            />
            <span>{player.nome}</span>
          </div>

          {confirmedPlayers.includes(player.nome) ? (
            <span className="confirmed">✔ Confirmado</span>
          ) : (
            <span className="waiting">⏳ Aguardando</span>
          )}

        </div>
      ))}
    </div>
  );
};

export default Partidas;