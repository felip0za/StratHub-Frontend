import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";
import "./Landpage.css";
import StratHubLogo from "../../assets/StratHub.png";

const Landpage = () => {
  const navigate = useNavigate();
  const api = useApi();

  const [stats, setStats]           = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    api
      .get("/estatisticas/plataforma")
      .then(res => setStats(res.data))
      .catch(() => setStatsError(true));
  }, []);

  const fmt = (n) =>
    n !== undefined && n !== null
      ? Number(n).toLocaleString("pt-BR")
      : "—";

  const StatVal = ({ value }) => {
    if (statsError) return <span>—</span>;
    if (!stats)     return <span className="lp-skeleton" />;
    return <span>{fmt(value)}</span>;
  };

  return (
    <div className="landing">
      <div className="landing-overlay" />
      <div className="landing-grid" />

      {/* ── Navbar ── */}
      <nav className="lp-navbar">
        <img src={StratHubLogo} alt="StratHub" className="lp-logo" />
        <div className="lp-nav-actions">
          <button className="lp-btn-ghost" onClick={() => navigate("/login")}>
            Entrar
          </button>
          <button
            className="lp-btn-primary"
            onClick={() => navigate("/cadastro")}
            style={{ padding: "9px 20px", fontSize: "0.875rem" }}
          >
            Criar conta
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="lp-hero">
        <div className="lp-eyebrow">
          <span className="lp-eyebrow-dot" />
          Plataforma de Campeonatos
        </div>

        <h1 className="lp-title">
          STRAT<span className="lp-title-accent">HUB</span>
        </h1>

        <p className="lp-subtitle">
          Crie, gerencie e participe de campeonatos de{" "}
          <b>Rainbow Six Siege X</b>.<br />
          Do agendamento ao bracket — tudo em um lugar.
        </p>

        <div className="lp-cta-row">
          <button className="lp-btn-primary" onClick={() => navigate("/cadastro")}>
            Começar Agora
          </button>
          <button className="lp-btn-ghost" onClick={() => navigate("/login")}>
            Já tenho conta
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="lp-stats">
          <div className="lp-stat">
            <span className="lp-stat-val"><StatVal value={stats?.totalUsuarios} /></span>
            <span className="lp-stat-label">Jogadores</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-val"><StatVal value={stats?.totalCampeonatos} /></span>
            <span className="lp-stat-label">Campeonatos</span>
          </div>
          <div className="lp-stat">
            <span className="lp-stat-val"><StatVal value={stats?.totalTimes} /></span>
            <span className="lp-stat-label">Times ativos</span>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        © 2025 StratHub — Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Landpage;