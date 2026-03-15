import React, { useEffect, useState, useCallback } from 'react';
import './InfoEditCampeonatos.css';
import Navbar from '../../../Components/Navbar/Navbar';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import timeDefault from '../../../assets/time_default.png';
import { useAuth } from '../../../contexts/AuthContext';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const handleClickTeam = (timeId, navigate) => {
  if (timeId) navigate(`/times/${timeId}`);
};

const STATUS_PARTIDA_LABEL = {
  ESPERANDO_O_HORARIO:    { texto: 'Aguardando',  cor: '#6b7280' },
  AGUARDANDO_CONFIRMACAO: { texto: 'Confirmação', cor: '#f59e0b' },
  FASE_DE_BANIMENTO:      { texto: 'Banimento',   cor: '#ef4444' },
  EM_ANDAMENTO:           { texto: 'Ao Vivo',     cor: '#10b981' },
  FINALIZADO:             { texto: 'Finalizado',  cor: '#6b7280' },
  WO:                     { texto: 'W.O.',        cor: '#f97316' },
};

const formatarHorario = (dataHora) => {
  if (!dataHora) return '--:--';
  const d = new Date(dataHora);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const formatarImagem = (img) => {
  if (!img || img === '') return timeDefault;
  return img.startsWith('data:image') ? img : `data:image/png;base64,${img}`;
};

const formatarStatus = (status) => {
  if (!status) return '';
  return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

/* ─────────────────────────────────────────────
   Chaveamento (Grupos)
───────────────────────────────────────────── */
const Chaveamento = ({ grupos, maxEquipes }) => {
  const navigate = useNavigate();
  const letrasGrupos = ['A', 'B', 'C', 'D'].slice(0, Math.ceil(maxEquipes / 4));

  const gruposDinamicos = {};
  letrasGrupos.forEach((letra) => {
    const grupo = grupos[letra] || [];
    const sorted = [...grupo].sort((a, b) => (Number(b.pontuacao) || 0) - (Number(a.pontuacao) || 0));
    const grupoFinal = Array(4).fill(null);
    sorted.forEach((time, i) => { if (i < 4) grupoFinal[i] = time; });
    gruposDinamicos[letra] = grupoFinal;
  });

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-icon">⚔️</span>
        <h2 className="section-title">Chaveamento</h2>
      </div>
      <div className="grupos-container">
        {letrasGrupos.map((letra) => (
          <div key={letra} className="grupo">
            <div className="grupo-header">Grupo {letra}</div>
            <div className="grupo-times">
              {gruposDinamicos[letra].map((time, index) => (
                <div
                  key={index}
                  className="time-card"
                  onClick={() => handleClickTeam(time?.id, navigate)}
                  style={{ cursor: time?.id ? 'pointer' : 'default' }}
                >
                  <div className="posicao-badge">{index + 1}</div>
                  <img className="time-logo" src={time?.logo || timeDefault} alt={time?.nome || '-'} />
                  <span className="time-nome">{time?.nome || '—'}</span>
                  <span className="time-pontos">{time?.pontuacao ?? 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   TabelaEliminatorias
───────────────────────────────────────────── */
const TabelaEliminatorias = ({ times, maxEquipes }) => {
  const navigate = useNavigate();
  const timesOrdenados = Array.from({ length: maxEquipes }, (_, i) => {
    const time = times?.find(t => t.posicao === i + 1);
    return time || { nome: '—', pontuacao: 0, posicao: i + 1, logo: null };
  });

  return (
    <div className="section-card">
      <div className="section-header">
        <span className="section-icon">🏆</span>
        <h2 className="section-title">Tabela</h2>
      </div>
      <div className="grupo-times">
        {timesOrdenados.map((time, i) => (
          <div
            key={i}
            className="time-card"
            onClick={() => handleClickTeam(time?.id, navigate)}
            style={{ cursor: time?.id ? 'pointer' : 'default' }}
          >
            <div className={`posicao-badge ${i < 3 ? `top-${i + 1}` : ''}`}>{time.posicao}</div>
            <img className="time-logo" src={time.logo || timeDefault} alt={time.nome || '—'} />
            <span className="time-nome">{time.nome || '—'}</span>
            <span className="time-pontos">{time.pontuacao ?? 0} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PartidaCard
───────────────────────────────────────────── */
const PartidaCard = ({ p, isAdmin, navigate, onEditarPlacar }) => {
  const statusInfo = STATUS_PARTIDA_LABEL[p.statusPartida] || { texto: p.statusPartida, cor: '#6b7280' };
  const isAoVivo   = p.statusPartida === 'EM_ANDAMENTO';
  const isFinalizado = p.statusPartida === 'FINALIZADO' || p.statusPartida === 'WO';
  const vencedor1 = isFinalizado && p.scoreTime1 > p.scoreTime2;
  const vencedor2 = isFinalizado && p.scoreTime2 > p.scoreTime1;

  return (
    <div className={`partida-card ${isAoVivo ? 'ao-vivo' : ''} ${isFinalizado ? 'finalizada' : ''}`}>
      <div className="partida-card-header">
        <span className="partida-horario">🕐 {formatarHorario(p.dataHoraPartida)}</span>
        <span className="partida-status-badge" style={{ color: statusInfo.cor, borderColor: `${statusInfo.cor}44` }}>
          {isAoVivo && <span className="live-dot" />}
          {statusInfo.texto}
        </span>
      </div>

      <div className="partida-card-body" onClick={() => navigate(`/partida/${p.id}`)} style={{ cursor: 'pointer' }}>
        <div className={`partida-time ${vencedor1 ? 'winner' : ''}`}>
          <img src={p.time1.imagem} alt={p.time1.nome} />
          <span>{p.time1.nome}</span>
        </div>
        <div className="partida-placar">
          <span className={vencedor1 ? 'placar-vencedor' : ''}>{p.scoreTime1 ?? 0}</span>
          <span className="placar-sep">×</span>
          <span className={vencedor2 ? 'placar-vencedor' : ''}>{p.scoreTime2 ?? 0}</span>
        </div>
        <div className={`partida-time direita ${vencedor2 ? 'winner' : ''}`}>
          <img src={p.time2.imagem} alt={p.time2.nome} />
          <span>{p.time2.nome}</span>
        </div>
      </div>

      {isAdmin && (
        <div className="partida-card-actions">
          <button className="btn-action editar" onClick={(e) => { e.stopPropagation(); onEditarPlacar(p); }}>
            ✏️ Placar
          </button>
          <button className="btn-action ver" onClick={(e) => { e.stopPropagation(); navigate(`/partida/${p.id}`); }}>
            👁 Ver
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   PartidasGrupos
───────────────────────────────────────────── */
const PartidasGrupos = ({ idCampeonato, onAgendarPartida, isAdmin, onEditarPlacar }) => {
  const letras = ['A', 'B', 'C', 'D'];
  const [grupoSelecionado, setGrupoSelecionado] = useState('A');
  const [partidas, setPartidas] = useState([]);
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    if (!idCampeonato) return;
    const carregarPartidas = async () => {
      try {
        const res = await api.get(`/partidas/campeonato/${idCampeonato}`);
        const partidasComTimes = await Promise.all(
          res.data.map(async (p) => {
            const [t1, t2] = await Promise.all([api.get(`/times/${p.idTime1}`), api.get(`/times/${p.idTime2}`)]);
            return {
              ...p,
              time1: { nome: t1.data.nome, imagem: t1.data.imagemBase64 ? `data:image/*;base64,${t1.data.imagemBase64}` : timeDefault },
              time2: { nome: t2.data.nome, imagem: t2.data.imagemBase64 ? `data:image/*;base64,${t2.data.imagemBase64}` : timeDefault },
            };
          })
        );
        setPartidas(partidasComTimes);
      } catch (err) {
        console.error('Erro ao buscar partidas:', err);
      }
    };
    carregarPartidas();
  }, [idCampeonato]);

  const partidasGrupo = partidas.filter(p => p.grupos && p.grupos.toUpperCase().trim() === grupoSelecionado);
  const semanas = {};
  partidasGrupo.forEach(p => {
    const n = p.semana ? parseInt(p.semana.replace('SEMANA', '')) : 1;
    if (!semanas[n]) semanas[n] = [];
    semanas[n].push(p);
  });

  return (
    <div className="partidas-wrap">
      <div className="partidas-toolbar">
        <div className="toolbar-left">
          <label className="toolbar-label">Grupo</label>
          <div className="group-tabs">
            {letras.map(l => (
              <button key={l} className={`group-tab ${grupoSelecionado === l ? 'active' : ''}`} onClick={() => setGrupoSelecionado(l)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {isAdmin && (
          <button className="btn-agendar" onClick={() => onAgendarPartida(grupoSelecionado)}>
            ➕ Agendar Partida
          </button>
        )}
      </div>

      {[1, 2, 3].map(n => (
        <div key={n} className="semana-section">
          <div className="semana-label">Semana {n}</div>
          {(semanas[n] || []).length === 0 ? (
            <div className="empty-partida">Nenhuma partida agendada</div>
          ) : (
            <div className="partidas-lista">
              {semanas[n].map(p => (
                <PartidaCard key={p.id} p={p} isAdmin={isAdmin} navigate={navigate} onEditarPlacar={onEditarPlacar} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Playoffs – Single Elimination Bracket
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   Helpers de bracket
───────────────────────────────────────────── */

// Dado um conjunto de partidas finalizadas, retorna o id do vencedor
const getVencedor = (p) => {
  if (!p) return null;
  const enc = p.statusPartida === 'FINALIZADO' || p.statusPartida === 'WO';
  if (!enc) return null;
  if (p.idTimeVencedor) return p.idTimeVencedor;
  if (p.scoreTime1 > p.scoreTime2) return p.idTime1;
  if (p.scoreTime2 > p.scoreTime1) return p.idTime2;
  return null;
};

const getPerdedor = (p) => {
  if (!p) return null;
  const enc = p.statusPartida === 'FINALIZADO' || p.statusPartida === 'WO';
  if (!enc) return null;
  const v = getVencedor(p);
  if (!v) return null;
  return v === p.idTime1 ? p.idTime2 : p.idTime1;
};

/* ─────────────────────────────────────────────
   BracketMatch — card no estilo da imagem
   Dois slots (time + score) sem cabeçalho
───────────────────────────────────────────── */
const BracketMatch = ({ p, navigate, isAdmin, onEditarPlacar }) => {
  // slot vazio
  if (!p) {
    return (
      <div className="bp-card bp-empty">
        <div className="bp-slot">
          <span className="bp-nome bp-nome-empty">A definir</span>
          <span className="bp-score bp-score-empty">—</span>
        </div>
        <div className="bp-divider" />
        <div className="bp-slot">
          <span className="bp-nome bp-nome-empty">A definir</span>
          <span className="bp-score bp-score-empty">—</span>
        </div>
        {isAdmin && onEditarPlacar && (
          <button className="bp-edit-btn" onClick={e => e.stopPropagation()}>✏️</button>
        )}
      </div>
    );
  }

  const enc  = p.statusPartida === 'FINALIZADO' || p.statusPartida === 'WO';
  const vivo = p.statusPartida === 'EM_ANDAMENTO';
  const v1   = enc && p.scoreTime1 > p.scoreTime2;
  const v2   = enc && p.scoreTime2 > p.scoreTime1;

  return (
    <div
      className={`bp-card ${vivo ? 'bp-vivo' : ''} ${enc ? 'bp-enc' : ''}`}
      onClick={() => navigate(`/partida/${p.id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Time 1 */}
      <div className={`bp-slot ${v1 ? 'bp-win' : v2 ? 'bp-lose' : ''}`}>
        <img src={p.time1.imagem} alt={p.time1.nome} className="bp-logo" />
        <span className="bp-nome">{p.time1.nome}</span>
        <span className={`bp-score ${v1 ? 'bp-score-win' : ''}`}>{p.scoreTime1 ?? 0}</span>
      </div>
      <div className="bp-divider" />
      {/* Time 2 */}
      <div className={`bp-slot ${v2 ? 'bp-win' : v1 ? 'bp-lose' : ''}`}>
        <img src={p.time2.imagem} alt={p.time2.nome} className="bp-logo" />
        <span className="bp-nome">{p.time2.nome}</span>
        <span className={`bp-score ${v2 ? 'bp-score-win' : ''}`}>{p.scoreTime2 ?? 0}</span>
      </div>

      {/* badges e editar ficam fora do fluxo principal */}
      <div className="bp-footer">
        <span className="bp-date">{formatarHorario(p.dataHoraPartida)}</span>
        {vivo && <span className="bp-badge bp-badge-vivo"><span className="bp-live-dot" />Ao Vivo</span>}
        {enc  && <span className="bp-badge bp-badge-enc">Finalizado</span>}
        {isAdmin && (
          <button className="bp-edit-btn" onClick={e => { e.stopPropagation(); onEditarPlacar(p); }}>✏️</button>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PlayoffsBracket — layout horizontal
───────────────────────────────────────────── */
const PlayoffsBracket = ({ idCampeonato, isAdmin, onEditarPlacar, timesInscritos, api: apiProp }) => {
  const navigate  = useNavigate();
  const apiHook   = useApi();
  const api       = apiProp || apiHook;

  const [partidas,  setPartidas]  = useState([]);
  const [agendando, setAgendando] = useState(false);
  const [modalData, setModalData] = useState('');
  const [modalHora, setModalHora] = useState('');
  const [modalFase, setModalFase] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const carregarPartidas = async () => {
    if (!idCampeonato) return;
    try {
      const res = await api.get(`/partidas/campeonato/${idCampeonato}`);
      const playoffs = res.data.filter(p => p.fasePartida === 'PLAYOFFS');
      const comTimes = await Promise.all(
        playoffs.map(async (p) => {
          const [t1, t2] = await Promise.all([api.get(`/times/${p.idTime1}`), api.get(`/times/${p.idTime2}`)]);
          return {
            ...p,
            time1: { id: t1.data.id, nome: t1.data.nome, imagem: t1.data.imagemBase64 ? `data:image/*;base64,${t1.data.imagemBase64}` : timeDefault },
            time2: { id: t2.data.id, nome: t2.data.nome, imagem: t2.data.imagemBase64 ? `data:image/*;base64,${t2.data.imagemBase64}` : timeDefault },
          };
        })
      );
      setPartidas(comTimes);
    } catch (err) { console.error('Erro ao buscar playoffs:', err); }
  };

  useEffect(() => { carregarPartidas(); }, [idCampeonato]);

  // ── agrupamento e lógica de progressão ──
  const porFase = {};
  partidas.forEach(p => {
    if (!porFase[p.semana]) porFase[p.semana] = [];
    porFase[p.semana].push(p);
  });

  const quartas  = porFase['QUARTAS_DE_FINAL'] || [];
  const semis    = porFase['SEMIFINAL']        || [];
  const terceiro = porFase['TERCEIRO_LUGAR']   || [];
  const final_   = porFase['FINAL']            || [];

  const quartasCompletas = quartas.length === 4 && quartas.every(p => getVencedor(p));
  const semisCompletas   = semis.length   === 2 && semis.every(p => getVencedor(p));

  const classificadosPorGrupo = {};
  ['A','B','C','D'].forEach(l => {
    const g = (timesInscritos?.[l] || []).slice().sort((a,b) => (Number(b.pontuacao)||0)-(Number(a.pontuacao)||0));
    classificadosPorGrupo[l] = { primeiro: g[0]||null, segundo: g[1]||null };
  });

  const confrontosQuartas = [
    { time1: classificadosPorGrupo['A']?.primeiro, time2: classificadosPorGrupo['B']?.segundo },
    { time1: classificadosPorGrupo['B']?.primeiro, time2: classificadosPorGrupo['A']?.segundo },
    { time1: classificadosPorGrupo['C']?.primeiro, time2: classificadosPorGrupo['D']?.segundo },
    { time1: classificadosPorGrupo['D']?.primeiro, time2: classificadosPorGrupo['C']?.segundo },
  ];

  const confrontosSemis    = quartasCompletas ? [
    { time1Id: getVencedor(quartas[0]), time2Id: getVencedor(quartas[1]) },
    { time1Id: getVencedor(quartas[2]), time2Id: getVencedor(quartas[3]) },
  ] : [];
  const confrontosTerceiro = semisCompletas ? [{ time1Id: getPerdedor(semis[0]), time2Id: getPerdedor(semis[1]) }] : [];
  const confrontosFinal    = semisCompletas ? [{ time1Id: getVencedor(semis[0]), time2Id: getVencedor(semis[1]) }] : [];

  const podeAgendarQuartas  = quartas.length === 0 && confrontosQuartas.every(c => c.time1 && c.time2);

  const getNomeTime = (timeId) => {
    if (!timeId) return '?';
    for (const g of Object.values(timesInscritos || {})) { const t = g.find(t => t.id === timeId); if (t) return t.nome; }
    for (const p of partidas) { if (p.idTime1 === timeId) return p.time1.nome; if (p.idTime2 === timeId) return p.time2.nome; }
    return `Time #${timeId}`;
  };

  const abrirModal = (semana, confrontos, label) => {
    setModalFase({ semana, confrontos, label });
    setModalData(''); setModalHora('');
    setModalOpen(true);
  };

  const handleAgendarFase = async () => {
    if (!modalFase) return;
    setAgendando(true);
    try {
      for (const c of modalFase.confrontos) {
        await api.post('/partidas/agendar', null, {
          params: { idCampeonato, idTime1: c.time1Id, idTime2: c.time2Id, fasePartida: 'PLAYOFFS', grupos: 'PLAYOFFS', semana: modalFase.semana, dataHora: `${modalData}T${modalHora}:00` }
        });
      }
      alert('✅ Partidas agendadas!');
      setModalOpen(false); setModalData(''); setModalHora('');
      await carregarPartidas();
    } catch (err) {
      alert(`❌ ${err.response?.data?.mensagem || 'Erro ao agendar'}`);
    } finally { setAgendando(false); }
  };

  // ── Rodadas ──
  const roundsMain = [
    { key: 'QUARTAS_DE_FINAL', label: 'Quartas de Final', partidas: quartas,  slots: 4 },
    { key: 'SEMIFINAL',        label: 'Semifinal',        partidas: semis,    slots: 2 },
    { key: 'FINAL',            label: 'Final',            partidas: final_,   slots: 1 },
  ];

  const slotsOf = (round) => {
    const arr = [...round.partidas];
    while (arr.length < round.slots) arr.push(null);
    return arr;
  };

  // Agrupa slots em pares: [[slot0,slot1], [slot2,slot3], ...]
  // Um par é "double" apenas se tiver DOIS items reais (não null)
  const pairsOf = (slots) => {
    const pairs = [];
    for (let i = 0; i < slots.length; i += 2) {
      const a = slots[i];
      const b = slots[i + 1];          // undefined se não existe
      // só agrupa se houver dois slots definidos (mesmo que null = vazio)
      const isDouble = b !== undefined; // b pode ser null (slot vazio) mas existe
      pairs.push({ items: isDouble ? [a, b] : [a], double: isDouble });
    }
    return pairs;
  };

  return (
    <div className="partidas-wrap">

      <div className="partidas-toolbar">
        <div className="toolbar-left"><span className="toolbar-label">🏅 Fase Eliminatória</span></div>
      </div>

      {/* ── Botões admin ── */}
      {isAdmin && (
        <div className="playoffs-agendar-row">
          <button className="btn-agendar" onClick={() =>
            abrirModal('QUARTAS_DE_FINAL', confrontosQuartas.filter(c => c.time1 && c.time2).map(c => ({ time1Id: c.time1.id, time2Id: c.time2.id })), 'Quartas de Final')
          }>➕ Quartas de Final</button>
          <button className="btn-agendar" onClick={() =>
            abrirModal('SEMIFINAL', confrontosSemis.length ? confrontosSemis : [{ time1Id:'', time2Id:'' },{ time1Id:'', time2Id:'' }], 'Semifinal')
          }>➕ Semifinal</button>
          <button className="btn-agendar" onClick={() =>
            abrirModal('TERCEIRO_LUGAR', confrontosTerceiro.length ? confrontosTerceiro : [{ time1Id:'', time2Id:'' }], '3º Lugar')
          }>➕ 3º Lugar</button>
          <button className="btn-agendar" onClick={() =>
            abrirModal('FINAL', confrontosFinal.length ? confrontosFinal : [{ time1Id:'', time2Id:'' }], 'Final')
          }>➕ Final</button>
        </div>
      )}

      {/* ── Bracket horizontal ── */}
      <div className="bp-scroll">
        <div className="bp-wrap">

          {roundsMain.map((round, ri) => {
            const slots   = slotsOf(round);
            const isFirst = ri === 0;
            const pairs   = pairsOf(slots);

            return (
              <div key={round.key} className={`bp-round ${isFirst ? 'bp-round-first' : ''}`}>
                <div className="bp-round-label">{round.label}</div>
                <div className="bp-col">
                  {pairs.map((pair, pi) => (
                    <div
                      key={pi}
                      className={`bp-pair ${pair.double ? 'bp-pair-double' : 'bp-pair-single'}`}
                    >
                      {pair.items.map((p, si) => (
                        <div key={si} className="bp-pair-slot">
                          <BracketMatch
                            p={p}
                            navigate={navigate}
                            isAdmin={isAdmin}
                            onEditarPlacar={onEditarPlacar}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* ── Campeão (ao lado da Final) ── */}
          {(() => {
            const finalPartida = final_[0] ?? null;
            const campeaoId    = finalPartida ? getVencedor(finalPartida) : null;
            const campeaoNome  = campeaoId ? getNomeTime(campeaoId) : null;
            const campeaoImg   = campeaoId
              ? partidas.find(p => p.idTime1 === campeaoId)?.time1?.imagem
                ?? partidas.find(p => p.idTime2 === campeaoId)?.time2?.imagem
                ?? null
              : null;

            return (
              <div className="bp-round bp-round-campeon">
                <div className="bp-round-label">Campeão</div>
                <div className="bp-col">
                  <div className="bp-pair bp-pair-single">
                    <div className="bp-pair-slot">
                      <div className={`bp-campeon-box ${campeaoNome ? 'bp-campeon-definido' : ''}`}>
                        {campeaoNome ? (
                          <>
                            <div className="bp-campeon-trophy">🏆</div>
                            {campeaoImg && (
                              <img src={campeaoImg} alt={campeaoNome} className="bp-campeon-logo" />
                            )}
                            <span className="bp-campeon-nome">{campeaoNome}</span>
                          </>
                        ) : (
                          <>
                            <div className="bp-campeon-trophy bp-campeon-trophy-empty">🏆</div>
                            <span className="bp-campeon-nome bp-campeon-vazio">A definir</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

        {/* ── 3º Lugar ── */}
        {(terceiro.length > 0 || semisCompletas) && (
          <div className="bp-terceiro">
            <div className="bp-round-label" style={{ marginBottom: 10 }}>3º Lugar</div>
            <div style={{ width: 220 }}>
              {(terceiro.length > 0 ? terceiro : [null]).map((p, si) => (
                <BracketMatch key={p?.id ?? `trc-${si}`} p={p} navigate={navigate} isAdmin={isAdmin} onEditarPlacar={onEditarPlacar} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Vazio ── */}
      {partidas.length === 0 && (
        <div className="empty-bracket">
          <div className="empty-bracket-icon">🏆</div>
          <p>{podeAgendarQuartas ? 'Tudo pronto! Clique em "Quartas de Final" para iniciar os playoffs.' : 'Os grupos precisam ter pelo menos 2 times classificados para iniciar os playoffs.'}</p>
        </div>
      )}

      {/* ── Modal agendar fase ── */}
      {modalOpen && modalFase && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content modal-agendar" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2 className="modal-title">⚔️ Agendar {modalFase.label}</h2>
            <div style={{ padding: '0 24px', marginBottom: 8 }}>
              <p style={{ fontSize: '0.78rem', color: '#8b949e', marginBottom: 10 }}>Confrontos:</p>
              {modalFase.confrontos.map((c, i) => {
                const todos = Object.values(timesInscritos || {}).flat();
                const tem = c.time1Id && c.time2Id;
                return (
                  <div key={i} style={{ marginBottom: 12, padding: '10px 0', borderBottom: '1px solid #21262d' }}>
                    {tem ? (
                      <span style={{ fontSize: '0.83rem', color: '#e6edf3' }}>
                        {getNomeTime(c.time1Id)} <span style={{ color:'#484f58' }}>vs</span> {getNomeTime(c.time2Id)}
                      </span>
                    ) : (
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <select style={{ flex:1, background:'#161b22', border:'1px solid #21262d', color:'#e6edf3', padding:'8px 10px', borderRadius:8, fontSize:'0.83rem', outline:'none' }}
                          value={c.time1Id||''} onChange={e => { const u=[...modalFase.confrontos]; u[i]={...u[i],time1Id:Number(e.target.value)}; setModalFase({...modalFase,confrontos:u}); }}>
                          <option value="">Time 1</option>
                          {todos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </select>
                        <span style={{ color:'#484f58', fontWeight:700 }}>vs</span>
                        <select style={{ flex:1, background:'#161b22', border:'1px solid #21262d', color:'#e6edf3', padding:'8px 10px', borderRadius:8, fontSize:'0.83rem', outline:'none' }}
                          value={c.time2Id||''} onChange={e => { const u=[...modalFase.confrontos]; u[i]={...u[i],time2Id:Number(e.target.value)}; setModalFase({...modalFase,confrontos:u}); }}>
                          <option value="">Time 2</option>
                          {todos.filter(t => t.id !== c.time1Id).map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="agendar-grid" style={{ padding:'4px 24px 0' }}>
              <div className="modal-field"><label>Data</label><input type="date" value={modalData} onChange={e => setModalData(e.target.value)} min={new Date().toISOString().split('T')[0]} /></div>
              <div className="modal-field"><label>Hora</label><input type="time" value={modalHora} onChange={e => setModalHora(e.target.value)} /></div>
            </div>
            <div className="info-warning" style={{ margin:'8px 24px 0' }}>⚠️ Todos os jogos desta fase terão o mesmo horário</div>
            <div className="modal-buttons">
              <button className="btn-salvar" disabled={agendando||!modalData||!modalHora||modalFase.confrontos.some(c=>!c.time1Id||!c.time2Id)} onClick={handleAgendarFase}>
                {agendando ? 'Agendando…' : 'Agendar'}
              </button>
              <button className="btn-cancelar" disabled={agendando} onClick={() => setModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   PartidasSimples
───────────────────────────────────────────── */
const PartidasSimples = ({ times, maxEquipes, onAgendarPartida, isAdmin, onEditarPlacar }) => {
  const navigate = useNavigate();
  const [semanaSelecionada, setSemanaSelecionada] = useState(1);

  const timesOrdenados = Array.from({ length: maxEquipes }, (_, i) => {
    const time = times?.find(t => t.posicao === i + 1);
    return time || { nome: '—', pontuacao: 0, logo: null };
  });

  let listaTimes = [...timesOrdenados];
  if (listaTimes.length % 2 !== 0) listaTimes.push({ nome: 'Descansa', bye: true });

  const numSemanas = listaTimes.length - 1;
  const numPartidasPorSemana = listaTimes.length / 2;
  const semanas = [];
  let arr = [...listaTimes];
  for (let r = 0; r < numSemanas; r++) {
    const ps = [];
    for (let i = 0; i < numPartidasPorSemana; i++) ps.push({ time1: arr[i], time2: arr[arr.length - 1 - i] });
    semanas.push(ps);
    arr = [arr[0], ...arr.slice(2), arr[1]];
  }
  const partidas = semanas[semanaSelecionada - 1] || [];

  return (
    <div className="partidas-wrap">
      <div className="partidas-toolbar">
        <div className="toolbar-left">
          <label className="toolbar-label">Semana</label>
          <select className="toolbar-select" value={semanaSelecionada} onChange={(e) => setSemanaSelecionada(Number(e.target.value))}>
            {Array.from({ length: numSemanas }, (_, i) => (
              <option key={i + 1} value={i + 1}>Semana {i + 1}</option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <button className="btn-agendar" onClick={() => onAgendarPartida()}>
            ➕ Agendar Partida
          </button>
        )}
      </div>

      <div className="semana-section">
        <div className="semana-label">Semana {semanaSelecionada}</div>
        <div className="partidas-lista">
          {partidas.map((p, idx) =>
            p.id ? (
              <PartidaCard key={p.id} p={p} isAdmin={isAdmin} navigate={navigate} onEditarPlacar={onEditarPlacar} />
            ) : (
              <div key={idx} className="partida-card placeholder">
                <div className="partida-card-body">
                  <div className="partida-time">
                    {!p.time1.bye && p.time1.logo && <img src={p.time1.logo} alt={p.time1.nome} />}
                    <span>{p.time1.nome}</span>
                  </div>
                  <div className="partida-placar">
                    {!p.time1.bye && !p.time2.bye ? (
                      <><span>{p.time1.pontuacao || 0}</span><span className="placar-sep">×</span><span>{p.time2.pontuacao || 0}</span></>
                    ) : <span className="placar-sep">—</span>}
                  </div>
                  <div className="partida-time direita">
                    {!p.time2.bye && p.time2.logo && <img src={p.time2.logo} alt={p.time2.nome} />}
                    <span>{p.time2.nome}</span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Componente Principal
───────────────────────────────────────────── */
const InfoEditCampeonatos = () => {
  const [campeonato, setCampeonato]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [modalOpen, setModalOpen]         = useState(false);
  const [editNome, setEditNome]           = useState('');
  const [editStatus, setEditStatus]       = useState('');
  const [editImagem, setEditImagem]       = useState('');
  const [previewImagem, setPreviewImagem] = useState('');
  const [saving, setSaving]               = useState(false);

  const [abaSelecionada, setAbaSelecionada]   = useState('informacoes');
  const [subAbaPartidas, setSubAbaPartidas]   = useState('grupos');
  const [timesInscritos, setTimesInscritos]   = useState({});

  const [modalAgendarOpen, setModalAgendarOpen] = useState(false);
  const [partidaTime1, setPartidaTime1]         = useState('');
  const [partidaTime2, setPartidaTime2]         = useState('');
  const [partidaGrupo, setPartidaGrupo]         = useState('A');
  const [partidaData, setPartidaData]           = useState('');
  const [partidaHora, setPartidaHora]           = useState('');
  const [partidaSemana, setPartidaSemana]       = useState('SEMANA1');
  const [agendando, setAgendando]               = useState(false);

  const [modalPlacarOpen, setModalPlacarOpen] = useState(false);
  const [partidaEditando, setPartidaEditando] = useState(null);
  const [editScore1, setEditScore1]           = useState(0);
  const [editScore2, setEditScore2]           = useState(0);
  const [salvandoPlacar, setSalvandoPlacar]   = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();

  const formatarDatas = (c) => {
    if (c.dataInicio) c.dataInicio = c.dataInicio.split('T')[0];
    if (c.dataFim)    c.dataFim    = c.dataFim.split('T')[0];
    return c;
  };

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const responseCampeonato = await api.get(`/campeonatos/${id}`);
        setCampeonato(formatarDatas(responseCampeonato.data));

        const responseInscricoes = await api.get(`/inscricoes/campeonato/${id}/times`);
        const grupos = { A: [], B: [], C: [], D: [] };

        for (const inscricao of responseInscricoes.data) {
          try {
            const responseTime = await api.get(`/times/${inscricao.idTime}`);
            const timeData = responseTime.data;
            const grupo = inscricao.grupo || 'A';
            if (!grupos[grupo]) grupos[grupo] = [];
            const imagemTime = timeData.imagemBase64
              ? (timeData.imagemBase64.startsWith('data:image') ? timeData.imagemBase64 : `data:image/png;base64,${timeData.imagemBase64}`)
              : timeDefault;
            grupos[grupo].push({ id: timeData.id, nome: timeData.nome, logo: imagemTime, pontuacao: inscricao.pontuacao || 0, grupo });
          } catch (err) {
            console.error(`Erro ao buscar time ${inscricao.idTime}:`, err);
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
      setEditImagem(reader.result.split(',')[1]);
      setPreviewImagem(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSalvarEdicao = async () => {
    setSaving(true);
    try {
      await api.put(`/campeonatos/${id}`, { nome: editNome, descricao: campeonato.descricao, status: editStatus, imagemCampeonato: editImagem || null });
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

  const abrirModalPlacar = (partida) => {
    setPartidaEditando(partida);
    setEditScore1(partida.scoreTime1 ?? 0);
    setEditScore2(partida.scoreTime2 ?? 0);
    setModalPlacarOpen(true);
  };

  const handleSalvarPlacar = async () => {
    if (!partidaEditando) return;
    setSalvandoPlacar(true);
    try {
      await api.put(`/partidas/${partidaEditando.id}/placar`, null, { params: { scoreTime1: editScore1, scoreTime2: editScore2 } });
      alert('✅ Placar atualizado!');
      setModalPlacarOpen(false);
    } catch (err) {
      alert('❌ Erro ao atualizar placar.');
    } finally {
      setSalvandoPlacar(false);
    }
  };

  const abrirModalAgendarPartida = (grupoSelecionado = 'A') => {
    const isPlayoff = grupoSelecionado === 'PLAYOFF' || grupoSelecionado === 'PLAYOFFS';
    setPartidaTime1('');
    setPartidaTime2('');
    setPartidaGrupo(isPlayoff ? 'PLAYOFF' : grupoSelecionado);
    setPartidaSemana(isPlayoff ? 'QUARTAS' : 'SEMANA1');
    setPartidaData('');
    setPartidaHora('');
    setModalAgendarOpen(true);
  };

  const handleAgendarPartida = async () => {
    if (!partidaTime1 || !partidaTime2) { alert('❌ Selecione os dois times!'); return; }
    if (partidaTime1 === partidaTime2)  { alert('❌ Os times devem ser diferentes!'); return; }
    if (!partidaData || !partidaHora)   { alert('❌ Data e horário são obrigatórios!'); return; }

    const isPlayoff = partidaGrupo === 'PLAYOFF' || partidaGrupo === 'PLAYOFFS';
    const fasePartida = isPlayoff ? 'PLAYOFFS' : (["SEMANA1","SEMANA2","SEMANA3"].includes(partidaSemana) ? "FASE_DE_GRUPOS" : "PLAYOFFS");

    setAgendando(true);
    try {
      await api.post('/partidas/agendar', null, {
        params: {
          idCampeonato: id,
          idTime1: partidaTime1,
          idTime2: partidaTime2,
          fasePartida,
          grupos: isPlayoff ? 'PLAYOFFS' : partidaGrupo,
          semana: partidaSemana,
          dataHora: `${partidaData}T${partidaHora}:00`
        }
      });
      alert('✅ Partida agendada com sucesso!');
      setModalAgendarOpen(false);
    } catch (err) {
      alert(`❌ ${err.response?.data?.mensagem || 'Erro ao agendar partida'}`);
    } finally {
      setAgendando(false);
    }
  };

  const isPlayoffAgendar = partidaGrupo === 'PLAYOFF' || partidaGrupo === 'PLAYOFFS';
  const timesDisponiveisAgendar = isPlayoffAgendar
    ? Object.values(timesInscritos).flat()
    : (timesInscritos[partidaGrupo] || []);

  if (loading) return <LoadingScreen />;
  if (error)   return (<><Navbar /><div className="erro-msg">{error}</div></>);
  if (!campeonato) return null;

  const isAdmin = user?.id === campeonato.idCriador;
  const isFaseGrupos = campeonato.formatoCampeonato === 'FASE_DE_GRUPOS_E_ELIMINATORIAS';

  const statusColors = {
    ABERTO: '#10b981', EM_ANDAMENTO: '#f59e0b', FECHADO: '#ef4444', FINALIZADO: '#6b7280'
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="page-container">

          {/* ── Topo: botão voltar ── */}
          <div className="page-topbar">
            <button className="btn-voltar-topo" onClick={() => navigate('/campeonatos')}>
              ← Voltar
            </button>
          </div>

          {/* ── Tabs ── */}
          <nav className="main-tabs">
            {['informacoes', 'partidas'].map(aba => (
              <button
                key={aba}
                className={`main-tab ${abaSelecionada === aba ? 'active' : ''}`}
                onClick={() => setAbaSelecionada(aba)}
              >
                {aba === 'informacoes' ? '📋 Informações' : '⚽ Partidas'}
              </button>
            ))}
          </nav>

          {/* ── Informações ── */}
          {abaSelecionada === 'informacoes' && (
            <div className="info-content">
              {/* Hero Card */}
              <div className="hero-card">
                <div className="hero-image-wrap">
                  <img src={formatarImagem(campeonato.imagemCampeonato)} alt={campeonato.nome} className="hero-image" />
                  <div className="hero-image-overlay" />
                </div>
                <div className="hero-body">
                  <div className="hero-badges">
                    <span className="badge" style={{ background: campeonato.tipo === 'GRATUITO' ? '#10b98120' : '#ef444420', color: campeonato.tipo === 'GRATUITO' ? '#10b981' : '#ef4444', borderColor: campeonato.tipo === 'GRATUITO' ? '#10b98140' : '#ef444440' }}>
                      {campeonato.tipo === 'GRATUITO' ? '🆓 Gratuito' : '💳 Pago'}
                    </span>
                    <span className="badge" style={{ background: `${statusColors[campeonato.status] || '#6b7280'}20`, color: statusColors[campeonato.status] || '#6b7280', borderColor: `${statusColors[campeonato.status] || '#6b7280'}40` }}>
                      {formatarStatus(campeonato.status)}
                    </span>
                  </div>
                  <h1 className="hero-title">{campeonato.nome}</h1>
                  <div className="hero-stats">
                    <div className="stat-item">
                      <span className="stat-icon">📅</span>
                      <div>
                        <div className="stat-label">Início</div>
                        <div className="stat-value">{campeonato.dataInicio}</div>
                      </div>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                      <span className="stat-icon">🏁</span>
                      <div>
                        <div className="stat-label">Término</div>
                        <div className="stat-value">{campeonato.dataFim || 'A definir'}</div>
                      </div>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                      <span className="stat-icon">💵</span>
                      <div>
                        <div className="stat-label">Prêmio</div>
                        <div className="stat-value">{campeonato.premio !== null ? `R$ ${Number(campeonato.valor || 0).toFixed(2)}` : '—'}</div>
                      </div>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                      <span className="stat-icon">🎟️</span>
                      <div>
                        <div className="stat-label">Entrada</div>
                        <div className="stat-value">{campeonato.tipo === 'GRATUITO' ? 'Gratuito' : `R$ ${Number(campeonato.valorPorEquipe || 0).toFixed(2)}`}</div>
                      </div>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                      <span className="stat-icon">👥</span>
                      <div>
                        <div className="stat-label">Equipes</div>
                        <div className="stat-value">{campeonato.maxEquipes}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hero-actions">
                  {isAdmin && <button className="btn-primary" onClick={abrirModal}>✏️ Editar</button>}
                  <button className="btn-ghost" onClick={() => navigate('/campeonatos')}>← Voltar</button>
                </div>
              </div>

              {/* Descrição */}
              <div className="section-card">
                <div className="section-header">
                  <span className="section-icon">📝</span>
                  <h2 className="section-title">Descrição</h2>
                </div>
                <p className="desc-text">{campeonato.descricao || 'Nenhuma descrição disponível.'}</p>
              </div>

              {/* Chaveamento / Tabela */}
              {campeonato.formatoCampeonato === 'TABELA_ELIMINATORIAS' ? (
                <TabelaEliminatorias times={Object.values(timesInscritos).flat()} maxEquipes={campeonato.maxEquipes} />
              ) : (
                <Chaveamento grupos={timesInscritos} maxEquipes={campeonato.maxEquipes} />
              )}
            </div>
          )}

          {/* ── Partidas ── */}
          {abaSelecionada === 'partidas' && (
            <div className="partidas-content">
              {isFaseGrupos && (
                <div className="sub-tabs">
                  <button className={`sub-tab ${subAbaPartidas === 'grupos' ? 'active' : ''}`} onClick={() => setSubAbaPartidas('grupos')}>
                    🏟️ Fase de Grupos
                  </button>
                  <button className={`sub-tab ${subAbaPartidas === 'playoffs' ? 'active' : ''}`} onClick={() => setSubAbaPartidas('playoffs')}>
                    🏆 Playoffs
                  </button>
                </div>
              )}

              {isFaseGrupos ? (
                subAbaPartidas === 'grupos' ? (
                  <PartidasGrupos idCampeonato={id} onAgendarPartida={abrirModalAgendarPartida} isAdmin={isAdmin} onEditarPlacar={abrirModalPlacar} />
                ) : (
                  <PlayoffsBracket idCampeonato={id} isAdmin={isAdmin} onEditarPlacar={abrirModalPlacar} timesInscritos={timesInscritos} />
                )
              ) : (
                <PartidasSimples times={Object.values(timesInscritos).flat()} maxEquipes={campeonato.maxEquipes} onAgendarPartida={abrirModalAgendarPartida} isAdmin={isAdmin} onEditarPlacar={abrirModalPlacar} />
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Modal Editar Campeonato ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">✏️ Editar Campeonato</h2>
            <div className="modal-field">
              <label>Nome do Campeonato</label>
              <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} />
            </div>
            <div className="modal-field">
              <label>Descrição</label>
              <textarea value={campeonato.descricao} onChange={e => setCampeonato({ ...campeonato, descricao: e.target.value })} rows={3} />
            </div>
            <div className="modal-field">
              <label>Status</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                {(() => {
                  const s = campeonato.status;
                  if (s === 'ABERTO')       return (<><option value="EM_ANDAMENTO">Em Andamento</option><option value="FECHADO">Fechado</option></>);
                  if (s === 'EM_ANDAMENTO') return <option value="FINALIZADO">Finalizado</option>;
                  if (s === 'FECHADO')      return <option value="EM_ANDAMENTO">Reabrir</option>;
                  return <option value="FINALIZADO">Finalizado</option>;
                })()}
              </select>
            </div>
            <div className="modal-field">
              <label>Imagem</label>
              <input type="file" accept="image/*" onChange={handleImagemChange} />
              {previewImagem && <img src={previewImagem} alt="Preview" className="preview-img" />}
            </div>
            <div className="modal-buttons">
              <button className="btn-salvar" disabled={saving} onClick={handleSalvarEdicao}>{saving ? 'Salvando…' : 'Salvar'}</button>
              <button className="btn-cancelar" onClick={() => setModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Editar Placar ── */}
      {modalPlacarOpen && partidaEditando && (
        <div className="modal-overlay" onClick={() => setModalPlacarOpen(false)}>
          <div className="modal-content modal-placar" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">✏️ Editar Placar</h2>
            <div className="placar-edit-row">
              <div className="placar-edit-time">
                <img src={partidaEditando.time1.imagem} alt={partidaEditando.time1.nome} />
                <span>{partidaEditando.time1.nome}</span>
                <input type="number" min="0" max="99" value={editScore1} onChange={e => setEditScore1(Number(e.target.value))} />
              </div>
              <span className="placar-edit-x">×</span>
              <div className="placar-edit-time">
                <img src={partidaEditando.time2.imagem} alt={partidaEditando.time2.nome} />
                <span>{partidaEditando.time2.nome}</span>
                <input type="number" min="0" max="99" value={editScore2} onChange={e => setEditScore2(Number(e.target.value))} />
              </div>
            </div>
            <p className="placar-hint">Vitória normal: 7 a 0–5 &nbsp;|&nbsp; Overtime: 8 a 6 ou 8 a 7</p>
            <div className="modal-buttons">
              <button className="btn-salvar" disabled={salvandoPlacar} onClick={handleSalvarPlacar}>{salvandoPlacar ? 'Salvando…' : 'Salvar'}</button>
              <button className="btn-cancelar" disabled={salvandoPlacar} onClick={() => setModalPlacarOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Agendar Partida ── */}
      {modalAgendarOpen && (
        <div className="modal-overlay" onClick={() => setModalAgendarOpen(false)}>
          <div className="modal-content modal-agendar" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">⚔️ Agendar Partida</h2>
            <div className="agendar-grid">
              <div className="modal-field">
                <label>Grupo / Fase</label>
                <select value={partidaGrupo} onChange={e => { setPartidaGrupo(e.target.value); setPartidaTime1(''); setPartidaTime2(''); }}>
                  <option value="A">Grupo A</option>
                  <option value="B">Grupo B</option>
                  <option value="C">Grupo C</option>
                  <option value="D">Grupo D</option>
                  <option value="PLAYOFF">Playoffs</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Semana / Fase</label>
                {isPlayoffAgendar ? (
                  <select value={partidaSemana} onChange={e => setPartidaSemana(e.target.value)}>
                    <option value="QUARTAS">Quartas de Final</option>
                    <option value="SEMIFINAL">Semifinal</option>
                    <option value="FINAL">Final</option>
                    <option value="TERCEIRO_LUGAR">3º Lugar</option>
                  </select>
                ) : (
                  <select value={partidaSemana} onChange={e => setPartidaSemana(e.target.value)}>
                    <option value="SEMANA1">Semana 1</option>
                    <option value="SEMANA2">Semana 2</option>
                    <option value="SEMANA3">Semana 3</option>
                  </select>
                )}
              </div>
              <div className="modal-field">
                <label>Time 1</label>
                <select value={partidaTime1} onChange={e => setPartidaTime1(e.target.value)}>
                  <option value="">Selecione</option>
                  {timesDisponiveisAgendar.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div className="modal-field">
                <label>Time 2</label>
                <select value={partidaTime2} onChange={e => setPartidaTime2(e.target.value)}>
                  <option value="">Selecione</option>
                  {timesDisponiveisAgendar.filter(t => t.id !== Number(partidaTime1)).map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div className="modal-field">
                <label>Data</label>
                <input type="date" value={partidaData} onChange={e => setPartidaData(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="modal-field">
                <label>Hora</label>
                <input type="time" value={partidaHora} onChange={e => setPartidaHora(e.target.value)} />
              </div>
            </div>
            <div className="info-warning">⚠️ Data e horário são obrigatórios</div>
            <div className="modal-buttons">
              <button className="btn-salvar" disabled={agendando || !partidaData || !partidaHora} onClick={handleAgendarPartida}>{agendando ? 'Agendando…' : 'Agendar'}</button>
              <button className="btn-cancelar" disabled={agendando} onClick={() => setModalAgendarOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoEditCampeonatos;