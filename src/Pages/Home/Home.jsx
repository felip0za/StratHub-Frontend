import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import ArrowBox from "../../Components/ArrowBox/ArrowBox";
import "./Home.css";

const CardBox = ({ points, players, price, route, title }) => {
  const navigate = useNavigate();

  return (
    <div className="card-box" onClick={() => navigate(route)}>
      <div className="card-content">
        <p className="card-points">{points}pts</p>
        <h3 className="card-title">{title}</h3>
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
  const FPLData = [
    { title: "receba", points: 52, players: 4, price: 7, route: "/partida" },
    { title: "receba", points: 52, players: 0, price: 7, route: "/game/2" },
    { title: "receba", points: 52, players: 0, price: 7, route: "/game/3" },
    { title: "receba", points: 52, players: 0, price: 7, route: "/game/4" },
    { title: "receba", points: 52, players: 0, price: 7, route: "/game/5" },
  ];

  const campeonatoData = [
    { title: "receba", points: 20, players: 3, price: 0, route: "/free-lobby/1" },
    { title: "receba", points: 30, players: 0, price: 0, route: "/free-lobby/2" },
    { title: "receba", points: 50, players: 0, price: 0, route: "/free-lobby/3" },
    { title: "receba", points: 40, players: 0, price: 0, route: "/free-lobby/4" },
    { title: "receba", points: 60, players: 0, price: 0, route: "/free-lobby/5" },
  ];

  return (
    <>
      <Navbar />
      <div className="home-container">
        <h2 className="home-title">SELECIONE SUA DISPUTA</h2>

        <h2 className="type-title">FPL</h2>
        <div className="card-container">
          {FPLData.map((card, index) => (
            <CardBox key={index} {...card} />
          ))}
          <ArrowBox link="/FPL" />
        </div>

        <h2 className="home-title">CAMPEONATOS</h2>
        <div className="card-container">
          {campeonatoData.map((card, index) => (
            <CardBox key={index} {...card} />
          ))}
          <ArrowBox link="/campeonatos" />
        </div>
      </div>
    </>
  );
}

export default Home;
