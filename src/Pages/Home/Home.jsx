import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./Home.css";

// Componente para o card
const CardBox = ({ time, points, players, price, route, title }) => {
  const navigate = useNavigate();

  return (
    <div className="card-box" onClick={() => navigate(route)}>
      <span className="card-time">Hoje - {time}</span>
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

// Componente Home com a seção de campeonatos e lobbys grátis
function Home() {
  const navigate = useNavigate();

  const cardData = [
    { time: "Em 9min", points: 52, players: 4, price: 7, route: "/partida" },
    { time: "Em 44min", points: 52, players: 0, price: 7, route: "/game/2" },
    { time: "13h45", points: 52, players: 0, price: 7, route: "/game/3" },
    { time: "13h45", points: 52, players: 0, price: 7, route: "/game/3" },
    { time: "13h45", points: 52, players: 0, price: 7, route: "/game/3" },
    { time: "13h45", points: 52, players: 0, price: 7, route: "/game/3" },
  ];

  const freeLobbyData = [
    { time: "Em 5min", points: 20, players: 3, price: 0, route: "/free-lobby/1" },
    { time: "Em 30min", points: 30, players: 0, price: 0, route: "/free-lobby/2" },
    { time: "12h00", points: 50, players: 0, price: 0, route: "/free-lobby/3" },
    { time: "13h00", points: 40, players: 0, price: 0, route: "/free-lobby/4" },
    { time: "14h00", points: 60, players: 0, price: 0, route: "/free-lobby/5" },
  ];

  // Função para rolar até a seção de lobbys
  const handleScrollToLobbys = () => {
    document.getElementById("free-lobby-section").scrollIntoView({ behavior: "smooth" });
  };

  // Modificar a lógica para substituir um card
  const modifiedLobbyData = freeLobbyData.length > 4
    ? freeLobbyData.slice(0, 5).concat({
        time: "Veja todos os lobbys",
        points: 0,
        players: 0,
        price: 0,
        route: "/profile",
        title: "ENTRAR NOS LOBBYS",
      })
    : freeLobbyData;

  return (
    <>
      <Navbar />
      <div className="home-container">
        <h2 className="home-title">SELECIONE SUA DISPUTA</h2>
        <h2 className="type-title">FPL</h2>
        <div className="card-container">
          {cardData.map((card, index) => (
            <CardBox key={index} {...card} />
          ))}
        </div>

        {/* Seção de Campeonatos */}
        <h2 className="home-title">CAMPEONATOS</h2>
        <div className="card-container">
          {modifiedLobbyData.map((card, index) => (
            <CardBox key={index} {...card} />
          ))}
        </div>

        {/* Se o número de lobbys gratuitos for maior que 4, adicionar seta */}
        {freeLobbyData.length > 4 && (
          <div className="scroll-button" onClick={handleScrollToLobbys}>
            <span>Veja mais →</span>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
