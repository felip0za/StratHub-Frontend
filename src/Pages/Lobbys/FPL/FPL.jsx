import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import "./FPL.css";

const FPLCard = ({ title, points, players, price, route }) => {
  const navigate = useNavigate();

  return (
    <div className="fpl-lobby-card" onClick={() => navigate(route)}>
      <div className="fpl-lobby-title">{points}pts</div>
      <div className="fpl-lobby-name">{title}</div>
      <div className="fpl-lobby-subtext">
        LOBBIES DE 30 EM 30 MINUTOS, GARANTA SUA VAGA!
      </div>
      <div className="fpl-lobby-footer">
        <div>
          <span className="icon">👥</span>
          <span>{players}/10</span>
          <span>Players</span>
        </div>
        <div>
          <span className="icon">💎</span>
          <span>100</span>
          <span>Ganho</span>
        </div>
        <div>
          <span className="icon">💸</span>
          <span>{price}R$</span>
          <span>Entrada</span>
        </div>
      </div>
    </div>
  );
};

function FPL() {
  const navigate = useNavigate();

  const handleClickVoltar = () => {
    navigate("/home");
  };

  const lobbies = [
    { title: "receba", points: 52, players: 0, price: 7, route: "/partida/1" },
    { title: "Lounge #2", points: 47, players: 3, price: 7, route: "/partida/2" },
    { title: "Lounge #3", points: 60, players: 2, price: 7, route: "/partida/3" },
    { title: "Lounge #4", points: 50, players: 0, price: 7, route: "/partida/4" },
    { title: "Lounge #5", points: 55, players: 1, price: 7, route: "/partida/5" },
  ];

  return (
    <>
      <Navbar />
      <div className="fpl-container">
        <h2 className="fpl-titulo">LOBBIES FPL DISPONÍVEIS</h2>

        {/* Search bar removida */}

        <div className="fpl-lobby-grid">
          {lobbies.map((lobby, index) => (
            <FPLCard key={index} {...lobby} />
          ))}
        </div>

        <button className="voltar" onClick={handleClickVoltar}>
          ⬅ Voltar
        </button>
      </div>
    </>
  );
}

export default FPL;
