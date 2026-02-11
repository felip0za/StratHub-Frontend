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

const team1 = {
  name: "The Dragons Fury",
  leader: "Player 1",
  logo: TheDragonsFuryLogo,
  players: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"]
};

const team2 = {
  name: "Ynsanit",
  leader: "Player 6",
  logo: YnsanitLogo,
  players: ["Player 6", "Player 7", "Player 8", "Player 9", "Player 10"]
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
  const [bannedMaps, setBannedMaps] = useState([]); // {mapName, team}
  const [currentTurn, setCurrentTurn] = useState(team1.name);

  const allPlayers = [...team1.players, ...team2.players];
  const isLeader = loggedUser === team1.leader || loggedUser === team2.leader;

  const userTeam =
    team1.players.includes(loggedUser) ? team1.name : team2.name;

  const getTeamLogo = (teamName) => {
    return teamName === team1.name ? team1.logo : team2.logo;
  };

  useEffect(() => {
    allPlayers.forEach((player, index) => {
      if (player !== loggedUser) {
        setTimeout(() => {
          setConfirmedPlayers(prev =>
            prev.includes(player) ? prev : [...prev, player]
          );
        }, 2000 + index * 1500);
      }
    });
  }, []);

  useEffect(() => {
    if (confirmedPlayers.length === allPlayers.length) {
      setBanPhase(true);
    }
  }, [confirmedPlayers]);

  const banMap = (map) => {
    if (!isLeader) return;
    if (currentTurn !== userTeam) return;
    if (bannedMaps.find(m => m.mapName === map.name)) return;
    if (bannedMaps.length >= maps.length - 1) return;

    setBannedMaps(prev => [
      ...prev,
      { mapName: map.name, team: currentTurn }
    ]);

    if ((bannedMaps.length + 1) % 2 === 0) {
      setCurrentTurn(prev =>
        prev === team1.name ? team2.name : team1.name
      );
    }
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

        <h1 className="match-title">PARTIDA</h1>

        <div className="teams-box">
          <TeamCard team={team1} confirmedPlayers={confirmedPlayers} />
          <div className="vs-box">VS</div>
          <TeamCard team={team2} confirmedPlayers={confirmedPlayers} />
        </div>

        {!banPhase && (
          <div className="status-box">
            <h2>Aguardando confirmação dos jogadores...</h2>
            <p>{confirmedPlayers.length} / {allPlayers.length} confirmados</p>
          </div>
        )}

        {banPhase && (
          <div className="ban-section">
            <h2>Banimento de Mapas</h2>

            <p className="turn-info">
              {currentTurn === userTeam
                ? `Sua vez de banir (${currentTurn})`
                : `⏳ Espere o time ${currentTurn} está banindo, aguarde um momento...`}
            </p>

            <div className="maps-grid">
              {maps.map((map) => {
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
                          alt={bannedInfo.team}
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
                <img src={finalMap.img} alt={finalMap.name} />
                <h3>{finalMap.name}</h3>
                <button className="start-match">Iniciar Partida</button>
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
    <div className="team-card">
      <h2>{team.name}</h2>

      {team.players.map((player, i) => (
        <div key={i} className="player-row">
          <span>{player}</span>

          {confirmedPlayers.includes(player) ? (
            <span className="confirmed">✔ Confirmado</span>
          ) : (
            <span className="waiting">⏳ Aguardando...</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Partidas;
