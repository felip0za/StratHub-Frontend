import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./Home.css";

// Componente para o card
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

// Componente Home
function Home() {
  const FPLData = [
    { title: "receba", points: 52, players: 4, price: 7, route: "/partida" },
    { title: "receba", points: 52, players: 0, price: 7, route: "/game/2" },
    { title: "receba", points: 52, players: 0, price: 7, route: "/game/3" },
    { title: "receba", points: 52, players: 0, price: 7, route: "/game/3" },
    { title: "receba", points: 52, players: 0, price: 7, route: "/game/3" },
    { title: "receba", points: 52, players: 0, price: 7, route: "/game/3" },
  ];

  const campeonatoData = [
    { title: "receba", points: 20, players: 3, price: 0, route: "/free-lobby/1" },
    { title: "receba", points: 30, players: 0, price: 0, route: "/free-lobby/2" },
    { title: "receba", points: 50, players: 0, price: 0, route: "/free-lobby/3" },
    { title: "receba", points: 40, players: 0, price: 0, route: "/free-lobby/4" },
    { title: "receba", points: 60, players: 0, price: 0, route: "/free-lobby/5" },
    { title: "receba", points: 60, players: 0, price: 0, route: "/free-lobby/5" },
  ];

  // Função para rolar até a seção de lobbys
  const handleScrollToLobbys = () => {
    document.getElementById("free-lobby-section").scrollIntoView({ behavior: "smooth" });
  };

  // Modificar a lógica para substituir um card em campeonatos 
  const modifiedCampeonatoData = campeonatoData.length > 4
    ? campeonatoData.slice(0, 5).concat({
        route: "/campeonatos",
        title: "ENTRAR NOS LOBBYS",
      })
    : campeonatoData;

    // Modificar a lógica para substituir um card em FPL
    const modifiedFPLData = FPLData.length > 4
    ? campeonatoData.slice(0, 5).concat({
        route: "/FPL",
        title: "ENTRAR NOS LOBBYS",
      })
    : FPLData;

  return (
    <>
      <Navbar />
      <div className="home-container">
        {/* Seção de Disputas */}
        <h2 className="home-title">SELECIONE SUA DISPUTA</h2>
        <h2 className="type-title">FPL</h2>
        <div className="card-container">
          {modifiedFPLData.map((card, index) => (
            <CardBox key={index} {...card} />
          ))}
        </div>

        {/* Seção de Campeonatos */}
        <h2 className="home-title">CAMPEONATOS</h2>
        <div className="card-container">
          {modifiedCampeonatoData.map((card, index) => (
            <CardBox key={index} {...card} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
