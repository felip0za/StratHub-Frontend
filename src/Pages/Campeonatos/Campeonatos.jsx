import React, { useEffect, useState } from "react";
import "./Campeonatos.css";
import Navbar from "../../Components/Navbar/Navbar";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";

const Campeonatos = () => {
  const [campeonatos, setCampeonatos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const api = useApi();

  // --- Navegação ---
  const handleCriarCampeonato = () => navigate("/criar-campeonatos");
  const handleMeusCampeonatos = () => navigate("/meus-campeonatos");

  // --- Buscar campeonatos ---
  const fetchCampeonatos = async () => {
    try {
      const response = await api.get("/campeonatos");
      setCampeonatos(response.data);
      setError("");
    } catch (err) {
      console.error("Erro ao carregar campeonatos:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Atualização em tempo real (polling curto: 1s) ---
  useEffect(() => {
    fetchCampeonatos(); // primeira chamada
    const interval = setInterval(fetchCampeonatos, 1000); // atualiza a cada 1s
    return () => clearInterval(interval);
  }, [api]);

  // --- Filtragem ---
  const campeonatosFiltrados = campeonatos.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  // --- Navegar para detalhes ---
  const handleClick = (id) => navigate(`/campeonatos/${id}`);

  // --- Formata status ---
  const formatarStatus = (status) => {
    switch (status) {
      case "ABERTO": return { texto: "Aberto", classe: "aberto" };
      case "EM_ANDAMENTO": return { texto: "Em andamento", classe: "em_andamento" };
      case "FECHADO": return { texto: "Fechado", classe: "fechado" };
      default: return { texto: "-", classe: "" };
    }
  };

  // --- Imagem Base64 ---
  const getImagemCampeonato = (imagemBase64) =>
    imagemBase64 ? `data:image/png;base64,${imagemBase64}` : "https://via.placeholder.com/400x200?text=Sem+Imagem";

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <div className="campeonatos-page">
        <div className="campeonatos-header">
          <h1 className="campeonatos-title">🏆 Campeonatos</h1>
          <div className="header-buttons">
            <button className="btn-criar" onClick={handleCriarCampeonato}>
              + Criar Campeonato
            </button>
            <button className="btn-meus" onClick={handleMeusCampeonatos}>
              Meus Campeonatos
            </button>
          </div>
        </div>

        {error && <p className="campeonatos-error">{error}</p>}

        <div className="campeonatos-container">
          <input
            type="text"
            placeholder="🔎 Buscar campeonatos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="campo-pesquisa"
          />

          <div className="campeonatos-grid">
            {campeonatosFiltrados.length > 0 ? (
              campeonatosFiltrados.map((c) => {
                const status = formatarStatus(c.status);
                return (
                  <div key={c.id} className="card">
                    <div className="card-img">
                      <img src={getImagemCampeonato(c.imagemCampeonato)} alt={c.nome} />
                      <span className={`status ${status.classe}`}>{status.texto}</span>
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
                        <button className="btn-entrar" onClick={() => handleClick(c.id)}>
                          Participar
                        </button>
                      ) : (
                        <button className="btn-fechado" disabled>Fechado</button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="nenhum-campeonato">Nenhum campeonato encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Campeonatos;
