import './User.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../../../Services/API';
import Icon from '@mdi/react';
import { mdiUbisoft } from '@mdi/js';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { FaWindows, FaXbox, FaPlaystation } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';

import ferro      from '../../../assets/ferro.png';
import bronze     from '../../../assets/bronze.png';
import prata      from '../../../assets/prata.png';
import ouro       from '../../../assets/ouro.png';
import platina    from '../../../assets/platina.png';
import challenger from '../../../assets/challenger.png';
import master     from '../../../assets/master.png';
import noRank     from '../../../assets/noRank.png';
import avatardefault from '/src/assets/avatar-default.png';

const RANK_MAP = { FERRO: ferro, BRONZE: bronze, PRATA: prata, OURO: ouro, PLATINA: platina, MASTER: master, CHALLENGER: challenger };

function User() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const api      = useApi();
  const { token, logout, userId } = useAuth();

  const [usuario, setUsuario]   = useState(null);
  const [time, setTime]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [isAmigo, setIsAmigo]   = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData]   = useState({ nome: '', ubiConnect: '', plataforma: '' });
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    if (!id) { setError('ID do usuário não fornecido.'); setLoading(false); return; }

    const fetchUsuario = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const { data } = await api.get(`/usuario/${id}`, { headers });
        setUsuario(data);
        setEditData({ nome: data.nome || '', ubiConnect: data.ubiConnect || '', plataforma: data.plataforma || '' });

        if (parseInt(id) !== userId) {
          const { data: amigos } = await api.get('/amizade/amigos', { headers });
          setIsAmigo(amigos.some(a => a.id === parseInt(id)));
        }

        const timeId = data.time?.id || data.idTime;
        if (timeId) {
          const { data: timeData } = await api.get(`/times/${timeId}`, { headers });
          setTime(timeData);
        } else {
          setTime(null);
        }
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        setError('Erro ao carregar os dados do usuário.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [id, api]);

  const handleAddFriend = async () => {
    try {
      await api.post(`/amizade/convidar/${id}`);
      setFriendRequestStatus('✅ Pedido de amizade enviado!');
    } catch (err) {
      setFriendRequestStatus(`❌ ${err?.response?.data?.message || 'Erro ao enviar pedido.'}`);
    }
  };

  const handleSair = () => { logout(); navigate('/login'); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditData(prev => ({ ...prev, imagemUsuario: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await api.put(`/usuario/${id}`, editData, { headers });
      setUsuario(data);
      setEditStatus('✅ Perfil atualizado!');
      setTimeout(() => setModalOpen(false), 1000);
    } catch (err) {
      setEditStatus(`❌ ${err?.response?.data?.message || 'Erro ao atualizar perfil.'}`);
    }
  };

  if (loading) return <LoadingScreen />;

  if (error) return (
    <><Navbar />
      <div className="profile-container">
        <p className="error-message">{error}</p>
      </div>
    </>
  );

  const imagemUsuario = usuario.imagemUsuario
    ? (usuario.imagemUsuario.startsWith('data:image') ? usuario.imagemUsuario : `data:image/png;base64,${usuario.imagemUsuario}`)
    : avatardefault;

  const imagemRankTime = time?.rank ? (RANK_MAP[time.rank.toUpperCase()] || noRank) : noRank;
  const nomeRankTime   = time?.rank || 'Sem rank';

  return (
    <>
      <Navbar />
      <div className="profile-container">

        {/* ── Header ── */}
        <div className="profile-header">
          <img className="profile-avatar" src={imagemUsuario} alt="Foto" />
          <div className="profile-text">
            <h1 className="profile-nome">
              {usuario.apelidoTime && <span className="profile-apelido">{usuario.apelidoTime} | </span>}
              {usuario.nome}
            </h1>

            <p className="profile-ubi">
              <strong className="ubisoft-text">
                <Icon path={mdiUbisoft} size={0.9} className="ubisoft-icon" />
                UbiConnect:
              </strong>
              <span className="ubi-connect-valor">{usuario.ubiConnect || 'Não informado'}</span>
            </p>

            <p className="profile-ubi platform-row">
              <strong className="ubisoft-text">Plataforma:</strong>
              {usuario.plataforma ? (
                <span className="platform-info platform-inline">
                  {usuario.plataforma.toUpperCase() === 'PC'          && <span className="platform-item"><FaWindows size={18} color="#00A4EF" /><span>PC</span></span>}
                  {usuario.plataforma.toUpperCase() === 'XBOX'        && <span className="platform-item"><FaXbox size={18} color="#107C10" /><span>Xbox</span></span>}
                  {usuario.plataforma.toUpperCase() === 'PLAYSTATION' && <span className="platform-item"><FaPlaystation size={18} color="#003791" /><span>PlayStation</span></span>}
                </span>
              ) : (
                <span className="platform-info">Não informado</span>
              )}
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="profile-body">
          <div className="rank-card">
            <p className="rank-title">Rank do Time</p>
            <img className="rank-image" src={imagemRankTime} alt="Rank" />
            <p className="rank-name">{nomeRankTime}</p>
            {time?.tag && <p className="time-tag">Tag: {time.tag}</p>}
          </div>

          <div className="titles-card">
            <h3 className="titles-header">Títulos</h3>
            <div className="titles-list">
              {usuario.titulos?.length > 0 ? (
                usuario.titulos.map((t, i) => (
                  <div className="title-item" key={i}>
                    <img
                      className="champ-image"
                      src={t.imagem ? `data:image/png;base64,${t.imagem}` : '/default-campeonato.png'}
                      alt={t.nome}
                    />
                    <p className="title-name">{t.nome}</p>
                  </div>
                ))
              ) : (
                <p className="no-titles">Nenhum título conquistado.</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Botões ── */}
        <div className="profile-actions">
          {usuario.id === userId && (
            <>
              <button className="btn edit" onClick={() => setModalOpen(true)}>✏️ Editar Perfil</button>
              <button className="btn-logout btn" onClick={handleSair}>Sair</button>
            </>
          )}

          {usuario.id !== userId && (
            <>
              {!isAmigo && (
                <button className="btn add-friend" onClick={handleAddFriend}>📨 Adicionar Amizade</button>
              )}
              <button className="btn report" onClick={e => { e.preventDefault(); navigate(`/report-user/${id}`); }}>
                🚨 Reportar
              </button>
              {friendRequestStatus && <p className="friend-request-status">{friendRequestStatus}</p>}
            </>
          )}
        </div>

        {/* ── Modal Editar Perfil ── */}
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>

              <div className="modal-avatar-wrapper">
                <label className="modal-avatar-label">
                  <img
                    src={editData.imagemUsuario || imagemUsuario}
                    alt="Avatar"
                    className="modal-avatar"
                  />
                  <div className="modal-avatar-overlay">Trocar foto</div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="modal-avatar-input" />
                </label>
              </div>

              <h2>Editar Perfil</h2>

              <label>
                Nome
                <input type="text" name="nome" value={editData.nome} onChange={e => setEditData({ ...editData, [e.target.name]: e.target.value })} />
              </label>

              <label>
                UbiConnect
                <input type="text" name="ubiConnect" value={editData.ubiConnect} onChange={e => setEditData({ ...editData, [e.target.name]: e.target.value })} />
              </label>

              <label>
                Plataforma
                <select name="plataforma" value={editData.plataforma} onChange={e => setEditData({ ...editData, [e.target.name]: e.target.value })}>
                  <option value="">Selecione</option>
                  <option value="PC">PC</option>
                  <option value="XBOX">Xbox</option>
                  <option value="PLAYSTATION">PlayStation</option>
                </select>
              </label>

              {editStatus && <p className="edit-status">{editStatus}</p>}

              <div className="modal-actions">
                <button className="btn save" onClick={handleSaveEdit}>💾 Salvar</button>
                <button className="btn cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default User;