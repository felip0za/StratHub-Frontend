import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CriarCampeonatos.css";
import Navbar from "../../../Components/Navbar/Navbar";

function CriarCampeonatos({ userId }) {
  const navigate = useNavigate();

  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState("");
  const [tipo, setTipo] = useState("GRATIS");
  const [status, setStatus] = useState("ABERTO");
  const [valorPremiacao, setValorPremiacao] = useState(""); 
  const [valorEquipe, setValorEquipe] = useState(0);
  const [maxEquipes, setMaxEquipes] = useState(16);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Converter imagem para base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagem(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Calcular valor por equipe
  const calcularValorEquipe = (premio, equipes) => {
    if (premio && equipes > 0) {
      setValorEquipe((premio / equipes).toFixed(2));
    } else {
      setValorEquipe(0);
    }
  };

  const handleValorPremiacao = (e) => {
    const valor = e.target.value;
    setValorPremiacao(valor);
    calcularValorEquipe(valor, maxEquipes);
  };

  const handleMaxEquipes = (e) => {
    const qtd = Number(e.target.value);
    setMaxEquipes(qtd);
    calcularValorEquipe(valorPremiacao, qtd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (tipo === "PAGO" && (!valorPremiacao || Number(valorPremiacao) <= 0)) {
      setError("Informe um valor válido para a premiação do campeonato pago.");
      setLoading(false);
      return;
    }

    try {
      const novoCampeonato = {
        descricao,
        imagemCampeonato: imagem,
        tipo,
        status,
        maxEquipes,
        criadorId: userId,
        valorPorEquipe: tipo === "PAGO" ? Number(valorEquipe) : 0,
        valorPremiacao: tipo === "PAGO" ? Number(valorPremiacao) : 0,
      };

      await axios.post("http://localhost:8080/api/campeonatos", novoCampeonato);
      alert("✅ Campeonato criado com sucesso!");
      navigate("/campeonatos");
    } catch (err) {
      setError("❌ Erro ao criar campeonato. Tente novamente.");
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
          {/* Descrição */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">
              Descrição do Campeonato:
            </label>
            <input
              type="text"
              className="campeonatos-create-input"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Campeonato R6 Brasil"
              required
            />
          </div>

          {/* Imagem */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Imagem do Campeonato:</label>
            <input
              type="file"
              accept="image/*"
              className="campeonatos-create-input"
              onChange={handleImageChange}
            />
            {imagem && (
              <img
                src={imagem}
                alt="Prévia"
                className="campeonatos-create-preview"
              />
            )}
          </div>

          {/* Tipo */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Tipo:</label>
            <select
              className="campeonatos-create-select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="GRATIS">Grátis</option>
              <option value="PAGO">Pago</option>
            </select>
          </div>

          {/* Número de equipes */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">
              Número máximo de equipes:
            </label>
            <select
              className="campeonatos-create-select"
              value={maxEquipes}
              onChange={handleMaxEquipes}
            >
              {[4, 8, 12, 16, 32, 64].map((qtd) => (
                <option key={qtd} value={qtd}>
                  {qtd} equipes
                </option>
              ))}
            </select>
          </div>

          {/* Valor de premiação */}
          {tipo === "PAGO" && (
            <>
              <div className="campeonatos-create-field">
                <label className="campeonatos-create-label">
                  Valor da Premiação (R$):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="campeonatos-create-input"
                  value={valorPremiacao}
                  onChange={handleValorPremiacao}
                  placeholder="Ex: 800"
                  required
                />
              </div>

              <div className="campeonatos-create-field">
                <p className="campeonatos-create-info">
                  💰 Cada equipe deve pagar: <strong>R$ {valorEquipe}</strong>
                </p>
              </div>
            </>
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
