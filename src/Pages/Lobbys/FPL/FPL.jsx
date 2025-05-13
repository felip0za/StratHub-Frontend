import React, { useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false); // estado do popup

  const handleClickVoltar = () => {
    navigate("/home");
  };

  const handleClickCriar = () => {
    setShowPopup(true);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const lobbies = [
    { title: "receba", points: 52, players: 0, price: 7, route: "/partida/1" },
    { title: "Lounge #2", points: 47, players: 3, price: 7, route: "/partida/2" },
    { title: "Lounge #3", points: 60, players: 2, price: 7, route: "/partida/3" },
    { title: "Lounge #4", points: 50, players: 0, price: 7, route: "/partida/4" },
    { title: "Lounge #5", points: 55, players: 1, price: 7, route: "/partida/5" },
  ];

  const filteredLobbies = lobbies.filter((lobby) =>
    lobby.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="fpl-container">
        <h2 className="fpl-titulo">LOBBIES FPL DISPONÍVEIS</h2>

        <div className="search-bar-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Buscar Lobbies..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="fpl-lobby-grid">
          {filteredLobbies.map((lobby, index) => (
            <FPLCard key={index} {...lobby} />
          ))}
        </div>

        <button className="voltar" onClick={handleClickVoltar}>
          ⬅ Voltar
        </button>

        <button className="fpl-criar" onClick={handleClickCriar}>
          Criar FPL
        </button>

        {/* Popup de confirmação */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-box">
              <h3>Confirmação</h3>
              <p>Você deseja criar um novo lobby FPL?</p>
              <div className="popup-buttons">
                <button onClick={() => navigate("/criarLobby")}>Sim</button>
                <button onClick={() => setShowPopup(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FPL;
  