import React, { useEffect, useState } from "react";
import "./Campeonatos.css";
import Navbar from "../../Components/Navbar/Navbar";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";

function Campeonatos() {
  const [campeonatos, setCampeonatos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const dadosFalsos = [
        {
          nome: "1v1 ($25 buy-in)",
          horario: "AMANHÃ, 04:00",
          organizador: "Clan Battles",
          regiao: "América do Norte",
          modo: "1v1",
          slots: 8,
          status: "Aberto",
          imagem:
            "https://images.unsplash.com/photo-1607083205177-5221c0da3cf4?q=80&w=800",
        },
        {
          nome: "Copa do Brasil",
          horario: "HOJE, 20:00",
          organizador: "Esports BR",
          regiao: "Brasil",
          modo: "5v5",
          slots: 16,
          status: "Fechado",
          imagem:
            "https://images.unsplash.com/photo-1600132806004-42b9b5c4a0a7?q=80&w=800",
        },
        {
          nome: "Liga dos Campeões",
          horario: "AMANHÃ, 18:00",
          organizador: "Global Esports",
          regiao: "Europa",
          modo: "5v5",
          slots: 32,
          status: "Aberto",
          imagem:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800",
        },
      ];
      setCampeonatos(dadosFalsos);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const campeonatosFiltrados = campeonatos.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <div className="campeonatos-page">
        <div className="campeonatos-header">
          <h1>🏆 Campeonatos</h1>
          <div className="header-buttons">
            <button className="btn-criar">+ Criar Campeonato</button>
            <button className="btn-meus">Meus Campeonatos</button>
          </div>
        </div>

        <div className="campeonatos-container">
          <input
            type="text"
            placeholder="🔎 Buscar campeonatos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="campo-pesquisa"
          />

          <div className="campeonatos-grid">
            {campeonatosFiltrados.map((c, idx) => (
              <div key={idx} className="card">
                <div className="card-img">
                  <img src={c.imagem} alt={c.nome} />
                  <span
                    className={`status ${
                      c.status === "Aberto" ? "aberto" : "fechado"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="card-body">
                  <h2>{c.nome}</h2>
                  <p className="horario">{c.horario}</p>
                  <p className="detalhes">
                    {c.regiao} • {c.modo} • {c.slots} slots
                  </p>
                  <p className="organizador">
                    Organizado por <strong>{c.organizador}</strong>
                  </p>
                  {c.status === "Aberto" ? (
                    <button className="btn-entrar">Participar</button>
                  ) : (
                    <button className="btn-fechado" disabled>
                      Fechado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Campeonatos;
