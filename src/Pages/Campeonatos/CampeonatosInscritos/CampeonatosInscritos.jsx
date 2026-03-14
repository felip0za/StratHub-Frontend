import React, { useEffect, useState } from 'react';
import './CampeonatosInscritos.css';
import Navbar from '../../../Components/Navbar/Navbar';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import { useAuth } from '../../../contexts/AuthContext';

const CampeonatosInscritos = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setError('⚠️ Usuário não autenticado.'); return; }

    const fetchCampeonatosDoTime = async () => {
      try {
        setLoading(true);
        const response = await api.get('/inscricoes/listaInscritos');
        setInscricoes(Array.isArray(response.data) ? response.data : []);
        setError('');
      } catch (err) {
        console.error('Erro ao buscar campeonatos do time:', err);
        if (err.response?.status === 400) {
          setError(err.response.data || '⚠️ Você não possui um time.');
        } else {
          setError('❌ Erro ao carregar campeonatos do time. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCampeonatosDoTime();
  }, [api, user]);

  const inscricoesFiltradas = inscricoes.filter((i) =>
    i?.nomeCampeonato?.toLowerCase().includes(filtro.toLowerCase())
  );

  const formatarStatus = (status) => {
    switch (status) {
      case 'ABERTO':
      case 'ATIVO':        return { texto: 'Aberto',       classe: 'aberto' };
      case 'EM_ANDAMENTO': return { texto: 'Em Andamento', classe: 'em_andamento' };
      case 'FECHADO':      return { texto: 'Fechado',      classe: 'fechado' };
      default:             return { texto: '—',            classe: '' };
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <div className="ins-page">

        {/* ── Header ── */}
        <div className="ins-page-header">
          <div className="ins-page-header-inner">
            <div>
              <h1 className="ins-page-title">🏆 Campeonatos Inscritos</h1>
              <p className="ins-page-subtitle">Acompanhe seus torneios</p>
            </div>
            <button className="btn-ghost" onClick={() => navigate('/campeonatos')}>
              ← Voltar
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="ins-body">
          {error && <div className="ins-error">{error}</div>}

          <div className="ins-search-wrap">
            <span className="ins-search-icon">🔎</span>
            <input
              type="text"
              className="ins-search"
              placeholder="Buscar por nome do campeonato..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          {inscricoesFiltradas.length === 0 && !error ? (
            <div className="ins-empty">
              <span className="ins-empty-icon">🏟️</span>
              <p>Nenhum campeonato encontrado.</p>
            </div>
          ) : (
            <div className="ins-table-wrap">
              <table className="ins-table">
                <thead>
                  <tr>
                    <th>Campeonato</th>
                    <th>Grupo</th>
                    <th>Posição</th>
                    <th>Pontuação</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {inscricoesFiltradas.map((inscricao) => {
                    const imagemCampeonato =
                      inscricao.imagemCampeonato?.length > 100
                        ? `data:image/png;base64,${inscricao.imagemCampeonato}`
                        : null;
                    const status = formatarStatus(inscricao.status);

                    return (
                      <tr key={inscricao.idInscricao}>
                        <td>
                          <div className="ins-camp-cell">
                            <div className="ins-camp-img">
                              {imagemCampeonato
                                ? <img src={imagemCampeonato} alt={inscricao.nomeCampeonato} />
                                : <span>🏆</span>
                              }
                            </div>
                            <span className="ins-camp-nome">{inscricao.nomeCampeonato}</span>
                          </div>
                        </td>
                        <td><span className="ins-grupo-badge">{inscricao.grupo ?? '—'}</span></td>
                        <td>
                          <span className={`ins-posicao ${inscricao.posicao <= 3 ? `top-${inscricao.posicao}` : ''}`}>
                            {inscricao.posicao != null ? `${inscricao.posicao}°` : '—'}
                          </span>
                        </td>
                        <td>
                          <span className="ins-pts">{inscricao.pontuacao ?? 0} pts</span>
                        </td>
                        <td>
                          <span className={`ins-status-badge ${status.classe}`}>{status.texto}</span>
                        </td>
                        <td>
                          <button
                            className="ins-btn-ver"
                            onClick={() => navigate(`/info-campeonato/${inscricao.idCampeonato}`)}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CampeonatosInscritos;
