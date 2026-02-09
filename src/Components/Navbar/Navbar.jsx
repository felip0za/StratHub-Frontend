import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../Services/API";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import StratHub from "/src/assets/StratHub.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import avatardefault from "/src/assets/avatar-default.png";
import "./Navbar.css";

function Navbar() {
  const { userId } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeInfo, setTimeInfo] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // WALLET
  const [showWalletBox, setShowWalletBox] = useState(false);
  const [stratCoins, setStratCoins] = useState(320); // depois vem da API

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".wallet-container")) {
        setShowWalletBox(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const carregarUsuario = async () => {
      if (!userId) {
        setUsuario(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/usuario/${userId}`);
        setUsuario(data);

        const idTime = data.idTime || data.id_time;
        if (idTime) {
          const res = await api.get(`/times/${idTime}`);
          setTimeInfo(res.data);
        }

        if (location.pathname === "/") {
          navigate(idTime ? `/times/${idTime}` : "/criartime");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    carregarUsuario();
  }, [userId, api, location.pathname, navigate]);

  if (loading) {
    return (
      <header>
        <nav className="nav">
          <img
            src={StratHub}
            alt="Logo"
            className="nav-logo"
            onClick={() => navigate("/")}
          />
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
            alt="Logo"
            className="nav-logo"
            onClick={() => navigate("/")}
          />
          <div className="nav-center">
            <span className="nav-link" onClick={() => navigate("/login")}>
              Entrar
            </span>
            <span className="nav-link" onClick={() => navigate("/cadastro")}>
              Cadastrar
            </span>
          </div>
        </nav>
      </header>
    );
  }

  const imagemPerfil = usuario.imagemUsuario || avatardefault;
  const nomeUsuario = usuario.nome || "Usuário";
  const idTime = usuario.idTime || usuario.id_time;

  return (
    <header>
      <nav className="nav">

        {/* LEFT */}
        <div className="nav-left">
          <img
            src={StratHub}
            alt="Logo"
            className="nav-logo"
            onClick={() => navigate("/")}
          />
        </div>

        {/* CENTER */}
        <div className="nav-center">
          <span className="nav-link" onClick={() => navigate("/campeonatos")}>
            Campeonatos
          </span>
          <span className="nav-link" onClick={() => navigate("/eliteCup")}>
            ELITE CUP
          </span>
          <span
            className="nav-link"
            onClick={() =>
              navigate(idTime ? `/times/${idTime}` : "/criartime")
            }
          >
            Time
          </span>
        </div>

        {/* RIGHT */}
        <div className="nav-right">

          {/* WALLET */}
          <div className="wallet-container">
            <div
              className="wallet"
              onClick={() => setShowWalletBox(!showWalletBox)}
            >
              👝 <span className="wallet-value">{stratCoins}</span>
            </div>

            {showWalletBox && (
              <div className="wallet-box">
                <h4>Carteira </h4>

                <p><strong>Saldo:</strong> {stratCoins} StratCoins</p>
                <p>
                  <strong>Em reais:</strong> R$ {(stratCoins / 8).toFixed(2)}
                </p>

                <div className="wallet-actions">
                  <button onClick={() => navigate("/wallet/comprar")}>
                    Comprar
                  </button>

                  <button
                    disabled={(stratCoins / 8) < 40}
                    onClick={() => navigate("/wallet/resgatar")}
                  >
                    Resgatar
                  </button>
                </div>

                {(stratCoins / 8) < 40 && (
                  <small className="wallet-warning">
                    Saldo mínimo para resgate: R$40 (320 StratCoins)
                  </small>
                )}
              </div>
            )}
          </div>

          <span
            className="nav-link-friends"
            onClick={() => navigate("/amigos")}
          >
            <FontAwesomeIcon icon={faUserGroup} />
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
              onClick={() =>
                navigate(`/usuario/${usuario.id || userId}`)
              }
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
                  <p className="tooltip-name nao-possui">
                    Não possui
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      </nav>
    </header>
  );
}

export default Navbar;
