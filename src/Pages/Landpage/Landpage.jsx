import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landpage.css";
import StratHubLogo from "/src/assets/StratHub.png";

const Landpage = () => {
  const navigate = useNavigate();

  const handleNavigateCadastro = () => {
    navigate("/cadastro");
  };

  const handleNavigateLogin = () => {
    navigate("/login");
  };

  return (
    <div className="landing">
      <div className="landing-overlay"></div>

      <nav className="navbar">
        <img src={StratHubLogo} alt="StratHub" className="logo" />
        <button onClick={handleNavigateLogin} className="nav-btn">Entrar</button>
      </nav>

      <main className="hero">
        <h1 className="hero-title">
          <span>STRATHUB</span>
        </h1>
        <p className="hero-subtitle">
          Crie, gerencie e participe de campeonatos de <b>Rainbow Six Siege X</b>.
        </p>
        <button className="cta-btn" onClick={handleNavigateCadastro}>
          Começar Agora
        </button>
      </main>

      <footer className="footer">
        <p>© 2025 StratHub — Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Landpage;
