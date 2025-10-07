import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CriarCampeonatos.css";
import Navbar from "../../../Components/Navbar/Navbar";
import { useApi } from "../../../Services/API";
import { useAuth } from "../../../contexts/AuthContext";

const CriarCampeonatos = () => {
  const navigate = useNavigate();
  const api = useApi();
  const { userId } = useAuth(); // pega o ID do contexto
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagemBase64, setImagemBase64] = useState("");
  const [previewImagem, setPreviewImagem] = useState("");
  const [tipo, setTipo] = useState("GRATUITO");
  const [status, setStatus] = useState("ABERTO");
  const [valor, setValor] = useState("");
  const [maxEquipes, setMaxEquipes] = useState(4);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Upload da imagem ---
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
      const base64String = reader.result.split(",")[1]; // remove o prefixo data:image/...
      setImagemBase64(base64String);
      setPreviewImagem(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validações
    if (!nome.trim()) {
      setError("❌ O nome do campeonato é obrigatório.");
      setLoading(false);
      return;
    }
    if (maxEquipes < 4) {
      setError("❌ O campeonato deve ter pelo menos 4 equipes.");
      setLoading(false);
      return;
    }
    if (tipo === "PAGO" && (!valor || Number(valor) <= 0)) {
      setError("❌ Informe um valor válido para o campeonato pago.");
      setLoading(false);
      return;
    }
    if (!userId) {
      setError("❌ Usuário não autenticado. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      const novoCampeonato = {
        nome,
        descricao,
        imagemBase64,
        tipo,
        status,
        valor: tipo === "PAGO" ? Number(valor) : 0,
        maxEquipes,
        id_criador: parseInt(userId, 10),
      };

      const response = await api.post("/campeonatos", novoCampeonato);
      const campeonatoId = response.data.id || response.data.idCampeonato;

      if (campeonatoId) {
        alert("✅ Campeonato criado com sucesso!");
        navigate(`/campeonatos/${campeonatoId}`);
      } else {
        alert("Campeonato criado, mas não foi possível obter o ID para redirecionamento.");
      }
    } catch (err) {
      console.error("Erro ao criar campeonato:", err);
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
        {error && <div className="error-message">{error}</div>}
        <form className="campeonatos-create-form" onSubmit={handleSubmit}>
          <label>Nome do Campeonato:</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />

          <label>Descrição:</label>
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            rows="4"
          />

          <label>Imagem:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {previewImagem && (
            <div className="preview-container">
              <p>Pré-visualização:</p>
              <img src={previewImagem} alt="Prévia" className="preview-img" />
            </div>
          )}

          <label>Tipo:</label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="GRATUITO">Gratuito</option>
            <option value="PAGO">Pago</option>
          </select>

          <label>Status:</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="ABERTO">Aberto</option>
            <option value="FECHADO">Fechado</option>
          </select>

          <label>Número máximo de equipes:</label>
          <select value={maxEquipes} onChange={e => setMaxEquipes(parseInt(e.target.value, 10))}>
            {[4, 8, 12, 16].map(qtd => (
              <option key={qtd} value={qtd}>
                {qtd} equipes
              </option>
            ))}
          </select>

          {tipo === "PAGO" && (
            <>
              <label>Valor da Premiação (R$):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valor}
                onChange={e => setValor(e.target.value)}
                required
              />
            </>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Salvando..." : "Criar Campeonato"}
          </button>
        </form>
      </div>
    </>
  );
};

export default CriarCampeonatos;
