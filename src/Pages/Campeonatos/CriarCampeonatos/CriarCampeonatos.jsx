import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CriarCampeonatos.css";
import Navbar from "../../../Components/Navbar/Navbar";
import { useApi } from "../../../Services/API";
import { useAuth } from "../../../contexts/AuthContext";

function CriarCampeonatos() {
  const navigate = useNavigate();
  const api = useApi();
  const { user, token } = useAuth();
  const userId = user?.id;

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    imagemBase64: "",    // <-- agora armazena a imagem em Base64
    previewImagem: "",   // para preview
    tipo: "GRATUITO",
    status: "ABERTO",
    valor: "",
    maxEquipes: 4
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Usuário logado:", user);
    console.log("Token:", token);
    console.log("userId:", userId);
  }, [user, token, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Upload da imagem do campeonato ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("❌ Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    setError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setFormData(prev => ({
        ...prev,
        previewImagem: base64,
        imagemBase64: base64.split(",")[1] // <-- remove o prefixo data:image/...;base64,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.nome || formData.nome.trim() === "") {
      setError("❌ O nome do campeonato é obrigatório.");
      setLoading(false);
      return;
    }

    if (formData.maxEquipes < 4) {
      setError("❌ O campeonato deve ter pelo menos 4 equipes.");
      setLoading(false);
      return;
    }

    if (formData.tipo === "PAGO" && (!formData.valor || Number(formData.valor) <= 0)) {
      setError("❌ Informe um valor válido para o campeonato pago.");
      setLoading(false);
      return;
    }

    if (!userId) {
      setError("❌ Usuário não autenticado. Faça login novamente.");
      setLoading(false);
      return;
    }

    const novoCampeonato = {
      ...formData,
      valor: formData.tipo === "PAGO" ? Number(formData.valor) : 0,
      idCriador: userId
    };

    try {
      await api.post("/campeonatos", novoCampeonato, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("✅ Campeonato criado com sucesso!");
      navigate("/campeonatos");
    } catch (err) {
      console.error("Erro ao criar campeonato:", err.response || err);
      setError(err.response?.data?.message || "❌ Erro ao criar campeonato. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="campeonatos-create-container">
        <h1 className="campeonatos-create-title">Criar Campeonato</h1>
        <form className="campeonatos-create-form" onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Nome:</label>
            <input
              type="text"
              name="nome"
              className="campeonatos-create-input"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Campeonato R6 Brasil"
              required
            />
          </div>

          {/* Descrição */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Descrição:</label>
            <input
              type="text"
              name="descricao"
              className="campeonatos-create-input"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descrição do campeonato"
            />
          </div>

          {/* Imagem */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Imagem:</label>
            <input
              type="file"
              accept="image/*"
              className="campeonatos-create-input"
              onChange={handleImageChange}
            />
            {formData.previewImagem && (
              <div className="preview-container">
                <p>Pré-visualização:</p>
                <img
                  src={formData.previewImagem}
                  alt="Prévia"
                  className="campeonatos-create-preview"
                />
              </div>
            )}
          </div>

          {/* Tipo */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Tipo:</label>
            <select
              name="tipo"
              className="campeonatos-create-select"
              value={formData.tipo}
              onChange={handleChange}
            >
              <option value="GRATUITO">Gratuito</option>
              <option value="PAGO">Pago</option>
            </select>
          </div>

          {/* Status */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Status:</label>
            <select
              name="status"
              className="campeonatos-create-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ABERTO">Aberto</option>
              <option value="FECHADO">Fechado</option>
            </select>
          </div>

          {/* Máximo de Equipes */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Número máximo de equipes:</label>
            <select
              name="maxEquipes"
              className="campeonatos-create-select"
              value={formData.maxEquipes}
              onChange={handleChange}
            >
              {[4, 8, 12, 16].map(qtd => (
                <option key={qtd} value={qtd}>
                  {qtd} equipes
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          {formData.tipo === "PAGO" && (
            <div className="campeonatos-create-field">
              <label className="campeonatos-create-label">
                Valor da Premiação (R$):
              </label>
              <input
                type="number"
                name="valor"
                min="0"
                step="0.01"
                className="campeonatos-create-input"
                value={formData.valor}
                onChange={handleChange}
                placeholder="Ex: 800"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="campeonatos-create-button"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Criar Campeonato"}
          </button>

          {error && <p className="campeonatos-create-error">{error}</p>}
        </form>
      </div>
    </>
  );
}

export default CriarCampeonatos;
