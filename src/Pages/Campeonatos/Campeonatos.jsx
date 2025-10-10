import React, { useEffect, useState } from "react";
import "./Campeonatos.css";
import Navbar from "../../Components/Navbar/Navbar";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";

const Campeonatos = () => {
  const [campeonatos, setCampeonatos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const api = useApi();

  // --- Navegação ---
  const handleCriarCampeonato = () => navigate("/criar-campeonatos");
  const handleMeusCampeonatos = () => navigate("/meus-campeonatos");

  // --- Buscar campeonatos ---
  useEffect(() => {
    const fetchCampeonatos = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/campeonatos");
        setCampeonatos(response.data);
      } catch (err) {
        console.error("Erro ao carregar campeonatos:", err);
        setError("❌ Não foi possível carregar os campeonatos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampeonatos();
  }, [api]);

  // --- Filtragem ---
  const campeonatosFiltrados = campeonatos.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  // --- Navegar para detalhes do campeonato ---
  const handleClick = (id) => {
    navigate(`/info-campeonato/${id}`);
  };

  // --- Formata status para exibição ---
  const formatarStatus = (status) => {
    switch (status) {
      case "ABERTO":
        return { texto: "Aberto", classe: "aberto" };
      case "EM_ANDAMENTO":
        return { texto: "Em andamento", classe: "em_andamento" };
      case "FECHADO":
        return { texto: "Fechado", classe: "fechado" };
      default:
        return { texto: "-", classe: "" };
    }
  };

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
                const imagemCampeonato =
                  c.imagemCampeonato || "https://via.placeholder.com/400x200?text=Sem+Imagem";

                const status = formatarStatus(c.status);

                return (
                  <div key={c.id} className="card">
                    <div className="card-img">
                      <img src={imagemCampeonato} alt={c.nome} />
                      <span className={`status ${status.classe}`}>{status.texto}</span>
                    </div>

                    <div className="card-body">
                      <h2>{c.nome}</h2>
                      <p className="detalhes">
                        Tipo: {c.tipo === "GRATIS" ? "Gratuito" : "Pago"} • Máx. {c.maxEquipes} equipes
                      </p>
                      <p className="organizador">
                        Organizado por <strong>{c.criador?.nome || "Desconhecido"}</strong>
                      </p>
                      {c.status === "ABERTO" ? (
                        <button className="btn-entrar" onClick={() => handleClick(c.id)}>
                          Participar
                        </button>
                      ) : (
                        <button className="btn-fechado" disabled>
                          Fechado
                        </button>
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
