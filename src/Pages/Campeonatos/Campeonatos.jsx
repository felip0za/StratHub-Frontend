import React, { useEffect, useState } from "react";
import "./Campeonatos.css";
import Navbar from "../../Components/Navbar/Navbar";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API"; // 🔹 importa serviço de API

function Campeonatos() {
  const [campeonatos, setCampeonatos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const api = useApi(); // 🔹 instância da API

  // Botão para criar campeonatos
  const handleClickCriarCampeonatos = (e) => {
    e.preventDefault();
    navigate("/criar-campeonatos");
  };

  // Botão para ir para "Meus Campeonatos"
  const handleClickMeusCampeonatos = (e) => {
    e.preventDefault();
    navigate("/meus-campeonatos");
  };

  // 🔹 Buscar dados da API
  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        setLoading(true);
        const response = await api.get("/campeonatos"); // GET da API
        setCampeonatos(response.data);
      } catch (error) {
        console.error("Erro ao carregar campeonatos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampeonatos();
  }, [api]);

  const campeonatosFiltrados = campeonatos.filter((c) =>
    c.descricao.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <div className="campeonatos-page">
        {/* Cabeçalho */}
        <div className="campeonatos-header">
          <h1>🏆 Campeonatos</h1>
          <div className="header-buttons">
            <button
              className="btn-criar"
              onClick={handleClickCriarCampeonatos}
            >
              + Criar Campeonato
            </button>
            <button
              className="btn-meus"
              onClick={handleClickMeusCampeonatos}
            >
              Meus Campeonatos
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="campeonatos-container">
          <input
            type="text"
            placeholder="🔎 Buscar campeonatos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="campo-pesquisa"
          />

          <div className="campeonatos-grid">
            {campeonatosFiltrados.map((c) => (
              <div key={c.id} className="card">
                {/* Imagem */}
                <div className="card-img">
                  <img
                    src={
                      c.imagemCampeonato ||
                      "https://via.placeholder.com/400x200?text=Sem+Imagem"
                    }
                    alt={c.descricao}
                  />
                  <span
                    className={`status ${
                      c.status === "Aberto" ? "aberto" : "fechado"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Conteúdo do card */}
                <div className="card-body">
                  <h2>{c.descricao}</h2>
                  <p className="detalhes">
                    Tipo: {c.tipo} • Máx. {c.maxEquipes} equipes
                  </p>
                  <p className="organizador">
                    Organizado por <strong>{c.criadorId}</strong>
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
