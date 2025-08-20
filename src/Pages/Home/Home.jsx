import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import ArrowBox from "../../Components/ArrowBox/ArrowBox";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import "./Home.css";

const CardBox = ({ points, players, route, title, isLobby, users }) => {
  const navigate = useNavigate();

  return (
    <div className="card-box" onClick={() => navigate(route)}>
      <div className="card-content">
        {isLobby && <p className="card-points">{points} pts</p>}
        <h3 className="card-title">{title}</h3>
        <p className="card-description">Lobbies a cada 30 minutos. Participe!</p>
        <div className="card-info">
          <span>👥 {players}/10</span>
        </div>

        {isLobby && (
          <>
            <div className="card-avatars">
              {users.slice(0, 5).map((userImg, idx) => (
                <img
                  key={idx}
                  src={userImg}
                  alt={`Usuário ${idx + 1}`}
                  className="avatar-img"
                />
              ))}
              {users.length > 5 && (
                <span className="extra-count">+{users.length - 5}</span>
              )}
            </div>
            <div className="card-present-count">
              {players} {players === 1 ? "pessoa presente" : "pessoas presentes"}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const lobbysData = [
    {
      title: "Lobby 1",
      points: 52,
      players: 4,
      route: "/partida",
      users: [
        "https://randomuser.me/api/portraits/men/11.jpg",
        "https://randomuser.me/api/portraits/women/12.jpg",
        "https://randomuser.me/api/portraits/men/13.jpg",
        "https://randomuser.me/api/portraits/women/14.jpg",
      ],
    },
    {
      title: "Lobby 2",
      points: 52,
      players: 2,
      route: "/game/2",
      users: [
        "https://randomuser.me/api/portraits/men/21.jpg",
        "https://randomuser.me/api/portraits/women/22.jpg",
      ],
    },
    {
      title: "Lobby 3",
      points: 52,
      players: 7,
      route: "/game/3",
      users: [
        "https://randomuser.me/api/portraits/men/31.jpg",
        "https://randomuser.me/api/portraits/women/32.jpg",
        "https://randomuser.me/api/portraits/men/33.jpg",
        "https://randomuser.me/api/portraits/women/34.jpg",
        "https://randomuser.me/api/portraits/men/35.jpg",
        "https://randomuser.me/api/portraits/women/36.jpg",
        "https://randomuser.me/api/portraits/men/37.jpg",
      ],
    },
    {
      title: "Lobby 4",
      points: 52,
      players: 1,
      route: "/game/4",
      users: ["https://randomuser.me/api/portraits/men/41.jpg"],
    },
    {
      title: "Lobby 5",
      points: 52,
      players: 3,
      route: "/game/5",
      users: [
        "https://randomuser.me/api/portraits/men/51.jpg",
        "https://randomuser.me/api/portraits/women/52.jpg",
        "https://randomuser.me/api/portraits/men/53.jpg",
      ],
    },
  ];

  const campeonatoData = [
    { title: "Campeonato 1", players: 3, route: "/free-lobby/1" },
    { title: "Campeonato 2", players: 0, route: "/free-lobby/2" },
    { title: "Campeonato 3", players: 0, route: "/free-lobby/3" },
    { title: "Campeonato 4", players: 0, route: "/free-lobby/4" },
    { title: "Campeonato 5", players: 0, route: "/free-lobby/5" },
  ];

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />

      <div className="home-container">
        <section className="card-section">
          <h2 className="home-title">Selecione sua disputa</h2>
          <h2 className="type-title">Lobbys</h2>
          <div className="card-container">
            {lobbysData.map((card, index) => (
              <CardBox key={index} {...card} isLobby />
            ))}
            <ArrowBox link="/lobbys" />
          </div>
        </section>

        <section className="card-section">
          <h2 className="type-title">Campeonatos</h2>
          <div className="card-container">
            {campeonatoData.map((card, index) => (
              <CardBox key={index} {...card} isLobby={false} users={[]} />
            ))}
            <ArrowBox link="/campeonatos" />
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
