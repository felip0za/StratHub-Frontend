import React, { useEffect, useState } from 'react';
import './InfoEditCampeonatos.css';
import Navbar from '../../../Components/Navbar/Navbar';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';

const InfoEditCampeonatos = () => {
  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    const fetchCampeonato = async () => {
      try {
        const response = await api.get(`/campeonatos/${id}`);
        setCampeonato(response.data);
      } catch (err) {
        console.error('Erro ao buscar campeonato:', err);
        setError('❌ Erro ao carregar informações do campeonato.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampeonato();
  }, [api, id]);

  const handleEditar = () => navigate(`/editar-campeonato/${id}`);
  const handleVoltar = () => navigate('/campeonatos');

  // Função helper para garantir que a imagem sempre tenha o prefixo base64 correto
  const formatarImagem = (img) => {
    if (!img || img === '') return 'https://via.placeholder.com/200?text=Sem+Imagem';
    return img.startsWith('data:image') ? img : `data:image/png;base64,${img}`;
  };

  if (loading) return <LoadingScreen />;
  if (error) return (
    <>
      <Navbar />
      <div className="erro-msg">{error}</div>
    </>
  );
  if (!campeonato) return null;

  return (
    <>
      <Navbar />
      <div className="detalhes-pagina">
        <div className="detalhes-box">

          {/* HEADER */}
          <div className="header-box">
            <div className="logo-box">
              <img src={formatarImagem(campeonato.imagemCampeonato)} alt={campeonato.nome} />
            </div>
            <div className="info-box">
              <h1>{campeonato.nome}</h1>
              <div className="tags-box">
                <span className={`tag-tipo ${campeonato.tipo.toLowerCase()}`}>
                  {campeonato.tipo}
                </span>
                <span className={`tag-status ${campeonato.status.toLowerCase()}`}>
                  {campeonato.status}
                </span>
              </div>
              <p>{campeonato.dataInicio} - {campeonato.dataFim}</p>
              <p>Entrada: {campeonato.tipo === 'GRATUITO' ? 'Gratuito' : `R$ ${Number(campeonato.valor || 0).toFixed(2)}`}</p>
              <p>Prêmio: {campeonato.premio || '-'}</p>
            </div>
            <div className="botoes-box">
              <button className="btn-editar" onClick={handleEditar}>Editar</button>
              <button className="btn-voltar" onClick={handleVoltar}>Voltar</button>
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <div className="card-desc">
            <h2>Descrição</h2>
            <p>{campeonato.descricao || '-'}</p>
          </div>

          {/* EQUIPES */}
          {campeonato.equipes && campeonato.equipes.length > 0 && (
            <div className="card-equipes">
              <h2>Equipes Participantes</h2>
              <ul>
                {campeonato.equipes.map((time, idx) => (
                  <li key={idx}>
                    {time.nome} {time.logo && <img src={formatarImagem(time.logo)} alt={time.nome} className="logo-time" />}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CHAVEAMENTO */}
          {campeonato.chaves && Object.keys(campeonato.chaves).length > 0 && (
            <div className="card-chaves">
              <h2>Chaveamento</h2>
              <div className="grid-chaves">
                {Object.entries(campeonato.chaves).map(([grupo, times]) => (
                  <div key={grupo} className="grupo-chaves">
                    <h3>Grupo {grupo}</h3>
                    {times.map((item, idx) => (
                      <p key={idx}>{item.time} - {item.pontos} pts</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ELIMINATÓRIAS */}
          {campeonato.imagemEliminatorias && (
            <div className="card-eliminatorias">
              <h2>Eliminatórias</h2>
              <img src={formatarImagem(campeonato.imagemEliminatorias)} alt="Eliminatórias" />
            </div>
          )}

          {/* CAMPEÃO */}
          {campeonato.campeao && (
            <div className="card-campeao">
              <h2>Campeão</h2>
              <div className="info-campeao">
                <img src={formatarImagem(campeonato.campeao.logo)} alt={campeonato.campeao.nome} />
                <span>{campeonato.campeao.nome}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default InfoEditCampeonatos;
