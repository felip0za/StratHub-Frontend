import React, { useEffect, useState } from 'react';
import './ListarCampeonatos.css';
import Navbar from '../../../Components/Navbar/Navbar';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import { useAuth } from '../../../contexts/AuthContext';

const ListarCampeonatos = () => {
  const [campeonatos, setCampeonatos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [equipesPorCampeonato, setEquipesPorCampeonato] = useState({});

  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    const fetchCampeonatos = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/campeonatos/criador/${userId}`);
        setCampeonatos(response.data);
        const inscritosObj = {};
        await Promise.all(
          response.data.map(async (c) => {
            try {
              const countResp = await api.get(`/inscricoes/campeonato/${c.id}/count`);
              inscritosObj[c.id] = countResp.data;
            } catch {
              inscritosObj[c.id] = 0;
            }
          })
        );
        setEquipesPorCampeonato(inscritosObj);
      } catch (err) {
        console.error('Erro ao buscar campeonatos:', err);
        setError('❌ Erro ao carregar campeonatos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampeonatos();
  }, [api, userId]);

  const campeonatosFiltrados = campeonatos.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
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

  const formatarData = (data) =>
    data ? new Date(data).toLocaleDateString('pt-BR') : '—';

  const formatarFormato = (formato) => {
    switch (formato) {
      case 'FASE_DE_GRUPOS_E_ELIMINATORIAS': return 'Grupos + Eliminatórias';
      case 'TABELA_ELIMINATORIAS':           return 'Tabela + Eliminatórias';
      default:                               return '—';
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <div className="listar-page">

        {/* ── Header ── */}
        <div className="listar-page-header">
          <div className="listar-page-header-inner">
            <div>
              <h1 className="listar-page-title">🏆 Meus Campeonatos</h1>
              <p className="listar-page-subtitle">Gerencie seus torneios</p>
            </div>
            <div className="listar-page-actions">
              <button className="btn-primary" onClick={() => navigate('/criar-campeonatos')}>
                + Criar Campeonato
              </button>
              <button className="btn-ghost" onClick={() => navigate('/campeonatos')}>
                ← Voltar
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="listar-body">
          {error && <div className="listar-error">{error}</div>}

          <div className="listar-search-wrap">
            <span className="listar-search-icon">🔎</span>
            <input
              type="text"
              className="listar-search"
              placeholder="Buscar por nome do campeonato..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          {campeonatosFiltrados.length === 0 && !error ? (
            <div className="listar-empty">
              <span className="listar-empty-icon">🏟️</span>
              <p>Você ainda não criou nenhum campeonato.</p>
              <button className="btn-primary" onClick={() => navigate('/criar-campeonatos')}>
                + Criar primeiro campeonato
              </button>
            </div>
          ) : (
            <div className="listar-table-wrap">
              <table className="listar-table">
                <thead>
                  <tr>
                    <th>Campeonato</th>
                    <th>Formato</th>
                    <th>Equipes</th>
                    <th>Tipo</th>
                    <th>Prêmio</th>
                    <th>Início</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {campeonatosFiltrados.map((c) => {
                    const imagemCampeonato =
                      c.imagemCampeonato && c.imagemCampeonato.length > 100
                        ? `data:image/png;base64,${c.imagemCampeonato}`
                        : null;
                    const status = formatarStatus(c.status);
                    const inscritosCount = equipesPorCampeonato[c.id] ?? 0;

                    return (
                      <tr key={c.id}>
                        <td>
                          <div className="listar-camp-cell">
                            <div className="listar-camp-img">
                              {imagemCampeonato
                                ? <img src={imagemCampeonato} alt={c.nome} />
                                : <span>🏆</span>
                              }
                            </div>
                            <div className="listar-camp-info">
                              <span className="listar-camp-nome">{c.nome}</span>
                              {c.descricao && (
                                <span className="listar-camp-desc">{c.descricao.slice(0, 50)}{c.descricao.length > 50 ? '…' : ''}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="listar-format-badge">{formatarFormato(c.formatoCampeonato)}</span>
                        </td>
                        <td>
                          <div className="listar-equipes-cell">
                            <span className="listar-equipes-num">{inscritosCount}</span>
                            <span className="listar-equipes-max">/ {c.maxEquipes}</span>
                            <div className="listar-equipes-bar">
                              <div
                                className="listar-equipes-fill"
                                style={{ width: `${Math.min((inscritosCount / c.maxEquipes) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`listar-tipo-badge ${c.tipo === 'GRATUITO' ? 'free' : 'paid'}`}>
                            {c.tipo === 'GRATUITO' ? 'Gratuito' : 'Pago'}
                          </span>
                        </td>
                        <td>
                          <span className="listar-valor">
                            {c.valor !== null ? `R$ ${Number(c.valor).toFixed(2)}` : '—'}
                          </span>
                        </td>
                        <td>
                          <span className="listar-data">{formatarData(c.dataInicio)}</span>
                        </td>
                        <td>
                          <span className={`listar-status-badge ${status.classe}`}>{status.texto}</span>
                        </td>
                        <td>
                          <button
                            className="listar-btn-editar"
                            onClick={() => navigate(`/info-campeonato/${c.id}`)}
                          >
                            Editar
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

export default ListarCampeonatos;