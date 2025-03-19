import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./Home.css";

const CardBox = ({ time, points, players, price, route }) => {
  const navigate = useNavigate();

  return (
    <div className="card-box" onClick={() => navigate(route)}>
      <span className="card-time">Hoje - {time}</span>
      <div className="card-content">
        <p className="card-points">{points}pts</p>
        <h3 className="card-title">DISPUTAS ⚡</h3>
        <p className="card-description">
          LOBBIES DE 30 EM 30 MINUTOS, GARANTA SUA VAGA!
        </p>
        <div className="card-info">
          <span>👥 {players}/10 Players</span>
          <span>💎 100 Ganho</span>
          <span>💸 {price}R$ Entrada</span>
        </div>
      </div>
    </div>
  );
};

function Home() {
  const cardData = [
    { time: "Em 9min", points: 52, players: 4, price: 7, route: "/game/1" },
    { time: "Em 44min", points: 52, players: 0, price: 7, route: "/game/2" },
    { time: "13h45", points: 52, players: 0, price: 7, route: "/game/3" },
    { time: "14h20", points: 52, players: 0, price: 7, route: "/game/4" },
    { time: "14h20", points: 52, players: 0, price: 7, route: "/game/4" },
  ];

  return (
    <>
      <Navbar />
      <div className="home-container">
        <h2 className="home-title">SELECIONE SUA DISPUTA</h2>
        <div className="card-container">
          {cardData.map((card, index) => (
            <CardBox key={index} {...card} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
