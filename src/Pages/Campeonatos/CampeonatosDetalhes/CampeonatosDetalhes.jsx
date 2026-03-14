import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import LoadingScreen from "../../../Components/LoadingScreen/LoadingScreen";
import { useApi } from "../../../Services/API";
import { useAuth } from "../../../contexts/AuthContext";
import avatardefault from "/src/assets/avatar-default.png";
import "./CampeonatosDetalhes.css";

function CampeonatosDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { user, token } = useAuth();

  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensagemModal, setMensagemModal] = useState("");
  const [totalEquipes, setTotalEquipes] = useState(0);

  useEffect(() => {
    const fetchCampeonato = async () => {
      try {
        const response = await api.get(`/campeonatos/${id}`);
        setCampeonato(response.data);
      } catch (err) {
        console.error("Erro ao buscar campeonato:", err);
        setErro("Erro ao carregar informações do campeonato.");
      } finally {
        setLoading(false);
      }
    };
    fetchCampeonato();
  }, [api, id]);

  useEffect(() => {
    if (!id) return;
    const fetchContagem = async () => {
      try {
        const response = await api.get(`/inscricoes/campeonato/${id}/count`);
        setTotalEquipes(response.data);
      } catch {
        setTotalEquipes(0);
      }
    };
    fetchContagem();
  }, [api, id]);

  const handleParticipar = async () => {
    try {
      await api.post(
        "/inscricoes/inscrever",
        { idCampeonato: parseInt(id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensagemModal("✅ Time inscrito com sucesso!");
      setMostrarModal(true);
    } catch (err) {
      console.error("Erro ao inscrever time:", err);
      if (err.response?.status === 400) {
        setMensagemModal(err.response.data || "⚠️ Não foi possível realizar a inscrição.");
      } else if (err.response?.status === 401) {
        setMensagemModal("⚠️ Você precisa estar logado para participar.");
      } else {
        setMensagemModal("❌ Ocorreu um erro ao tentar inscrever o time.");
      }
      setMostrarModal(true);
    }
  };

  const fecharModal = () => {
    setMostrarModal(false);
    if (mensagemModal.includes("✅ Time inscrito com sucesso")) {
      navigate(`/info-campeonato/${id}`);
    }
  };

  if (loading) return <LoadingScreen />;
  if (erro) return (<><Navbar /><div className="det-error">{erro}</div></>);
  if (!campeonato) return <div className="det-error">Campeonato não encontrado.</div>;

  const formatarImagem = (img) =>
    !img ? null : img.startsWith("data:image") ? img : `data:image/png;base64,${img}`;

  const imagemCriador = campeonato.criador?.imagemUsuario
    ? campeonato.criador.imagemUsuario.startsWith("data:image")
      ? campeonato.criador.imagemUsuario
      : `data:image/png;base64,${campeonato.criador.imagemUsuario}`
    : avatardefault;

  const bannerImg = formatarImagem(
    campeonato.imagemCampeonato || campeonato.te_imagem_campeonato || campeonato.imagem
  );

  const isGratuito = campeonato.tipo === "GRATUITO" || campeonato.tp_tipo === "GRATUITO";
  const equipeMax = campeonato.maxEquipes || campeonato.nm_max_equipes;

  return (
    <>
      <Navbar />
      <div className="det-page">

        {/* ── Banner Hero ── */}
        <div
          className="det-banner"
          style={bannerImg ? { backgroundImage: `url(${bannerImg})` } : {}}
        >
          <button className="det-btn-voltar" onClick={() => navigate('/campeonatos')}>
            ← Voltar
          </button>
          {!bannerImg && <div className="det-banner-placeholder">🏆</div>}
          <div className="det-banner-overlay">
            <div className="det-banner-content">
              <div className="det-banner-text">
                <div className="det-hero-badges">
                  <span className={`det-badge ${isGratuito ? "free" : "paid"}`}>
                    {isGratuito ? "🆓 Gratuito" : "💳 Pago"}
                  </span>
                </div>
                <h1 className="det-title">
                  {campeonato.nome || campeonato.te_nome}
                </h1>
                <p className="det-subtitle">Torneio de {isGratuito ? "entrada gratuita" : "entrada paga"}</p>
              </div>
              <button className="det-btn-participar" onClick={handleParticipar}>
                Participar do Torneio
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="det-body">

          {/* ── Coluna Esquerda ── */}
          <div className="det-col-left">

            {/* Stats */}
            <div className="det-section-card">
              <div className="det-section-header">
                <span>📊</span>
                <h3>Formato</h3>
              </div>
              <div className="det-stats-grid">
                <div className="det-stat">
                  <span className="det-stat-label">💰 Prêmio total</span>
                  <span className="det-stat-value">
                    R$ {parseFloat(campeonato.valor || campeonato.nm_valor || campeonato.valorPremio || 0).toFixed(2)}
                  </span>
                </div>
                <div className="det-stat">
                  <span className="det-stat-label">💵 Valor por equipe</span>
                  <span className="det-stat-value">
                    {isGratuito ? "Gratuito" : `R$ ${parseFloat(campeonato.valorPorEquipe || campeonato.nm_valor_por_equipe || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="det-stat">
                  <span className="det-stat-label">👥 Máx. Equipes</span>
                  <span className="det-stat-value">{equipeMax}</span>
                </div>
                <div className="det-stat">
                  <span className="det-stat-label">🏆 Inscritas</span>
                  <span className="det-stat-value">{totalEquipes} / {equipeMax}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="det-progress-wrap">
                <div className="det-progress-bar">
                  <div
                    className="det-progress-fill"
                    style={{ width: `${Math.min((totalEquipes / equipeMax) * 100, 100)}%` }}
                  />
                </div>
                <span className="det-progress-label">
                  {Math.round((totalEquipes / equipeMax) * 100)}% preenchido
                </span>
              </div>
            </div>

            {/* Organizador */}
            <div className="det-section-card">
              <div className="det-section-header">
                <span>👤</span>
                <h3>Organizador</h3>
              </div>
              <button
                className="det-criador-btn"
                onClick={() =>
                  navigate(`/userprofile/${campeonato.criador?.id || campeonato.criador?.idUsuario || campeonato.idCriador}`)
                }
              >
                <img src={imagemCriador} alt="Criador" className="det-criador-img" />
                <div className="det-criador-info">
                  <span className="det-criador-nome">{campeonato.criador?.nome || "Desconhecido"}</span>
                  <span className="det-criador-role">Organizador</span>
                </div>
                <span className="det-criador-arrow">→</span>
              </button>
            </div>

            {/* Informações adicionais */}
            <div className="det-section-card">
              <div className="det-section-header">
                <span>📋</span>
                <h3>Informações adicionais</h3>
              </div>
              <div className="det-info-list">
                <div className="det-info-row">
                  <span className="det-info-key">Criado em</span>
                  <span className="det-info-val">
                    {new Date(campeonato.dataInicio || campeonato.dt_inicio).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="det-info-row">
                  <span className="det-info-key">Status</span>
                  <span className={`det-status-chip ${(campeonato.status || "").toLowerCase()}`}>
                    {campeonato.status || "Em andamento"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Coluna Direita ── */}
          <div className="det-col-right">
            <div className="det-section-card">
              <div className="det-section-header">
                <span>🎮</span>
                <h3>Configurações do jogo</h3>
              </div>
              <div className="det-info-list">
                <div className="det-info-row">
                  <span className="det-info-key">Plataforma</span>
                  <span className="det-info-val">{campeonato.plataforma || "—"}</span>
                </div>
                {campeonato.plataforma === "CONSOLE" && (
                  <div className="det-info-row">
                    <span className="det-info-key">Console</span>
                    <span className="det-info-val">
                      {campeonato.console === "XBOX" ? "Xbox"
                        : campeonato.console === "PS" ? "PlayStation"
                        : campeonato.console === "AMBOS" ? "Xbox / PlayStation"
                        : "—"}
                    </span>
                  </div>
                )}
                <div className="det-info-row">
                  <span className="det-info-key">Formato</span>
                  <span className="det-info-val">
                    {campeonato.formatoCampeonato === "FASE_DE_GRUPOS_E_ELIMINATORIAS"
                      ? "Grupos + Eliminatórias"
                      : campeonato.formatoCampeonato === "TABELA_ELIMINATORIAS"
                      ? "Tabela + Eliminatórias"
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal ── */}
      {mostrarModal && (
        <div className="det-modal-overlay" onClick={fecharModal}>
          <div className="det-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="det-modal-icon">
              {mensagemModal.startsWith("✅") ? "✅" : "⚠️"}
            </div>
            <p className="det-modal-msg">{mensagemModal.replace(/^[✅⚠️❌]\s*/, "")}</p>
            <button className="det-modal-btn" onClick={fecharModal}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default CampeonatosDetalhes;