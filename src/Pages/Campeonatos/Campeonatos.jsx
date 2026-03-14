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
  const [temTime, setTemTime] = useState(false);

  const navigate = useNavigate();
  const api = useApi();

  const fetchCampeonatos = async () => {
    try {
      const response = await api.get("/campeonatos");
      setCampeonatos(response.data);
      setError("");
    } catch (err) {
      console.error("Erro ao carregar campeonatos:", err);
      setError("Erro ao carregar campeonatos");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeUsuario = async () => {
    try {
      const response = await api.get("/times/usuario");
      setTemTime(!!response.data);
    } catch {
      setTemTime(false);
    }
  };

  useEffect(() => {
    fetchCampeonatos();
    fetchTimeUsuario();
    const interval = setInterval(() => {
      fetchCampeonatos();
      fetchTimeUsuario();
    }, 1000);
    return () => clearInterval(interval);
  }, [api]);

  const campeonatosFiltrados = campeonatos.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleClick = (id) => navigate(`/campeonatos/${id}`);

  const formatarStatus = (status) => {
    switch (status) {
      case "ABERTO":       return { texto: "Aberto",       classe: "aberto" };
      case "EM_ANDAMENTO": return { texto: "Em Andamento", classe: "em_andamento" };
      case "FECHADO":      return { texto: "Fechado",      classe: "fechado" };
      default:             return { texto: "-",            classe: "" };
    }
  };

  const getImagemCampeonato = (img) =>
    img ? `data:image/png;base64,${img}` : null;

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <div className="camp-page">

        {/* ── Page Header ── */}
        <div className="camp-page-header">
          <div className="camp-page-header-inner">
            <div>
              <h1 className="camp-page-title">🏆 Campeonatos</h1>
              <p className="camp-page-subtitle">Encontre e participe de torneios</p>
            </div>
            <div className="camp-page-actions">
              {!temTime && (
                <>
                  <button className="btn-primary" onClick={() => navigate("/criar-campeonatos")}>
                    + Criar Campeonato
                  </button>
                  <button className="btn-ghost" onClick={() => navigate("/meus-campeonatos")}>
                    Meus Campeonatos
                  </button>
                </>
              )}
              <button className="btn-ghost" onClick={() => navigate("/campeonatos-inscritos")}>
                Inscritos
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="camp-body">
          {error && <div className="camp-error">{error}</div>}

          <div className="camp-search-wrap">
            <span className="search-icon">🔎</span>
            <input
              type="text"
              placeholder="Buscar campeonatos..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="camp-search"
            />
          </div>

          {campeonatosFiltrados.length > 0 ? (
            <div className="camp-grid">
              {campeonatosFiltrados.map((c) => {
                const status = formatarStatus(c.status);
                const imagem = getImagemCampeonato(c.imagemCampeonato);

                return (
                  <div key={c.id} className="camp-card" onClick={() => handleClick(c.id)}>
                    <div className="camp-card-img">
                      {imagem ? (
                        <img src={imagem} alt={c.nome} />
                      ) : (
                        <div className="camp-card-img-placeholder">🏆</div>
                      )}
                      <span className={`camp-status-badge ${status.classe}`}>
                        {status.classe === "em_andamento" && <span className="live-dot" />}
                        {status.texto}
                      </span>
                      <div className="camp-card-img-overlay" />
                    </div>

                    <div className="camp-card-body">
                      <h2 className="camp-card-title">{c.nome}</h2>

                      <div className="camp-card-meta">
                        <span className={`meta-badge ${c.tipo === "GRATUITO" ? "free" : "paid"}`}>
                          {c.tipo === "GRATUITO" ? "🆓 Gratuito" : "💳 Pago"}
                        </span>
                        <span className="meta-badge neutral">👥 {c.maxEquipes} equipes</span>
                      </div>

                      <p className="camp-card-org">
                        por <strong>{c.criador?.nome || "Desconhecido"}</strong>
                      </p>

                      <button
                        className={c.status === "ABERTO" ? "btn-card-enter" : "btn-card-closed"}
                        disabled={c.status !== "ABERTO"}
                        onClick={(e) => { e.stopPropagation(); handleClick(c.id); }}
                      >
                        {c.status === "ABERTO" ? "Participar" : "Indisponível"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="camp-empty">
              <span className="camp-empty-icon">🏟️</span>
              <p>Nenhum campeonato encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Campeonatos;
