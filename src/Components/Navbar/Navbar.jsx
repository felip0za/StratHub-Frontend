import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useApi } from "../../Services/API";
import { useAuth } from "../../contexts/AuthContext";
import { FaUsers } from "react-icons/fa";
import StratHub from "/src/assets/StratHub.png";
import "./Navbar.css";

function Navbar() {
  const { userId } = useAuth();  // pega id do usuário do contexto
  const api = useApi();           // axios com token automático
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchUsuario() {
      try {
        const { data } = await api.get(`/usuario/${userId}`);
        setUsuario(data);
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
      }
    }

    fetchUsuario();
  }, [userId, api]);

  if (!usuario) return null;

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
            if (usuario.timeId) {
              navigate(`/times/${usuario.timeId}`);
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
            src={usuario.imagem_usuario || "/default-avatar.png"}
            alt="Foto do usuário"
            onClick={() => navigate(`/usuario/${usuario.id}`)}
          />
          R$:00,00
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
