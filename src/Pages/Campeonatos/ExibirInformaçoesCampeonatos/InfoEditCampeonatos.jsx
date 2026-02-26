  import React, { useEffect, useState } from 'react';
  import './InfoEditCampeonatos.css';
  import Navbar from '../../../Components/Navbar/Navbar';
  import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
  import { useNavigate, useParams } from 'react-router-dom';
  import { useApi } from '../../../Services/API';
  import timeDefault from '../../../assets/time_default.png';
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
                        src={time?.logo || timeDefault}
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
                  src={time.logo || timeDefault}
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

  const PartidasGrupos = ({ idCampeonato, onAgendarPartida, isAdmin }) => {
    const letras = ["A", "B", "C", "D"];
    const [grupoSelecionado, setGrupoSelecionado] = useState("A");
    const [partidas, setPartidas] = useState([]);
    const navigate = useNavigate();
    const api = useApi();

    useEffect(() => {
      if (!idCampeonato) return;

      const carregarPartidas = async () => {
        try {
          const res = await api.get(`/partidas/campeonato/${idCampeonato}`);
          const partidasRaw = res.data;

          const partidasComTimes = await Promise.all(
            partidasRaw.map(async (p) => {
              const [time1Res, time2Res] = await Promise.all([
                api.get(`/times/${p.idTime1}`),
                api.get(`/times/${p.idTime2}`)
              ]);

              const time1 = time1Res.data;
              const time2 = time2Res.data;

              return {
                ...p,
                time1: {
                  nome: time1.nome,
                  imagem: time1.imagemBase64
                    ? `data:image/*;base64,${time1.imagemBase64}`
                    : timeDefault
                },
                time2: {
                  nome: time2.nome,
                  imagem: time2.imagemBase64
                    ? `data:image/*;base64,${time2.imagemBase64}`
                    : timeDefault
                }
              };
            })
          );

          setPartidas(partidasComTimes);
        } catch (err) {
          console.error("Erro ao buscar partidas:", err);
        }
      };

      carregarPartidas();
    }, [idCampeonato]);

    // filtra por grupo
    const partidasGrupo = partidas.filter(
      (p) =>
        p.grupos &&
        p.grupos.toUpperCase().trim() === grupoSelecionado
    );

    // agrupa por semana
    const semanas = {};
    partidasGrupo.forEach((p) => {
      const semanaNumero = p.semana
        ? parseInt(p.semana.replace("SEMANA", ""))
        : 1;

      if (!semanas[semanaNumero]) semanas[semanaNumero] = [];
      semanas[semanaNumero].push(p);
    });

    const semanasFixas = [1, 2, 3];

    return (
      <div className="partidas-grupos-box">
        <div className="grupo-select-box">
          <label>GRUPO: </label>
          <select
            value={grupoSelecionado}
            onChange={(e) => setGrupoSelecionado(e.target.value.toUpperCase())}
          >
            {letras.map((letra) => (
              <option key={letra} value={letra}>{letra}</option>
            ))}
          </select>

          {isAdmin && (
            <button
              className="btn-agendar-partida"
              onClick={() => onAgendarPartida(grupoSelecionado)}
            >
              ➕ Agendar Partida
            </button>
          )}
        </div>

        {semanasFixas.map((numSemana) => {
          const partidasSemana = semanas[numSemana] || [];

          return (
            <div key={numSemana} className="semana-box">
              <h4>SEMANA {numSemana}</h4>

              {partidasSemana.length === 0 ? (
                <div className="partida-item">
                  <span className="nome-time">-</span>
                  <span className="pontos-time">0</span>
                  <span className="vs">VS</span>
                  <span className="pontos-time">0</span>
                  <span className="nome-time">-</span>
                </div>
              ) : (
                partidasSemana.map((p) => (
                  <div
                    key={p.id}
                    className="partida-item"
                    onClick={() => navigate(`/partida/${p.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="time">
                      <img src={p.time1.imagem} alt={p.time1.nome} />
                      <span className="nome-time">{p.time1.nome}</span>
                    </div>

                    <span className="pontos-time">{p.scoreTime1 ?? 0}</span>
                    <span className="vs">VS</span>
                    <span className="pontos-time">{p.scoreTime2 ?? 0}</span>

                    <div className="time">
                      <img src={p.time2.imagem} alt={p.time2.nome} />
                      <span className="nome-time">{p.time2.nome}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // === PARTIDAS SIMPLES ===
  const PartidasSimples = ({ times, maxEquipes, onAgendarPartida, isAdmin }) => {
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

          {isAdmin && (
            <button className="btn-agendar-partida" onClick={() => onAgendarPartida()}>
              ➕ Agendar Partida
            </button>
          )}
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

    // 🔥 NOVO: Estados para modal de agendar partida
    const [modalAgendarOpen, setModalAgendarOpen] = useState(false);
    const [partidaTime1, setPartidaTime1] = useState('');
    const [partidaTime2, setPartidaTime2] = useState('');
    const [partidaGrupo, setPartidaGrupo] = useState('A'); // 🔥 MUDANÇA: Grupo em vez de fase
    const [partidaData, setPartidaData] = useState('');
    const [partidaHora, setPartidaHora] = useState('');
    const [partidaSemana, setPartidaSemana] = useState('SEMANA1');
    const [agendando, setAgendando] = useState(false);

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
                : timeDefault;

              grupos[grupo].push({
                id: timeData.id,
                nome: timeData.nome,
                logo: imagemTime,
                pontuacao: inscricao.pontuacao || 0,
                grupo: grupo // 🔥 Adiciona info do grupo
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

    // 🔥 NOVA FUNÇÃO: Abrir modal de agendar partida
    const abrirModalAgendarPartida = (grupoSelecionado = 'A') => {
  setPartidaTime1('');
  setPartidaTime2('');
  setPartidaGrupo(grupoSelecionado);
  setPartidaSemana('SEMANA1'); // 🔥 novo
  setPartidaData('');
  setPartidaHora('');
  setModalAgendarOpen(true);
};

   const handleAgendarPartida = async () => {
      if (!partidaTime1 || !partidaTime2) {
        alert('❌ Selecione os dois times!');
        return;
      }

      if (partidaTime1 === partidaTime2) {
        alert('❌ Os times devem ser diferentes!');
        return;
      }

      if (!partidaData || !partidaHora) {
        alert('❌ Data e horário são obrigatórios!');
        return;
      }

      const dataHoraISO = `${partidaData}T${partidaHora}:00`;

      // 🔥 DEFINE A FASE AUTOMATICAMENTE
      let fasePartida;

      if (partidaSemana === "SEMANA1" || partidaSemana === "SEMANA2" || partidaSemana === "SEMANA3") {
        fasePartida = `FASE_DE_GRUPOS`;
      } else {
        fasePartida = "PLAYOFFS";
      }

      setAgendando(true);

      try {
        await api.post('/partidas/agendar', null, {
          params: {
            idCampeonato: id,
            idTime1: partidaTime1,
            idTime2: partidaTime2,
            fasePartida: fasePartida,   // ✅ agora existe
            grupos: partidaGrupo,
            semana: partidaSemana,
            dataHora: dataHoraISO
          }
        });

        alert('✅ Partida agendada com sucesso!');
        setModalAgendarOpen(false);

      } catch (err) {
        console.error('Erro ao agendar partida:', err);
        const mensagemErro = err.response?.data?.mensagem || 'Erro ao agendar partida';
        alert(`❌ ${mensagemErro}`);
      } finally {
        setAgendando(false);
      }
    };

    // 🔥 Obter times do grupo selecionado
    const timesDoGrupo = timesInscritos[partidaGrupo] || [];

    if (loading) return <LoadingScreen />;
    if (error) return (
      <>
        <Navbar />
        <div className="erro-msg">{error}</div>
      </>
    );
    if (!campeonato) return null;

    const isAdmin = user?.id === campeonato.idCriador;

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
                  <PartidasGrupos 
                    idCampeonato={id}
                    onAgendarPartida={abrirModalAgendarPartida}
                    isAdmin={isAdmin}
                  />
                ) : (
                  <PartidasSimples
                    times={Object.values(timesInscritos).flat()}
                    maxEquipes={campeonato.maxEquipes}
                    onAgendarPartida={abrirModalAgendarPartida}
                    isAdmin={isAdmin}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* MODAL DE EDIÇÃO */}
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

        {/* 🔥 MODAL DE AGENDAR PARTIDA */}
        {modalAgendarOpen && (
          <div className="modal-overlay">
            <div className="modal-content modal-agendar">

              <h2 className="modal-title">⚔️ Agendar Partida</h2>

              <div className="agendar-grid">

                <div className="modal-field">
                  <label>Grupo</label>
                  <select 
                    value={partidaGrupo} 
                    onChange={(e) => {
                      setPartidaGrupo(e.target.value);
                      setPartidaTime1('');
                      setPartidaTime2('');
                    }}
                  >
                    <option value="A">Grupo A</option>
                    <option value="B">Grupo B</option>
                    <option value="C">Grupo C</option>
                    <option value="D">Grupo D</option>
                  </select>
                </div>

                <div className="modal-field">
                  <label>Semana</label>
                  <select
                    value={partidaSemana}
                    onChange={(e) => setPartidaSemana(e.target.value)}
                  >
                    <option value="SEMANA1">Semana 1</option>
                    <option value="SEMANA2">Semana 2</option>
                    <option value="SEMANA3">Semana 3</option>
                  </select>
                </div>

                <div className="modal-field">
                  <label>Time 1</label>
                  <select 
                    value={partidaTime1} 
                    onChange={(e) => setPartidaTime1(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {timesDoGrupo.map((time) => (
                      <option key={time.id} value={time.id}>
                        {time.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-field">
                  <label>Time 2</label>
                  <select 
                    value={partidaTime2} 
                    onChange={(e) => setPartidaTime2(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {timesDoGrupo
                      .filter(time => time.id !== Number(partidaTime1))
                      .map((time) => (
                        <option key={time.id} value={time.id}>
                          {time.nome}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="modal-field">
                  <label>Data</label>
                  <input
                    type="date"
                    value={partidaData}
                    onChange={(e) => setPartidaData(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="modal-field">
                  <label>Hora</label>
                  <input
                    type="time"
                    value={partidaHora}
                    onChange={(e) => setPartidaHora(e.target.value)}
                  />
                </div>

              </div>

              <div className="info-warning">
                ⚠️ Data e horário são obrigatórios
              </div>

              <div className="modal-buttons">
                <button 
                  className="btn-salvar"
                  disabled={agendando || !partidaData || !partidaHora}
                  onClick={handleAgendarPartida}
                >
                  {agendando ? 'Agendando...' : 'Agendar'}
                </button>

                <button 
                  className="btn-cancelar"
                  onClick={() => setModalAgendarOpen(false)}
                  disabled={agendando}
                >
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