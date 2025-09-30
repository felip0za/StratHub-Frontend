import React, { useEffect, useState } from "react";
import "./Home.css";
import Navbar from "../../Components/Navbar/Navbar";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";

function Home() {
  const [lobbys, setLobbys] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const dadosMockados = [
        {
          id: 1,
          title: "Lobby 1",
          points: 30,
          players: 6,
          reward: 3.88,
          currency: 50,
          users: [
            "https://randomuser.me/api/portraits/men/10.jpg",
            "https://randomuser.me/api/portraits/women/20.jpg",
            "https://randomuser.me/api/portraits/men/30.jpg",
            "https://randomuser.me/api/portraits/women/40.jpg",
            "https://randomuser.me/api/portraits/men/50.jpg",
            "https://randomuser.me/api/portraits/women/60.jpg",
          ],
        },
        {
          id: 2,
          title: "Lobby 2",
          points: 40,
          players: 5,
          reward: 7.75,
          currency: 100,
          users: [
            "https://randomuser.me/api/portraits/men/11.jpg",
            "https://randomuser.me/api/portraits/women/21.jpg",
            "https://randomuser.me/api/portraits/men/31.jpg",
            "https://randomuser.me/api/portraits/women/41.jpg",
            "https://randomuser.me/api/portraits/men/51.jpg",
          ],
        },
        {
          id: 3,
          title: "Lobby 3",
          points: 30,
          players: 5,
          reward: 3.88,
          currency: 50,
          users: [
            "https://randomuser.me/api/portraits/men/12.jpg",
            "https://randomuser.me/api/portraits/women/22.jpg",
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/42.jpg",
            "https://randomuser.me/api/portraits/men/52.jpg",
          ],
        },
      ];
      setLobbys(dadosMockados);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const lobbysFiltrados = lobbys.filter((l) =>
    l.title.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <div className="home-page">
        {/* === Header da página === */}
        <div className="home-header">
          <h1>🔥 Lobbys</h1>
          <div className="header-buttons">
            <button className="btn-criar">+ Criar Lobby</button>
            <button className="btn-meus">Meus Lobbys</button>
          </div>
        </div>

        <div className="home-container">
          {/* Campo de busca */}
          <input
            type="text"
            placeholder="🔎 Buscar lobbys..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="campo-pesquisa"
          />

          {/* Lista de lobbys */}
          <div className="lobby-list">
            {lobbysFiltrados.map((lobby) => (
              <div key={lobby.id} className="lobby-card">
                {/* Header do card */}
                <div className="lobby-header">
                  <span className="lobby-name">{lobby.title}</span>
                  <span className="lobby-points">{lobby.points} pts</span>
                </div>

                {/* Avatares */}
                <div className="lobby-players">
                  {lobby.users.map((user, idx) => (
                    <img key={idx} src={user} alt={`Jogador ${idx + 1}`} />
                  ))}
                </div>

                {/* Footer do card */}
                <div className="lobby-footer">
                  <span>{lobby.players} jogadores</span>
                  <span>
                    🏆 {lobby.reward} | 💰 {lobby.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
