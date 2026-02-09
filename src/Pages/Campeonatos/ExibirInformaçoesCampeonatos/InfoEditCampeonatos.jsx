import React, { useEffect, useState } from 'react';
import './InfoEditCampeonatos.css';
import Navbar from '../../../Components/Navbar/Navbar';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import avatarDefault from '../../../assets/avatar-default.png';
import { useAuth } from '../../../contexts/AuthContext';

const handleClickTeam = (timeId, navigate) => {
  if (timeId) navigate(`/times/${timeId}`);
};

const Chaveamento = ({ grupos, maxEquipes }) => {
    const navigate = useNavigate();
    const letrasGrupos = ['A', 'B', 'C', 'D'].slice(0, Math.ceil(maxEquipes / 4));

    const gruposDinamicos = {};

  letrasGrupos.forEach((letra) => {
    const grupo = grupos[letra] || [];

    // 🔥 Ordena o grupo por pontuação (maior → menor)
    const grupoOrdenadoPorPontos = [...grupo].sort((a, b) => {
      const pontosA = Number(a.pontuacao) || 0;
      const pontosB = Number(b.pontuacao) || 0;
      return pontosB - pontosA;
    });

    // 🔥 Mantém um array fixo de 4 slots (com null para mostrar os ícones de times vazios)
    const grupoFinal = Array(4).fill(null);

    grupoOrdenadoPorPontos.forEach((time, index) => {
      if (index < 4) grupoFinal[index] = time;
    });

    gruposDinamicos[letra] = grupoFinal;
  });


  return (
    <div className="chaveamento-box">
      <h2>CHAVEAMENTO</h2>
      <div className="grupos-container">
        {letrasGrupos.map((letra) => (
          <div key={letra} className="grupo">
            <h3>Grupo {letra}</h3>
            <div className="grupo-times">
              {gruposDinamicos[letra].map((time, index) => (
                <div key={index} className="time-card">
                  <div className="posicao-label">{index + 1}°</div>
                  <div
                    className="time-box"
                    onClick={() => handleClickTeam(time?.id, navigate)}
                    style={{ cursor: time?.id ? 'pointer' : 'default' }}
                  >
                    <img
                      className="time-logo"
                      src={time?.logo || avatarDefault}
                      alt={time?.nome || '-'}
                    />
                    <div className="time-info">
                      <span className="time-nome">{time?.nome || '-'}</span>
                      <span className="time-pontos">{time?.pontuacao ?? 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabelaEliminatorias = ({ grupos, times, maxEquipes }) => {
  const navigate = useNavigate();
  const timesOrdenados = Array.from({ length: maxEquipes }, (_, i) => {
    const time = times?.find(t => t.posicao === i + 1);
    return time || { nome: '-', pontuacao: 0, posicao: i + 1, logo: null };
  });

  return (
    <div className="tabela-eliminatorias-box">
      <h2>TABELA</h2>
      <div className="grupo-times">
        {timesOrdenados.map((time, i) => (
          <div key={i} className="time-card">
            <div className="posicao-label">{time.posicao}°</div>
            <div
              className="time-box"
              onClick={() => handleClickTeam(time?.id, navigate)}
              style={{ cursor: time?.id ? 'pointer' : 'default' }}
            >
              <img
                className="time-logo"
                src={time.logo || avatarDefault}
                alt={time.nome || '-'}
              />
              <div className="time-info">
                <span className="time-nome">{time.nome || '-'}</span>
                <span className="time-pontos">{time.pontuacao ?? 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// === PARTIDAS DE GRUPOS ===
const PartidasGrupos = ({ grupos }) => {
  const letras = ['A', 'B', 'C', 'D'];
  const [grupoSelecionado, setGrupoSelecionado] = useState('A');
  const navigate = useNavigate();

  const times = grupos[grupoSelecionado] || [];

  // garante 4 times
  const lista = [...times].slice(0, 4);
  while (lista.length < 4) {
    lista.push({ nome: '-', pontuacao: 0, logo: null });
  }

  // 🔥 tabela fixa para 4 times (round-robin)
  const semanas = [
    [
      { time1: lista[0], time2: lista[2] },
      { time1: lista[1], time2: lista[3] },
    ],
    [
      { time1: lista[3], time2: lista[0] },
      { time1: lista[2], time2: lista[1] },
    ],
    [
      { time1: lista[2], time2: lista[3] },
      { time1: lista[1], time2: lista[0] },
    ],
  ];

  return (
    <div className="partidas-grupos-box">
      <div className="grupo-select-box">
        <label>GRUPO: </label>
        <select value={grupoSelecionado} onChange={(e) => setGrupoSelecionado(e.target.value)}>
          {letras.map((letra) => (
            <option key={letra} value={letra}>{letra}</option>
          ))}
        </select>
      </div>

      {semanas.map((partidasSemana, idx) => (
        <div key={idx} className="semana-box">
          <h4>SEMANA {idx + 1}</h4>

          {partidasSemana.map((p, i) => (
            <div key={i} className="partida-item">

              <div className="time">
                {p.time1.logo && (
                  <img
                    src={p.time1.logo}
                    alt={p.time1.nome}
                    onClick={() => p.time1.id && navigate(`/times/${p.time1.id}`)}
                  />
                )}
                <span className="nome-time">{p.time1.nome}</span>
              </div>

              <span className="pontos-time">{p.time1.pontuacao || 0}</span>
              <span className="vs">VS</span>
              <span className="pontos-time">{p.time2.pontuacao || 0}</span>

              <div className="time">
                {p.time2.logo && (
                  <img
                    src={p.time2.logo}
                    alt={p.time2.nome}
                    onClick={() => p.time2.id && navigate(`/times/${p.time2.id}`)}
                  />
                )}
                <span className="nome-time">{p.time2.nome}</span>
              </div>

            </div>
          ))}
        </div>
      ))}
    </div>
  );
};


// === PARTIDAS SIMPLES ===
const PartidasSimples = ({ times, maxEquipes }) => {
  const navigate = useNavigate();
  const [semanaSelecionada, setSemanaSelecionada] = useState(1);

  const timesOrdenados = Array.from({ length: maxEquipes }, (_, i) => {
    const time = times?.find(t => t.posicao === i + 1);
    return time || { nome: '-', pontuacao: 0, logo: null };
  });

  let listaTimes = [...timesOrdenados];
  if (listaTimes.length % 2 !== 0) listaTimes.push({ nome: 'Descansa', bye: true });

  const numSemanas = listaTimes.length - 1;
  const numPartidasPorSemana = listaTimes.length / 2;

  const semanas = [];
  let arr = [...listaTimes];

  for (let r = 0; r < numSemanas; r++) {
    const partidasSemana = [];

    for (let i = 0; i < numPartidasPorSemana; i++) {
      const time1 = arr[i];
      const time2 = arr[arr.length - 1 - i];
      partidasSemana.push({ time1, time2 });
    }

    semanas.push(partidasSemana);
    arr = [arr[0], ...arr.slice(2), arr[1]];
  }

  const partidas = semanas[semanaSelecionada - 1] || [];

  return (
    <div className="partidas-grupos-box">
      <div className="grupo-select-box">
        <label>SEMANA: </label>
        <select 
          value={semanaSelecionada} 
          onChange={(e) => setSemanaSelecionada(Number(e.target.value))}
        >
          {Array.from({ length: numSemanas }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Semana {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="semana-box">
        <h4>SEMANA {semanaSelecionada}</h4>

        {partidas.map((p, idx) => (
          <div key={idx} className="partida-item">
            <h4 className="titulo-jogo">JOGO {idx + 1}</h4>

            <div className="time">
              {!p.time1.bye && p.time1.logo && (
                <img
                  src={p.time1.logo}
                  alt={p.time1.nome}
                  onClick={() => p.time1.id && navigate(`/times/${p.time1.id}`)}
                />
              )}
              <span className="nome-time">{p.time1.nome}</span>
            </div>

            {!p.time1.bye && !p.time2.bye ? (
              <>
                <span className="pontos-time">{p.time1.pontuacao || 0}</span>
                <span className="vs">VS</span>
                <span className="pontos-time">{p.time2.pontuacao || 0}</span>
              </>
            ) : (
              <span className="vs">—</span>
            )}

            <div className="time">
              {!p.time2.bye && p.time2.logo && (
                <img
                  src={p.time2.logo}
                  alt={p.time2.nome}
                  onClick={() => p.time2.id && navigate(`/times/${p.time2.id}`)}
                />
              )}
              <span className="nome-time">{p.time2.nome}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// === COMPONENTE PRINCIPAL ===
const InfoEditCampeonatos = () => {
  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editImagem, setEditImagem] = useState('');
  const [previewImagem, setPreviewImagem] = useState('');
  const [saving, setSaving] = useState(false);

  const [abaSelecionada, setAbaSelecionada] = useState('informacoes');
  const [timesInscritos, setTimesInscritos] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const responseCampeonato = await api.get(`/campeonatos/${id}`);
        const campeonatoData = formatarDatas(responseCampeonato.data);
        setCampeonato(campeonatoData);

        const responseInscricoes = await api.get(`/inscricoes/campeonato/${id}/times`);
        const inscricoes = responseInscricoes.data;

        const grupos = { A: [], B: [], C: [], D: [] };

        for (const inscricao of inscricoes) {
          try {
            const responseTime = await api.get(`/times/${inscricao.idTime}`);
            const timeData = responseTime.data;

            const grupo = inscricao.grupo || 'A';
            if (!grupos[grupo]) grupos[grupo] = [];

            const imagemTime = timeData.imagemBase64
              ? (timeData.imagemBase64.startsWith('data:image')
                  ? timeData.imagemBase64
                  : `data:image/png;base64,${timeData.imagemBase64}`)
              : avatarDefault;

            grupos[grupo].push({
              id: timeData.id,
              nome: timeData.nome,
              logo: imagemTime,
              pontuacao: inscricao.pontuacao || 0,
            });
          } catch (err) {
            console.error(`Erro ao buscar dados do time ${inscricao.idTime}:`, err);
          }
        }

        setTimesInscritos(grupos);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('❌ Erro ao carregar informações do campeonato.');
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [api, id]);


  const handleVoltar = () => navigate('/campeonatos');

  const formatarDatas = (campeonato) => {
    if (campeonato.dataInicio) campeonato.dataInicio = campeonato.dataInicio.split('T')[0];
    if (campeonato.dataFim) campeonato.dataFim = campeonato.dataFim.split('T')[0];
    return campeonato;
  };

  const formatarImagem = (img) => {
    if (!img || img === '') return 'https://via.placeholder.com/200?text=Sem+Imagem';
    return img.startsWith('data:image') ? img : `data:image/png;base64,${img}`;
  };

  const formatarStatus = (status) => {
    if (!status) return '';
    return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const abrirModal = () => {
    setEditNome(campeonato.nome);
    setEditStatus(campeonato.status === 'ABERTO' ? 'EM_ANDAMENTO' : campeonato.status);
    setEditImagem(campeonato.imagemCampeonato || '');
    setPreviewImagem(formatarImagem(campeonato.imagemCampeonato));
    setModalOpen(true);
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setEditImagem(base64);
      setPreviewImagem(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSalvarEdicao = async () => {
    setSaving(true);
    try {
      const payload = {
        nome: editNome,
        descricao: campeonato.descricao,
        status: editStatus,
        imagemCampeonato: editImagem || null
      };

      await api.put(`/campeonatos/${id}`, payload);
      alert('✅ Campeonato atualizado com sucesso!');
      setModalOpen(false);

      const response = await api.get(`/campeonatos/${id}`);
      setCampeonato(formatarDatas(response.data));
    } catch (err) {
      console.error('Erro ao atualizar campeonato:', err);
      alert('❌ Erro ao atualizar campeonato.');
    } finally {
      setSaving(false);
    }
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

          {/* ABA */}
          <div className="aba-selector">
            <button
              className={abaSelecionada === 'informacoes' ? 'aba-btn ativo' : 'aba-btn'}
              onClick={() => setAbaSelecionada('informacoes')}
            >
              Informações
            </button>
            <button
              className={abaSelecionada === 'partidas' ? 'aba-btn ativo' : 'aba-btn'}
              onClick={() => setAbaSelecionada('partidas')}
            >
              Partidas
            </button>
          </div>

          {/* INFORMAÇÕES */}
          {abaSelecionada === 'informacoes' && (
            <>
              <div className="header-box">
                <div className="logo-box">
                  <img src={formatarImagem(campeonato.imagemCampeonato)} alt={campeonato.nome} />
                </div>

                <div className="info-box">
                  <h1>{campeonato.nome}</h1>
                  
                  <div className="tags-box">
                    <span className={`tag-tipo ${campeonato.tipo.toLowerCase()}`}>
                      {campeonato.tipo === 'GRATUITO' ? 'Gratuito' : 'Pago'}
                    </span>
                    <span className={`tag-status ${campeonato.status.toLowerCase()}`}>
                      {formatarStatus(campeonato.status)}
                    </span>
                  </div>

                  <div className="info-dados">
                    <div className="info-item">
                      <strong>Data de Início📅:</strong> {campeonato.dataInicio}
                    </div>
                    <div className="info-item">
                      <strong>Data de Fim📅:</strong> {campeonato.dataFim || 'A ser definido'}
                    </div>
                    <div className="info-item">
                      <strong>Prêmio💵:</strong> {campeonato.premio !== null ? `R$ ${Number(campeonato.valor || 0).toFixed(2)}` : '-'}
                    </div>
                    <div className="info-item">
                      <strong>Entrada🎟️:</strong> {campeonato.tipo === 'GRATUITO'
                        ? 'Gratuito'
                        : `R$ ${Number(campeonato.valorPorEquipe || 0).toFixed(2)}`}
                    </div>
                    <div className="info-item">
                      <strong>Numero de equipes👥:</strong> {campeonato.maxEquipes}
                    </div>
                  </div>
                </div>

                <div className="botoes-box">
                  {user?.id === campeonato.idCriador && (
                    <button className="btn-editar" onClick={abrirModal}>
                      Editar
                    </button>
                  )}
                  <button className="btn-voltar2" onClick={handleVoltar}>Voltar</button>
                </div>
              </div>

              <div className="card-desc">
                <h2>DESCRIÇÃO</h2>
                <p>{campeonato.descricao || '-'}</p>
              </div>

              {campeonato.formatoCampeonato === 'TABELA_ELIMINATORIAS' ? (
                <TabelaEliminatorias
                  times={Object.values(timesInscritos).flat()}
                  maxEquipes={campeonato.maxEquipes}
                />
              ) : (
                <Chaveamento grupos={timesInscritos} maxEquipes={campeonato.maxEquipes} />
              )}
            </>
          )}

          {/* PARTIDAS */}
          {abaSelecionada === 'partidas' && (
            <>
              {campeonato.formatoCampeonato === 'FASE_DE_GRUPOS_E_ELIMINATORIAS' ? (
                <PartidasGrupos grupos={timesInscritos} />
              ) : (
                <PartidasSimples
                  times={Object.values(timesInscritos).flat()}
                  maxEquipes={campeonato.maxEquipes}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">

            <h2 className="modal-title">Editar Campeonato</h2>

            <div className="modal-field">
              <label>Nome do Campeonato:</label>
              <input
                type="text"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label>Descrição:</label>
              <textarea
                value={campeonato.descricao}
                onChange={(e) => setCampeonato({ ...campeonato, descricao: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label>Status:</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                {(() => {
                  const statusAtual = campeonato.status;

                  if (statusAtual === 'ABERTO') {
                    return (
                      <>
                        <option value="EM_ANDAMENTO">Em Andamento</option>
                        <option value="FECHADO">Fechado</option>
                      </>
                    );
                  }

                  if (statusAtual === 'EM_ANDAMENTO') {
                    return <option value="FINALIZADO">Finalizado</option>;
                  }

                  if (statusAtual === 'FECHADO') {
                    return <option value="EM_ANDAMENTO">Reabrir (Em Andamento)</option>;
                  }

                  return <option value="FINALIZADO">Finalizado</option>;
                })()}
              </select>
            </div>

            <div className="modal-field">
              <label>Imagem:</label>
              <input type="file" accept="image/*" onChange={handleImagemChange} />

              {previewImagem && (
                <img
                  src={previewImagem}
                  alt="Preview"
                  className="preview-img"
                />
              )}
            </div>

            <div className="modal-buttons">
              <button className="btn-salvar" disabled={saving} onClick={handleSalvarEdicao}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>

              <button className="btn-cancelar" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoEditCampeonatos;
