import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import { useAuth } from '../../../contexts/AuthContext';
import Navbar from '../../../Components/Navbar/Navbar';
import Icon from '@mdi/react';
import { mdiUbisoft } from '@mdi/js';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import ferro      from '../../../assets/ferro.png';
import bronze     from '../../../assets/bronze.png';
import prata      from '../../../assets/prata.png';
import ouro       from '../../../assets/ouro.png';
import platina    from '../../../assets/platina.png';
import challenger from '../../../assets/challenger.png';
import master     from '../../../assets/master.png';
import { FaInstagram, FaDiscord, FaTwitter } from 'react-icons/fa';
import timedefault  from '../../../assets/time_default.png';
import avatardefault from '../../../assets/avatar-default.png';
import './Times.css';

const RANK_IMAGE = { FERRO: ferro, BRONZE: bronze, PRATA: prata, OURO: ouro, PLATINA: platina, CHALLENGER: challenger, MASTER: master };

/* ─────────────────────────────────────────────
   Modal de Edição (substitui EditTime.jsx)
───────────────────────────────────────────── */
const ModalEditarTime = ({ time, onClose, onSaved }) => {
  const api = useApi();
  const { id } = useParams();

  const [form, setForm] = useState({
    nome:        time.nome        || '',
    apelido:     time.apelido     || '',
    descricao:   time.descricao   || '',
    imagemBase64: time.imagemBase64
      ? (time.imagemBase64.startsWith('data:image') ? time.imagemBase64 : `data:image/png;base64,${time.imagemBase64}`)
      : '',
    instagram: time.instagram || '',
    discord:   time.discord   || '',
    twitter:   time.twitter   || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, imagemBase64: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        imagemBase64: form.imagemBase64.replace(/^data:image\/\w+;base64,/, ''),
      };
      await api.put(`/times/${id}`, payload);
      onSaved();
      onClose();
    } catch {
      alert('Erro ao atualizar time.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tm-modal-overlay" onClick={onClose}>
      <div className="tm-modal" onClick={e => e.stopPropagation()}>
        <div className="tm-modal-header">
          <h2 className="tm-modal-title">✏️ Editar Time</h2>
          <button className="tm-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="tm-edit-form">
          {/* Imagem */}
          <div className="tm-edit-avatar-wrap">
            <label className="tm-edit-avatar-label">
              <img
                src={form.imagemBase64 || timedefault}
                alt="Logo"
                className="tm-edit-avatar"
              />
              <div className="tm-edit-avatar-overlay">Trocar foto</div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="tm-edit-file-input" />
            </label>
          </div>

          <div className="tm-edit-grid">
            <div className="tm-modal-field">
              <label>Nome do Time</label>
              <input type="text" name="nome" value={form.nome} onChange={handleChange} required />
            </div>

            <div className="tm-modal-field">
              <label>Tag (apelido)</label>
              <input
                type="text"
                name="apelido"
                value={form.apelido}
                onChange={e => setForm(prev => ({ ...prev, apelido: e.target.value.slice(0, 5).toUpperCase() }))}
                maxLength={5}
                placeholder="Máx. 5 letras"
              />
            </div>

            <div className="tm-modal-field tm-col-span">
              <label>Descrição</label>
              <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3} />
            </div>

            <div className="tm-modal-field">
              <label>Instagram</label>
              <input type="text" name="instagram" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
            </div>

            <div className="tm-modal-field">
              <label>Discord</label>
              <input type="text" name="discord" value={form.discord} onChange={handleChange} placeholder="https://discord.gg/..." />
            </div>

            <div className="tm-modal-field tm-col-span">
              <label>Twitter (X)</label>
              <input type="text" name="twitter" value={form.twitter} onChange={handleChange} placeholder="https://twitter.com/..." />
            </div>
          </div>

          <div className="tm-modal-actions">
            <button type="submit" className="tm-btn-salvar" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </button>
            <button type="button" className="tm-btn-cancelar" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Componente principal
───────────────────────────────────────────── */
function Times() {
  const [time, setTime]                 = useState(null);
  const [membros, setMembros]           = useState([]);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(true);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [amigos, setAmigos]             = useState([]);
  const [contextMenu, setContextMenu]   = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();
  const { id }   = useParams();
  const api      = useApi();
  const { user } = useAuth();

  const carregarDados = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);
      const [timeRes, membrosRes, pontuacaoRes] = await Promise.all([
        api.get(`/times/${id}`),
        api.get(`/times/${id}/membros`),
        api.get(`/times/${id}/pontuacao`),
      ]);
      setTime({ ...timeRes.data, pontuacao: pontuacaoRes?.data?.pontuacao ?? 0 });
      setMembros(membrosRes.data || []);
      setError('');
    } catch {
      setError('Erro ao carregar dados do time.');
      setTime(null);
      setMembros([]);
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let ativo = true;
    carregarDados(true);
    const intervalo = setInterval(() => { if (ativo) carregarDados(false); }, 5000);
    const handleGlobalClick = () => { if (contextMenu) { setContextMenu(null); setSelectedMember(null); } };
    window.addEventListener('click', handleGlobalClick);
    return () => { ativo = false; clearInterval(intervalo); window.removeEventListener('click', handleGlobalClick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const buscarAmigos = async () => {
    try {
      const res = await api.get('/amizade/amigos');
      setAmigos(res.data || []);
      setShowInvitePopup(true);
    } catch { alert('Erro ao buscar amigos.'); }
  };

  const convidarParaTime = async (idAmigo) => {
    try {
      await api.post('/convites/enviar', { idTime: time.id, idConvidado: idAmigo, idSolicitante: user.id });
      alert('Convite enviado!');
    } catch { alert('Erro ao enviar convite.'); }
  };

  const handleLeaveTeam = async () => {
    if (!time || !window.confirm('Tem certeza que deseja sair do time?')) return;
    try {
      setLoading(true);
      const isDono = user?.id === time?.idCriador;
      if (membros.length === 1 && isDono) {
        await api.delete(`/times/${id}`);
        alert('Time excluído.');
        navigate('/campeonatos');
      } else if (isDono) {
        alert('Você é o dono. Promova outro membro antes de sair.');
      } else {
        await api.post(`/times/${id}/sair`);
        alert('Você saiu do time.');
        navigate('/campeonatos');
      }
    } catch (err) {
      alert(err.response?.status === 403 ? (err.response.data || 'Sem permissão.') : 'Erro ao sair do time.');
    } finally { setLoading(false); }
  };

  const openContextMenu = (e, member) => {
    e.preventDefault(); e.stopPropagation();
    if (!time || !(user?.id === time.idCriador && member.id !== user.id)) return;
    let x = e.pageX, y = e.pageY;
    if (x + 160 > window.innerWidth) x -= 160;
    if (y + 100 > window.innerHeight) y -= 100;
    setSelectedMember(member);
    setContextMenu({ x, y });
  };

  const closeContextMenu = () => { setContextMenu(null); setSelectedMember(null); };

  const expulsarMembro = async () => {
    if (!selectedMember || !window.confirm(`Expulsar ${selectedMember.nome}?`)) { closeContextMenu(); return; }
    try { await api.post(`/times/${id}/expulsar`, { idUsuario: selectedMember.id }); alert('Membro expulso!'); await carregarDados(false); }
    catch { alert('Erro ao expulsar.'); }
    finally { closeContextMenu(); }
  };

  const promoverParaDono = async () => {
    if (!selectedMember || !window.confirm(`Promover ${selectedMember.nome} a dono?`)) { closeContextMenu(); return; }
    try { await api.post(`/times/${id}/promover`, { idNovoDono: selectedMember.id }); alert('Novo dono promovido!'); await carregarDados(false); }
    catch { alert('Erro ao promover.'); }
    finally { closeContextMenu(); }
  };

  const getMembroImg = (m) =>
    m.imagemUsuario?.startsWith?.('data:image') ? m.imagemUsuario
    : m.imagemUsuario ? `data:image/*;base64,${m.imagemUsuario}`
    : avatardefault;

  if (loading) return <><Navbar /><LoadingScreen /></>;
  if (error)   return <><Navbar /><div className="tm-error">{error}</div></>;

  const imagemTime   = time?.imagemBase64 ? `data:image/*;base64,${time.imagemBase64}` : timedefault;
  const timePontuacao = time?.pontuacao || 0;
  const rankImage    = time?.rank ? RANK_IMAGE[time.rank.toUpperCase()] : null;
  const pontuacaoProximo = timePontuacao < 800 ? 800 : null;
  const progresso = pontuacaoProximo ? Math.min(100, (timePontuacao / pontuacaoProximo) * 100).toFixed(1) : 0;
  const isOwner  = user?.id === time?.idCriador;
  const isMember = membros.some(m => m.id === user?.id);

  return (
    <>
      <Navbar />
      <div className="tm-page">
        <div className="tm-container">

          {/* ── Sidebar esquerda ── */}
          <aside className="tm-sidebar">
            <div className="tm-profile-card">

              {/* Avatar */}
              <div className="tm-avatar-wrap">
                <img src={imagemTime} alt="Logo do time" className="tm-avatar" />
              </div>

              {/* Nome + Tag */}
              <h1 className="tm-name">{time?.nome}</h1>
              {time?.apelido && <span className="tm-tag">[{time.apelido}]</span>}

              {/* Descrição */}
              <div className="tm-info-section">
                <p className="tm-info-label">Descrição</p>
                <p className="tm-info-value">{time?.descricao || '—'}</p>
              </div>

              {/* Rank */}
              <div className="tm-info-section">
                <p className="tm-info-label">Rank</p>
                {rankImage ? (
                  <div className="tm-rank-wrap">
                    <img src={rankImage} alt={time?.rank} className="tm-rank-img" />
                    <span className={`tm-rank-badge rank-${time?.rank?.toLowerCase()}`}>{time?.rank}</span>
                  </div>
                ) : (
                  <p className="tm-info-value">Sem rank</p>
                )}
                {pontuacaoProximo && (
                  <div className="tm-progress-wrap">
                    <div className="tm-progress-bar">
                      <div className="tm-progress-fill" style={{ width: `${progresso}%` }} />
                    </div>
                    <span className="tm-progress-label">{timePontuacao} / {pontuacaoProximo} pts</span>
                  </div>
                )}
                {timePontuacao >= 800 && (
                  <span className="tm-classified">✓ Classificado</span>
                )}
              </div>

              {/* Redes sociais */}
              {(time?.instagram || time?.discord || time?.twitter) && (
                <div className="tm-socials">
                  {time.instagram && <a href={time.instagram} target="_blank" rel="noopener noreferrer" className="tm-social-link"><FaInstagram size={18} /></a>}
                  {time.discord   && <a href={time.discord}   target="_blank" rel="noopener noreferrer" className="tm-social-link"><FaDiscord   size={18} /></a>}
                  {time.twitter   && <a href={time.twitter}   target="_blank" rel="noopener noreferrer" className="tm-social-link"><FaTwitter   size={18} /></a>}
                </div>
              )}

              {/* Ações */}
              <div className="tm-actions">
                {isOwner && (
                  <button className="tm-btn-edit" onClick={() => setShowEditModal(true)}>
                    ✏️ Editar Time
                  </button>
                )}
                {isMember && (
                  <button className="tm-btn-leave" onClick={handleLeaveTeam}>
                    Sair do Time
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* ── Membros ── */}
          <main className="tm-main">
            <div className="tm-section-header">
              <span className="tm-section-icon">👥</span>
              <h2 className="tm-section-title">Membros</h2>
              <span className="tm-member-count">{membros.length} / 5</span>
            </div>

            <div className="tm-members-list">
              {membros.length > 0 ? membros.map((member, i) => (
                <div
                  key={member.id ?? i}
                  className="tm-member-card"
                  onClick={() => navigate(`/usuario/${member.id}`)}
                  onContextMenu={e => openContextMenu(e, member)}
                >
                  <img src={getMembroImg(member)} alt={member.nome} className="tm-member-avatar" />
                  <div className="tm-member-info">
                    <div className="tm-member-name">
                      {member.nome}
                      {member.id === time?.idCriador && <span className="tm-owner-badge">Dono</span>}
                    </div>
                    <div className="tm-member-meta">
                      <span className="tm-ubi-label">
                        <Icon path={mdiUbisoft} size={0.7} />
                        {member.ubiConnect || 'Não informado'}
                      </span>
                    </div>
                    <div className="tm-member-socials">
                      {member.instagram && <a href={member.instagram} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}><FaInstagram size={14} /></a>}
                      {member.discord   && <a href={member.discord}   target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}><FaDiscord   size={14} /></a>}
                      {member.twitter   && <a href={member.twitter}   target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}><FaTwitter   size={14} /></a>}
                    </div>
                  </div>
                  <span className="tm-member-arrow">→</span>
                </div>
              )) : (
                <div className="tm-empty-members">Nenhum membro encontrado.</div>
              )}
            </div>

            {isMember && membros.length < 5 && (
              <button className="tm-btn-add-member" onClick={buscarAmigos}>
                ➕ Adicionar Membro
              </button>
            )}
          </main>
        </div>
      </div>

      {/* ── Modal Editar Time ── */}
      {showEditModal && (
        <ModalEditarTime
          time={time}
          onClose={() => setShowEditModal(false)}
          onSaved={() => carregarDados(false)}
        />
      )}

      {/* ── Popup Convidar Amigos ── */}
      {showInvitePopup && (
        <div className="tm-modal-overlay" onClick={() => setShowInvitePopup(false)}>
          <div className="tm-modal tm-modal-invite" onClick={e => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h2 className="tm-modal-title">Convidar Amigos</h2>
              <button className="tm-modal-close" onClick={() => setShowInvitePopup(false)}>✕</button>
            </div>

            {amigos.length > 0 ? (
              <div className="tm-friends-grid">
                {amigos.map(amigo => {
                  const jaNoTime = membros.some(m => m.id === amigo.id);
                  return (
                    <div key={amigo.id} className="tm-friend-card">
                      <img
                        src={getMembroImg(amigo)}
                        alt={amigo.nome}
                        className="tm-friend-avatar"
                      />
                      <span className="tm-friend-nome">{amigo.nome}</span>
                      {jaNoTime ? (
                        <span className="tm-friend-in-team">✓ No time</span>
                      ) : (
                        <button className="tm-btn-convidar" onClick={() => convidarParaTime(amigo.id)}>
                          Convidar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="tm-no-friends">Você não possui amigos.</p>
            )}

            <button className="tm-btn-cancelar" style={{ marginTop: 16, width: '100%' }} onClick={() => setShowInvitePopup(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ── Menu contextual ── */}
      {contextMenu && (
        <div
          className="tm-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={expulsarMembro}>🚫 Expulsar</button>
          <button onClick={promoverParaDono}>👑 Promover a Dono</button>
        </div>
      )}
    </>
  );
}

export default Times;