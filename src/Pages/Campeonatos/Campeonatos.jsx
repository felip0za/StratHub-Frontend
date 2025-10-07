import React, { useEffect, useState } from "react";
import "./Campeonatos.css";
import Navbar from "../../Components/Navbar/Navbar";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";

function Campeonatos() {
  const [campeonatos, setCampeonatos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const api = useApi();

  const handleClickCriarCampeonatos = (e) => {
    e.preventDefault();
    navigate("/criar-campeonatos");
  };

  const handleClickMeusCampeonatos = (e) => {
    e.preventDefault();
    navigate("/meus-campeonatos");
  };

  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        setLoading(true);
        const response = await api.get("/campeonatos");
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
            <button className="btn-criar" onClick={handleClickCriarCampeonatos}>
              + Criar Campeonato
            </button>
            <button className="btn-meus" onClick={handleClickMeusCampeonatos}>
              Meus Campeonatos
            </button>
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
            {campeonatosFiltrados.map((c) => {
              // Aplicando a mesma lógica do Base64
              const imagemCampeonato = c.imagemBase64
                ? `data:image/*;base64,${c.imagemBase64}`
                : "https://via.placeholder.com/400x200?text=Sem+Imagem";

              return (
                <div key={c.id} className="card">
                  <div className="card-img">
                    <img src={imagemCampeonato} alt={c.nome} />
                    <span
                      className={`status ${
                        c.status === "ABERTO" ? "aberto" : "fechado"
                      }`}
                    >
                      {c.status === "ABERTO" ? "Aberto" : "Fechado"}
                    </span>
                  </div>

                  <div className="card-body">
                    <h2>{c.nome}</h2>
                    <p className="detalhes">
                      Tipo: {c.tipo === "GRATUITO" ? "Gratuito" : "Pago"} • Máx. {c.maxEquipes} equipes
                    </p>
                    <p className="organizador">
                      Organizado por <strong>{c.criador?.nome || "Desconhecido"}</strong>
                    </p>
                    {c.status === "ABERTO" ? (
                      <button className="btn-entrar">Participar</button>
                    ) : (
                      <button className="btn-fechado" disabled>
                        Fechado
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Campeonatos;
