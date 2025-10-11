import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import LoadingScreen from "../../../Components/LoadingScreen/LoadingScreen";
import { useApi } from "../../../Services/API";
import { useAuth } from "../../../contexts/AuthContext";
import "./CampeonatosDetalhes.css";

function CampeonatosDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { token } = useAuth();

  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchCampeonato = async () => {
      try {
        const response = await api.get(`/campeonatos/${id}`);
        setCampeonato(response.data);
      } catch (err) {
        console.error("Erro ao buscar campeonato:", err);
        setErro("Erro ao carregar informações do campeonato.");
      } finally {
        setLoading(false);
      }
    };
    fetchCampeonato();
  }, [api, id]);

  if (loading) return <LoadingScreen />;

  if (erro)
    return (
      <>
        <Navbar />
        <div className="erro-msg">{erro}</div>
      </>
    );

  if (!campeonato) return <div className="sem-dados">Campeonato não encontrado.</div>;

  const formatarImagem = (img) => {
    if (!img) return "/placeholder_banner.png";
    return img.startsWith("data:image") ? img : `data:image/png;base64,${img}`;
  };

  const imagemCriador = campeonato.criador?.imagemUsuario
    ? campeonato.criador.imagemUsuario.startsWith("data:image")
      ? campeonato.criador.imagemUsuario
      : `data:image/png;base64,${campeonato.criador.imagemUsuario}`
    : "/default-user.png";

  return (
    <>
      <Navbar />
      <div className="campeonato-detalhes-container">
        {/* ===== HEADER / BANNER ===== */}
        <div
          className="header-campeonato"
          style={{
            backgroundImage: `url(${formatarImagem(
              campeonato.imagemCampeonato || campeonato.te_imagem_campeonato || campeonato.imagem
            )})`,
          }}
        >
          <div className="overlay-header">
            <div className="info-topo">
              <div>
                <h1>{campeonato.nome || campeonato.te_nome}</h1>
                <p>
                  Torneio{" "}
                  {campeonato.tipo === "GRATUITO" || campeonato.tp_tipo === "GRATUITO"
                    ? "Grátis"
                    : "Pago"}
                </p>
              </div>
              <button className="btn-participar">Participar do Torneio</button>
            </div>
          </div>
        </div>

        {/* ===== CONTEÚDO ===== */}
        <div className="conteudo-campeonato">
          {/* COLUNA ESQUERDA */}
          <div className="coluna-esquerda">
            <div className="card-info">
              <h3>Formato</h3>
              <div className="info-linha">
                <div>
                  <p>💰 Prêmio total</p>
                  <span>
                    R${" "}
                    {parseFloat(
                      campeonato.valor || campeonato.nm_valor || campeonato.valorPremio || 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div>
                  <p>💵 Valor por equipe</p>
                  <span>
                    R${" "}
                    {parseFloat(
                      campeonato.valorPorEquipe || campeonato.nm_valor_por_equipe || 0
                    ).toFixed(2)}
                  </span>
                </div>
                <div>
                  <p>👥 Máx. Equipes</p>
                  <span>{campeonato.maxEquipes || campeonato.nm_max_equipes}</span>
                </div>
              </div>
            </div>

            {/* ===== ORGANIZADOR ===== */}
            <div className="card-info">
              <h3>Organizador</h3>
              <span className="nome-criador">Organizado por</span>
              <button className="btn-criador">
                <img
                  src={imagemCriador}
                  alt={campeonato.criador?.nome || "Desconhecido"}
                  className="img-criador"
                />
                <span className="nome-criador">{campeonato.criador?.nome || "Desconhecido"}</span>
              </button>
            </div>

            {/* ===== INFORMAÇÕES ADICIONAIS ===== */}
            <div className="card-info">
              <h3>Informações adicionais</h3>
              <p>
                Criado em:{" "}
                <b>
                  {new Date(campeonato.dataInicio || campeonato.dt_inicio).toLocaleDateString(
                    "pt-BR"
                  )}
                </b>
              </p>
              <p>Status: <b>{campeonato.status || "Em andamento"}</b></p>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="coluna-direita">
            <div className="card-info">
              <h3>Equipes</h3>
              {campeonato.times && campeonato.times.length > 0 ? (
                <div className="equipes-box">
                  {campeonato.times.map((t, i) => (
                    <div key={i} className="time-item">
                      <img
                        src={t.logo ? `data:image/png;base64,${t.logo}` : "https://via.placeholder.com/40"}
                        alt={t.nome}
                      />
                      <span>{t.nome}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Nenhuma equipe cadastrada ainda.</p>
              )}
            </div>

            <div className="card-info">
              <h3>Configurações do jogo</h3>
              <p>
                <b>Plataforma:</b> {campeonato.plataforma || "-"}
              </p>
              {campeonato.plataforma === "CONSOLE" && (
                <p>
                  <b>Tipo de console:</b>{" "}
                  {campeonato.console === "XBOX"
                    ? "Xbox"
                    : campeonato.console === "PS"
                    ? "PlayStation"
                    : campeonato.console === "AMBOS"
                    ? "Xbox / PlayStation"
                    : "-"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CampeonatosDetalhes;
