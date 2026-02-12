import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./Partidas.css";

import OregonImg from "/src/assets/Maps/oregon.png";
import BorderImg from "/src/assets/Maps/border.png";
import ClubHouseImg from "/src/assets/Maps/clubhouse.png";
import BankImg from "/src/assets/Maps/banco.png";
import KafeDostoyevskyImg from "/src/assets/Maps/kafeDostoyevsky.png";
import ChaletImg from "/src/assets/Maps/chalet.png";

import TheDragonsFuryLogo from "/src/assets/Test1/TDF.png";
import YnsanitLogo from "/src/assets/Test1/ynsanit.png";
import AvatarDefault from "/src/assets/avatar-default.png";

const team1 = {
  name: "The Dragons Fury",
  leader: "Player 1",
  logo: TheDragonsFuryLogo,
  players: [
    { name: "Player 1", avatar: AvatarDefault },
    { name: "Player 2", avatar: AvatarDefault },
    { name: "Player 3", avatar: AvatarDefault },
    { name: "Player 4", avatar: AvatarDefault },
    { name: "Player 5", avatar: AvatarDefault },
  ]
};

const team2 = {
  name: "Ynsanit",
  leader: "Player 6",
  logo: YnsanitLogo,
  players: [
    { name: "Player 6", avatar: AvatarDefault },
    { name: "Player 7", avatar: AvatarDefault },
    { name: "Player 8", avatar: AvatarDefault },
    { name: "Player 9", avatar: AvatarDefault },
    { name: "Player 10", avatar: AvatarDefault },
  ]
};

const loggedUser = "Player 1";

const maps = [
  { name: "Oregon", img: OregonImg },
  { name: "Clubhouse", img: ClubHouseImg },
  { name: "Banco", img: BankImg },
  { name: "Chalet", img: ChaletImg },
  { name: "Kafe Dostoyevsky", img: KafeDostoyevskyImg },
  { name: "Fronteira", img: BorderImg },
];

const Partidas = () => {
  const navigate = useNavigate();

  const [confirmedPlayers, setConfirmedPlayers] = useState([loggedUser]);
  const [banPhase, setBanPhase] = useState(false);
  const [bannedMaps, setBannedMaps] = useState([]);
  const [countdown, setCountdown] = useState(20); // 5 minutos
  const [currentTurn, setCurrentTurn] = useState(team1.name);

  const [team1Ready, setTeam1Ready] = useState(false);
  const [team2Ready, setTeam2Ready] = useState(false);
  const [woTeam, setWoTeam] = useState(null);


  const allPlayers = [
    ...team1.players.map(p => p.name),
    ...team2.players.map(p => p.name)
  ];

  const userTeam =
    team1.players.find(p => p.name === loggedUser) ? team1.name : team2.name;

  useEffect(() => {
    allPlayers.forEach((player, index) => {
      if (player !== loggedUser) {
        setTimeout(() => {
          setConfirmedPlayers(prev =>
            prev.includes(player) ? prev : [...prev, player]
          );
        }, 1200 + index * 800);
      }
    });
  }, []);

  useEffect(() => {
    if (bannedMaps.length === maps.length - 1 && !woTeam && !(team1Ready && team2Ready)) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);

            if (team1Ready && !team2Ready) setWoTeam(team2.name);
            if (team2Ready && !team1Ready) setWoTeam(team1.name);

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

  const getTeamLogo = (teamName) => {
    return teamName === team1.name ? team1.logo : team2.logo;
  };

  const banMap = (map) => {
    
    if (bannedMaps.find(m => m.mapName === map.name)) return;
    if (bannedMaps.length >= maps.length - 1) return;

    setBannedMaps(prev => [...prev, { mapName: map.name, team: currentTurn }]);
    setCurrentTurn(prev => prev === team1.name ? team2.name : team1.name);
  };

  const handleStartMatch = () => {
    if (userTeam === team1.name) setTeam1Ready(true);
    if (userTeam === team2.name) setTeam2Ready(true);
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

          <TeamCard team={team1} confirmedPlayers={confirmedPlayers} />

          <div className="vs-box">VS</div>

          <TeamCard team={team2} confirmedPlayers={confirmedPlayers} />

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
                          src={getTeamLogo(bannedInfo.team)}
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

                    <p>{team1Ready ? "✅ The Dragons Fury confirmou" : "⏳ The Dragons Fury aguardando"}</p>
                    <p>{team2Ready ? "✅ Ynsanit confirmou" : "⏳ Ynsanit aguardando"}</p>
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

const TeamCard = ({ team, confirmedPlayers }) => {
  return (
    <div className="team-card horizontal">

      <div className="team-header">
        <img src={team.logo} className="team-logo" />
        <span>{team.name}</span>
      </div>

      {team.players.map((player, i) => (
        <div key={i} className="player-row">

          <div className="player-left">
            <img src={player.avatar} className="player-avatar" />
            <span>{player.name}</span>
          </div>

          {confirmedPlayers.includes(player.name) ? (
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
