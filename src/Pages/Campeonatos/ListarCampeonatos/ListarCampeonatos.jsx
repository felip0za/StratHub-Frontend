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

  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();
  const userId = user?.id;

  const handleCriarCampeonato = () => navigate('/criar-campeonatos');
  const handleVoltar = () => navigate('/campeonatos');

  useEffect(() => {
    if (!userId) return;

    const fetchCampeonatos = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/campeonatos/meus/${userId}`);
        setCampeonatos(response.data);
      } catch (err) {
        console.error('Erro ao buscar campeonatos do usuário:', err);
        setError('❌ Erro ao carregar campeonatos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampeonatos();
  }, [api, userId]);

  const filtrarCampeonatos = (lista) => {
    const termo = filtro.toLowerCase();
    return lista.filter((c) => c.nome.toLowerCase().includes(termo));
  };

  const campeonatosFiltrados = filtrarCampeonatos(campeonatos);

  // Função para formatar o status
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

  // Função para formatar datas apenas com DD/MM/YYYY
  const formatarData = (data) => {
    return data ? new Date(data).toLocaleDateString('pt-BR') : '-';
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Navbar />
      <div className="campeonatos-page">
        <div className="campeonatos-header">
          <h1>🏆 Meus Campeonatos</h1>
          <div className="header-buttons">
            <button className="btn-criar" onClick={handleCriarCampeonato}>
              + Criar Campeonato
            </button>
            <button className="btn-voltar" onClick={handleVoltar}>
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
                  <th>Descrição</th>
                  <th>Máx. Equipes</th>
                  <th>Tipo</th>
                  <th>Valor por Equipe</th>
                  <th>Prêmio</th>
                  <th>Data Início</th>
                  <th>Data Fim</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {campeonatosFiltrados.length > 0 ? (
                  campeonatosFiltrados.map((c) => {
                    const imagemCampeonato =
                      c.imagemCampeonato && c.imagemCampeonato.length > 100
                        ? `data:image/png;base64,${c.imagemCampeonato}`
                        : "https://via.placeholder.com/50?text=Sem+Imagem";

                    const status = formatarStatus(c.status);

                    return (
                      <tr key={c.id}>
                        <td>
                          <img
                            src={imagemCampeonato}
                            alt={c.nome}
                            className="campeonato-img"
                          />
                        </td>
                        <td>{c.nome}</td>
                        <td>{c.descricao || '-'}</td>
                        <td>{c.maxEquipes}</td>
                        <td>{c.tipo === 'GRATUITO' ? 'Gratuito' : 'Pago'}</td>
                        <td>
                          {c.tipo === 'GRATUITO'
                            ? 'Gratuito'
                            : c.valorPorEquipe
                            ? `R$ ${Number(c.valorPorEquipe).toFixed(2)}`
                            : 'R$ 0,00'}
                        </td>
                        <td>
                          {c.valor !== null ? `R$ ${Number(c.valor).toFixed(2)}` : '-'}
                        </td>
                        <td>{formatarData(c.dataInicio)}</td>
                        <td>{c.dataFim ? formatarData(c.dataFim) : 'A definir'}</td>
                        <td className={status.classe}>{status.texto}</td>
                        <td>
                          <button
                            className="btn-info"
                            onClick={() => navigate(`/info-campeonato/${c.id}`)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="nenhum">
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

export default ListarCampeonatos;
