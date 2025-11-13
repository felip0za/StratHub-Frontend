import React, { useEffect, useState } from 'react';
import './InfoEditCampeonatos.css';
import Navbar from '../../../Components/Navbar/Navbar';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import avatarDefault from '../../../assets/avatar-default.png';
import { useAuth } from '../../../contexts/AuthContext';



const handleClickTeam = (timeId, navigate) => {
  if (timeId) navigate(`/timesprofile/${timeId}`);
};

const Chaveamento = ({ grupos, maxEquipes }) => {
  const navigate = useNavigate();

  const letrasGrupos = ['A', 'B', 'C', 'D'].slice(0, Math.ceil(maxEquipes / 4));

  // Criar grupos respeitando posição
  const gruposDinamicos = {};
  letrasGrupos.forEach((letra) => {
    const grupo = grupos[letra] || [];
    // Criar array de 4 posições
    const grupoOrdenado = Array(4).fill(null);
    grupo.forEach(time => {
      const pos = Number(time.posicao);
      if (pos && pos > 0 && pos <= 4) {
        grupoOrdenado[pos - 1] = time;
      } else {
        // Caso posicao inválida, joga na primeira vaga livre
        const firstEmpty = grupoOrdenado.findIndex(t => !t);
        if (firstEmpty !== -1) grupoOrdenado[firstEmpty] = time;
      }
    });
    gruposDinamicos[letra] = grupoOrdenado;
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

const TabelaEliminatorias = ({ times, maxEquipes }) => {
  // Garante que sempre haverá maxEquipes posições
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
            <div className="time-box">
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

// === COMPONENTE PARTIDAS DE GRUPOS ===
const PartidasGrupos = ({ grupos }) => {
  const letras = ['A', 'B', 'C', 'D'];
  const [grupoSelecionado, setGrupoSelecionado] = useState('A');
  const navigate = useNavigate();

  // Criar placeholder caso não haja grupos
  const gruposComPlaceholder = grupos || letras.reduce((acc, l) => {
    acc[l] = Array(4).fill({ nome: '-', pontuacao: 0, logo: null });
    return acc;
  }, {});

  const times = gruposComPlaceholder[grupoSelecionado] || Array(4).fill({ nome: '-', pontuacao: 0, logo: null });

  // Gerar pares de partidas (cada "semana")
  const partidas = [];
  for (let i = 0; i < times.length; i += 2) {
    const time1 = times[i];
    const time2 = times[i + 1] || { nome: '-', pontuacao: 0, logo: null };
    partidas.push({ time1, time2 });
  }

  return (
    <div className="partidas-grupos-box">
      {/* SELECT PARA ESCOLHER GRUPO */}
      <div className="grupo-select-box">
        <label>GRUPO: </label>
        <select value={grupoSelecionado} onChange={(e) => setGrupoSelecionado(e.target.value)}>
          {letras.map((letra) => (
            <option key={letra} value={letra}>{letra}</option>
          ))}
        </select>
      </div>

      {/* EXIBIR PARTIDAS DO GRUPO SELECIONADO */}
      {partidas.map((p, idx) => (
        <div key={idx} className="semana-box">
          <h4>SEMANA {idx + 1}:</h4>
          <div className="partida-item">
            {/* TIME 1 */}
            <div className="time">
              {p.time1.logo && (
                <img
                  src={p.time1.logo}
                  alt={p.time1.nome}
                  onClick={() => handleClickTeam(p.time1.id, navigate)}
                />
              )}
              <span className="nome-time">{p.time1.nome}</span>
            </div>

            <span className="pontos-time">{p.time1.pontuacao || 0}</span>
            <span className="vs">VS</span>
            <span className="pontos-time">{p.time2.pontuacao || 0}</span>

            {/* TIME 2 */}
            <div className="time">
              {p.time2.logo && <img src={p.time2.logo} alt={p.time2.nome} />}
              <span className="nome-time">{p.time2.nome}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// === COMPONENTE PARTIDAS SIMPLES (ROUND-ROBIN COMPLETO, SEM REPETIÇÕES) ===
const PartidasSimples = ({ times, maxEquipes }) => {
  const navigate = useNavigate();
  const [semanaSelecionada, setSemanaSelecionada] = useState(1);

  // Preenche times até o máximo definido
  const timesOrdenados = Array.from({ length: maxEquipes }, (_, i) => {
    const time = times?.find(t => t.posicao === i + 1);
    return time || { nome: '-', pontuacao: 0, posicao: i + 1, logo: null };
  });

  // Se houver número ímpar de times, adiciona um "descanso"
  let listaTimes = [...timesOrdenados];
  if (listaTimes.length % 2 !== 0) listaTimes.push({ nome: 'Descansa', bye: true });

  const numSemanas = listaTimes.length - 1;
  const numPartidasPorSemana = listaTimes.length / 2;

  // --- Gerar partidas sem repetições (Round Robin / Berger Table) ---
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

    // Rotacionar times mantendo o primeiro fixo
    arr = [arr[0], ...arr.slice(2), arr[1]];
  }

  const partidas = semanas[semanaSelecionada - 1] || [];

  const handleClickTeam = (idTime) => {
    navigate(`/times/${idTime}`);
  };

  return (
    <div className="partidas-grupos-box">
      {/* MENU HAMBÚRGUER PARA SEMANAS */}
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

      {/* EXIBIÇÃO DAS PARTIDAS */}
      <div className="semana-box">
        <h4>SEMANA {semanaSelecionada}</h4>

        {partidas.map((p, idx) => (
          <div key={idx} className="partida-item">
            {/* 🔹 Alterado para exibir “JOGO 1”, “JOGO 2”, etc. */}
            <h4 className="titulo-jogo">JOGO {idx + 1}</h4>

            {/* TIME 1 */}
            <div className="time">
              {!p.time1.bye && p.time1.logo && (
                <img
                  src={p.time1.logo}
                  alt={p.time1.nome}
                  onClick={() => p.time1.id && handleClickTeam(p.time1.id)}
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

            {/* TIME 2 */}
            <div className="time">
              {!p.time2.bye && p.time2.logo && (
                <img
                  src={p.time2.logo}
                  alt={p.time2.nome}
                  onClick={() => p.time2.id && handleClickTeam(p.time2.id)}
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
  const { user } = useAuth();

  // === NOVO ESTADO PARA ALTERNAR ENTRE INFORMAÇÕES / PARTIDAS ===
  const [abaSelecionada, setAbaSelecionada] = useState('informacoes');

  // === NOVO ESTADO PARA TIMES INSCRITOS ===
  const [timesInscritos, setTimesInscritos] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    const fetchDados = async () => {
      try {
        // === 1️⃣ Buscar dados do campeonato
        const responseCampeonato = await api.get(`/campeonatos/${id}`);
        const campeonatoData = formatarDatas(responseCampeonato.data);
        setCampeonato(campeonatoData);

        // === 2️⃣ Buscar inscrições (lista com idTime, grupo, posicao, pontos)
        const responseInscricoes = await api.get(`/inscricoes/campeonato/${id}/times`);
        const inscricoes = responseInscricoes.data;

        // === 3️⃣ Criar objeto base de grupos
        const grupos = { A: [], B: [], C: [], D: [] };

        // === 4️⃣ Buscar dados completos de cada time inscrito
        for (const inscricao of inscricoes) {
          try {
            const responseTime = await api.get(`/times/${inscricao.idTime}`);
            const timeData = responseTime.data;

            const grupo = inscricao.grupo || 'A';
            if (!grupos[grupo]) grupos[grupo] = [];

            const imagemTime = timeData.imagemBase64
              ? (timeData.imagemBase64.startsWith('data:image')
                  ? timeData.imagemBase64
                  : `data:image/png;base64,${timeData.imagemBase64}`
                )
              : avatarDefault;

            grupos[grupo].push({
              id: timeData.id,
              nome: timeData.nome,
              logo: imagemTime,
              pontuacao: inscricao.pontuacao || 0,
              posicao: inscricao.posicao || '-',
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

          {/* === NOVO SELECTOR DE ABA === */}
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

          {/* === CONTEÚDO PRINCIPAL === */}
          {abaSelecionada === 'informacoes' && (
            <>
              {/* HEADER */}
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
                      <strong>Entrada🎟️:</strong> {campeonato.tipo === 'GRATUITO' ? 'Gratuito' : `R$ ${Number(campeonato.valorPorEquipe || 0).toFixed(2)}`}
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

              {/* DESCRIÇÃO */}
              <div className="card-desc">
                <h2>DESCRIÇÃO</h2>
                <p>{campeonato.descricao || '-'}</p>
              </div>

              {/* TABELA OU CHAVEAMENTO DENTRO DE INFORMAÇÕES */}
              {campeonato.formatoCampeonato === 'TABELA_ELIMINATORIAS' ? (
                <TabelaEliminatorias times={Object.values(timesInscritos).flat()} maxEquipes={campeonato.maxEquipes} />
              ) : (
                <Chaveamento grupos={timesInscritos} maxEquipes={campeonato.maxEquipes} />
              )}
            </>
          )}

          {/* === ABA PARTIDAS === */}
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

      {/* MODAL DE EDIÇÃO */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Campeonato</h2>

            <div className="modal-field">
              <label>Nome do Campeonato:</label>
              <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
            </div>

            <div className="modal-field">
              <label>Descrição:</label>
              <textarea
                value={campeonato.descricao}
                onChange={(e) => setCampeonato({...campeonato, descricao: e.target.value})}
              />
            </div>

            <div className="modal-field">
              <label>Status:</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                {(() => {
                  const statusAtual = campeonato.status;
                  let opcoes = [];

                  if (statusAtual === 'ABERTO') {
                    opcoes = [
                      { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
                      { value: 'FECHADO', label: 'Fechado' }
                    ];
                  } else if (statusAtual === 'EM_ANDAMENTO') {
                    opcoes = [
                      { value: 'ABERTO', label: 'Aberto' },
                      { value: 'FECHADO', label: 'Fechado' }
                    ];
                  } else if (statusAtual === 'FECHADO') {
                    opcoes = [
                      { value: 'ABERTO', label: 'Aberto' },
                      { value: 'EM_ANDAMENTO', label: 'Em Andamento' }
                    ];
                  }

                  return opcoes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ));
                })()}
              </select>
            </div>

            <div className="modal-field">
              <label>Imagem do Campeonato:</label>
              <input type="file" accept="image/*" onChange={handleImagemChange} />
              {previewImagem && <img src={previewImagem} alt="Preview" className="preview-modal-img" />}
            </div>

            <div className="modal-buttons">
              <button onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
              <button onClick={handleSalvarEdicao} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoEditCampeonatos;
