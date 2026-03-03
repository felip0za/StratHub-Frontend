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

    if (!user) {
      setError('⚠️ Usuário não autenticado.');
      return;
    }

    const fetchCampeonatosDoTime = async () => {
      try {
        setLoading(true);

        // ✅ agora o backend resolve o time automaticamente
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

  const filtrarInscricoes = (lista) => {
    const termo = filtro.toLowerCase();
    return lista.filter((inscricao) =>
      inscricao?.nomeCampeonato?.toLowerCase().includes(termo)
    );
  };

  const inscricoesFiltradas = filtrarInscricoes(inscricoes);

  const formatarStatus = (status) => {
    switch (status) {
      case 'ABERTO':
      case 'ATIVO':
        return { texto: 'Aberto', classe: 'status-ativo' };
      case 'EM_ANDAMENTO':
        return { texto: 'Em andamento', classe: 'status-em-andamento' };
      case 'FECHADO':
        return { texto: 'Fechado', classe: 'status-finalizado' };
      default:
        return { texto: '-', classe: '' };
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <div className="campeonatos-page">
        <div className="campeonatos-header">
          <h1>🏆 Campeonatos inscritos</h1>
          <div className="header-buttons">
            <button className="btn-voltar" onClick={() => navigate('/campeonatos')}>
              Voltar
            </button>
          </div>
        </div>

        <div className="campeonatos-container">
          <input
            type="text"
            className="campo-pesquisa"
            placeholder="🔎 Buscar por nome do campeonato..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />

          {error && <p className="erro">{error}</p>}

          <div className="tabela-container">
            <table className="tabela-campeonatos">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Grupo</th>
                  <th>Posição</th>
                  <th>Pontuação</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {inscricoesFiltradas.length > 0 ? (
                  inscricoesFiltradas.map((inscricao) => {
                    const imagemCampeonato =
                      inscricao.imagemCampeonato?.length > 100
                        ? `data:image/png;base64,${inscricao.imagemCampeonato}`
                        : 'https://via.placeholder.com/50?text=Sem+Imagem';

                    const status = formatarStatus(inscricao.status);

                    return (
                      <tr key={inscricao.idInscricao}>
                        <td>
                          <img
                            src={imagemCampeonato}
                            alt={inscricao.nomeCampeonato}
                            className="campeonato-img"
                          />
                        </td>
                        <td>{inscricao.nomeCampeonato}</td>
                        <td>{inscricao.grupo ?? '-'}</td>
                        <td>{inscricao.posicao ?? '-'}</td>
                        <td>{inscricao.pontuacao ?? 0}</td>
                        <td className={status.classe}>{status.texto}</td>
                        <td>
                          <button
                            className="btn-info"
                            onClick={() =>
                              navigate(`/info-campeonato/${inscricao.idCampeonato}`)
                            }
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="nenhum">
                      Nenhum campeonato encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default CampeonatosInscritos;
