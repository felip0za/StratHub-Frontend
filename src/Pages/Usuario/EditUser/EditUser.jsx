import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../../Services/API"; // Use hook para axios com token
import Navbar from "../../../Components/Navbar/Navbar";
import avatarDefault from "/src/assets/avatar-default.png";
import { useAuth } from "../../../contexts/AuthContext";
import "./EditUser.css";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const api = useApi(); // instância axios com token no header

  const [usuario, setUsuario] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    senha: "",
    imagem_usuario: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    async function fetchUsuario() {
      try {
        const { data } = await api.get(`/usuario/${id}`);
        setUsuario({
          ...data,
          senha: "",
          imagem_usuario: data.imagem_usuario?.startsWith("data:image/")
            ? data.imagem_usuario
            : data.imagem_usuario
              ? `data:image/png;base64,${data.imagem_usuario}`
              : ""
        });
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        setError("Erro ao carregar usuário.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsuario();
  }, [id, api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUsuario((prev) => ({
        ...prev,
        imagem_usuario: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const usuarioParaEnvio = {
        ...usuario,
        imagem_usuario: usuario.imagem_usuario.replace(/^data:image\/\w+;base64,/, "")
      };

      if (!usuarioParaEnvio.senha) {
        delete usuarioParaEnvio.senha;
      }

      await api.put(`/usuario/${id}`, usuarioParaEnvio);
      alert("Usuário atualizado com sucesso!");
      navigate(`/usuario/${id}`);
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      alert("Erro ao atualizar usuário.");
    }
  };

  const handleSair = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <Navbar />
      <div className="edit-profile-container">
        <h2>Informações</h2>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="left-column">
            <label className="avatar-wrapper">
              <img
                src={
                  usuario.imagem_usuario?.startsWith("data:image/")
                    ? usuario.imagem_usuario
                    : avatarDefault
                }
                alt="Avatar"
                className="avatar"
              />
              <div className="avatar-overlay">Trocar Foto</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="avatar-input"
              />
            </label>
          </div>

          <div className="right-column">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              value={usuario.nome}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={usuario.email}
              onChange={handleChange}
              required
            />

            <div className="buttons">
              <button type="submit" className="update-button">
                Salvar
              </button>
              <button
                type="button"
                onClick={handleSair}
                className="cancel-button"
              >
                Sair
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditUser;
