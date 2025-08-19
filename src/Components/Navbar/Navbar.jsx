import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../Services/API";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import StratHub from "/src/assets/StratHub.png";
import { FaUsers } from "react-icons/fa";
import './Navbar.css';

function Navbar() {
  const { userId } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [timeInfo, setTimeInfo] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUsuario(null);
      setLoadingUser(false);
      return;
    }

    async function fetchUsuario() {
      try {
        const { data } = await api.get(`/usuario/${userId}`);
        setUsuario(data);
        setLoadingUser(false);

        const idTime = data.idTime || data.id_time;
        if (idTime) {
          const res = await api.get(`/times/${idTime}`);
          setTimeInfo(res.data);
        }

        if (location.pathname === "/") {
          navigate(idTime ? `/times/${idTime}` : "/criartime");
        }
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        setUsuario(null);
        setLoadingUser(false);
      }
    }

    fetchUsuario();
  }, [userId, api, location.pathname, navigate]);

  if (loadingUser) {
    return (
      <header>
        <nav className="nav">
          <img src={StratHub} alt="Logo" className="nav-logo" onClick={() => navigate("/")} />
          <span>Carregando...</span>
        </nav>
      </header>
    );
  }

  if (!usuario) {
    return (
      <header>
        <nav className="nav">
          <img
            src={StratHub}
            alt="Logo do sistema"
            onClick={() => navigate("/")}
            className="nav-logo"
          />
          <span onClick={() => navigate("/login")} className="nav-link">Entrar</span>
          <span onClick={() => navigate("/cadastro")} className="nav-link">Cadastrar</span>
        </nav>
      </header>
    );
  }

  const imagemPerfil = usuario.imagemUsuario || "/default-avatar.png";
  const nomeUsuario = usuario.nome || "Usuário";
  const idTime = usuario.idTime || usuario.id_time;
  const rank = usuario.rank || "default"; // Evita erro de variável indefinida

  return (
    <header>
      <nav className="nav">
        <img
          src={StratHub}
          alt="Logo do sistema"
          onClick={() => navigate("/")}
          className="nav-logo"
        />

        <span onClick={() => navigate("/home")} className="nav-link">Salas</span>
        <span onClick={() => navigate("/campeonatos")} className="nav-link">Campeonatos</span>
        <span onClick={() => navigate("/eliteCup")} className="nav-link">ELITE CUP</span>
        <span onClick={() => navigate("/home")} className="nav-link">Comunidades(em teste)</span>

        <span
          onClick={() => navigate(idTime ? `/times/${idTime}` : "/criartime")}
          className="nav-link"
        >
          Time
        </span>

        <span onClick={() => navigate("/amigos")} className="nav-link-friends">
          <FaUsers className="friends-icon" />
        </span>

        <div
          className="user-info"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <img
            className="profile-icon-img"
            src={imagemPerfil}
            alt={`Foto de ${nomeUsuario}`}
            onClick={() => navigate(`/usuario/${usuario.id || userId}`)}
          />

          {showTooltip && (
            <div className="user-tooltip">
              <p>Time:</p>
              {timeInfo ? (
                <div className="tooltip-header">
                  <img
                    src={`data:image/*;base64,${timeInfo.imagemBase64}`}
                    alt="Logo do time"
                    className="tooltip-logo"
                  />
                  <p className="tooltip-name">{timeInfo.nome}</p>
                </div>
              ) : (
                <p className="tooltip-name nao-possui">Não possui</p>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
