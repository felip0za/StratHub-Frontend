import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../../Services/API";
import { useAuth } from "../../../contexts/AuthContext";
import Navbar from "../../../Components/Navbar/Navbar";
import avatarDefault from "/src/assets/avatar-default.png";
import "./EditTime.css";

function EditarTime() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { user, token } = useAuth();

  const [time, setTime] = useState({
    nome: "",
    apelido: "",
    descricao: "",
    imagemBase64: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const carregarTime = async () => {
      try {
        const { data } = await api.get(`/times/${id}`);

        if (user.id !== data.idCriador) {
          alert("Apenas o criador do time pode editar.");
          navigate(`/times/${id}`);
          return;
        }

        setTime({
          ...data,
          imagemBase64: data.imagemBase64?.startsWith("data:image/")
            ? data.imagemBase64
            : data.imagemBase64
              ? `data:image/png;base64,${data.imagemBase64}`
              : ""
        });
      } catch (err) {
        console.error("Erro ao carregar time:", err);
        setError("Erro ao carregar informações do time.");
      } finally {
        setLoading(false);
      }
    };

    carregarTime();
  }, [api, id, user, navigate, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTime((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setTime((prev) => ({
        ...prev,
        imagemBase64: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const timeParaEnvio = {
        ...time,
        imagemBase64: time.imagemBase64.replace(/^data:image\/\w+;base64,/, "")
      };

      await api.put(`/times/${id}`, timeParaEnvio);
      alert("Time atualizado com sucesso!");
      navigate(`/times/${id}`);
    } catch (err) {
      console.error("Erro ao atualizar time:", err);
      alert("Erro ao atualizar time.");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <Navbar />
      <div className="editar-time-container">
        <h2>Editar Informações do Time</h2>
        <form className="editar-time-form" onSubmit={handleSubmit}>
          <div className="imagem-wrapper">
            <label className="imagem-label">
              <img
                src={time.imagemBase64 || avatarDefault}
                alt="Avatar do Time"
                className="imagem-preview"
              />
              <span className="imagem-overlay">Trocar imagem</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="form-fields">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              value={time.nome}
              onChange={handleChange}
              required
            />

            <label>Apelido</label>
            <input
              type="text"
              name="apelido"
              value={time.apelido}
              onChange={handleChange}
            />

            <label>Descrição</label>
            <textarea
              name="descricao"
              value={time.descricao}
              onChange={handleChange}
              rows={4}
            />

            <button type="submit" className="salvar-btn">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditarTime;
