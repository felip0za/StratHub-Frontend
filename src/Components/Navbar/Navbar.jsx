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
    if (userId === null) {
      setUsuario(null);
      setLoadingUser(false);
      return;
    }

    if (!userId) return;

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
          if (idTime) {
            navigate(`/times/${idTime}`);
          } else {
            navigate("/criartime");
          }
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
        <span onClick={() => navigate("/chatbox")} className="nav-link">Campeonatos (em Breve)</span>

        <span
          onClick={() => {
            if (idTime) {
              navigate(`/times/${idTime}`);
            } else {
              navigate("/criartime");
            }
          }}
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
          <span className="user-name">R$:00,00</span>

          {showTooltip && (
            <div className="user-tooltip">
              {timeInfo ? (
                <>
                <p className="tooltip-logo">Time: </p>
                  <img
                    src={`data:image/*;base64,${timeInfo.imagemBase64}`}
                    alt="Logo do time"
                    className="tooltip-logo"
                  />
                  <p className="tooltip-name">{timeInfo.nome}</p>
                </>
              ) : (
                <p className="tooltip-name">Não possui</p>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
