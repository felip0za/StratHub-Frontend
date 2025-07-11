import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../Services/API";
import { useNavigate,useLocation } from "react-router-dom";
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

  useEffect(() => {
    if (userId === null) {
      setUsuario(null);
      setLoadingUser(false);
      return;
    }

    if (!userId) {
      // userId undefined, ainda carregando? Só não busca ainda.
      return;
    }

    async function fetchUsuario() {
      try {
        const { data } = await api.get(`/usuario/${userId}`);
        setUsuario(data);
        setLoadingUser(false);

        if (location.pathname === "/") {
          const idTime = data.idTime || data.id_time;
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

  // Enquanto estiver carregando o estado do usuário, pode exibir algo neutro
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
    // Se não logado
    return (
      <header>
        <nav className="nav">
          <img
            src={StratHub}
            alt="Logo do sistema"
            onClick={() => navigate("/")}
            className="nav-logo"
          />
          <span onClick={() => navigate("/login")} className="nav-link">
            Entrar
          </span>
          <span onClick={() => navigate("/cadastro")} className="nav-link">
            Cadastrar
          </span>
        </nav>
      </header>
    );
  }

  // Usuário logado: exibe navbar completa
  const imagemPerfil = usuario.imagemUsuario || usuario.imagem_usuario || "/default-avatar.png";
  const nomeUsuario = usuario.nome || usuario.name || "Usuário";

  return (
    <header>
      <nav className="nav">
        <img
          src={StratHub}
          alt="Logo do sistema"
          onClick={() => navigate("/")}
          className="nav-logo"
        />

        <span onClick={() => navigate("/home")} className="nav-link">
          Salas
        </span>
        <span onClick={() => navigate("/chatbox")} className="nav-link">
          Campeonatos (em Breve)
        </span>

        <span
          onClick={() => {
            const idTime = usuario.idTime || usuario.id_time;
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

        <div className="user-info">
          <img
            className="profile-icon-img"
            src={imagemPerfil}
            alt={`Foto de ${nomeUsuario}`}
            onClick={() => navigate(`/usuario/${usuario.id || userId}`)}
          />
          <span className="user-name"></span>
          R$:00,00
        </div>
      </nav>
    </header>
  );
}
export default Navbar;
