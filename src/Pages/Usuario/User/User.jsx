import './User.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../../../Services/API';
import Icon from '@mdi/react';
import { mdiUbisoft } from '@mdi/js';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { FaWindows, FaXbox, FaPlaystation } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";

// Ranks
import ferro from '../../../assets/ferro.png';
import bronze from '../../../assets/bronze.png';
import prata from '../../../assets/prata.png';
import ouro from '../../../assets/ouro.png';
import platina from '../../../assets/platina.png';
import challenger from '../../../assets/challenger.png';
import master from '../../../assets/master.png';
import noRank from '../../../assets/noRank.png';

// imagem default
import avatardefault from '/src/assets/avatar-default.png';

function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { token, logout, userId } = useAuth();

  const [usuario, setUsuario] = useState(null);
  const [time, setTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Amizade
  const [isAmigo, setIsAmigo] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState({ nome: '', ubiConnect: '', plataforma: '' });
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    if (!id) {
      setError('ID do usuário não fornecido.');
      setLoading(false);
      return;
    }

    async function fetchUsuario() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const { data: usuarioData } = await api.get(`/usuario/${id}`, { headers });
        setUsuario(usuarioData);

        // Preenche dados do modal para edição
        setEditData({
          nome: usuarioData.nome || '',
          ubiConnect: usuarioData.ubiConnect || '',
          plataforma: usuarioData.plataforma || ''
        });

        if (parseInt(id) !== userId) {
          const { data: amigos } = await api.get('/amizade/amigos', { headers });
          setIsAmigo(amigos.some(a => a.id === parseInt(id)));
        }

        const timeId = usuarioData.time?.id || usuarioData.idTime;
        if (timeId) {
          const { data: timeData } = await api.get(`/times/${timeId}`, { headers });
          setTime(timeData);
        } else setTime(null);

      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        setError('Erro ao carregar os dados do usuário.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsuario();
  }, [id, api]);

  const handleAddFriend = async () => {
    try {
      await api.post(`/amizade/convidar/${id}`);
      setFriendRequestStatus('✅ Pedido de amizade enviado!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erro ao enviar pedido.';
      setFriendRequestStatus(`❌ ${msg}`);
    }
  };

  const handleSair = () => {
    logout();
    navigate("/login");
  };

  // Modal handlers
  const handleEditClick = () => setModalOpen(true);
  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setEditData(prev => ({
      ...prev,
      imagemUsuario: reader.result
    }));
  };
  reader.readAsDataURL(file);
};

  const handleModalClose = () => {
    setModalOpen(false);
    setEditStatus('');
  };
  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await api.put(`/usuario/${id}`, editData, { headers });
      setUsuario(data);
      setEditStatus('✅ Perfil atualizado!');
      setTimeout(() => setModalOpen(false), 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erro ao atualizar perfil.';
      setEditStatus(`❌ ${msg}`);
    }
  };

  const handleReportUser = async (e) => {
  e.preventDefault();
  navigate(`/report-user/${id}`);
};


  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <p className="error-message">{error}</p>
        </div>
      </>
    );
  }

  const imagemUsuario = usuario.imagemUsuario
    ? (usuario.imagemUsuario.startsWith('data:image')
        ? usuario.imagemUsuario
        : `data:image/png;base64,${usuario.imagemUsuario}`)
    : avatardefault;

  const rankToImage = {
    FERRO: ferro,
    BRONZE: bronze,
    PRATA: prata,
    OURO: ouro,
    PLATINA: platina,
    MASTER: master,
    CHALLENGER: challenger
  };

  const imagemRankTime = time?.rank
    ? rankToImage[time.rank.toUpperCase()] || noRank
    : noRank;

  const nomeRankTime = time?.rank || 'Sem rank';

  return (
    <>
      <Navbar />
      <div className="profile-container">
        {/* HEADER */}
        <div className="profile-header">
          <img className="profile-avatar" src={imagemUsuario} alt="Foto" />

          <div className="profile-text">
            <h1 className="profile-nome">
              {usuario.apelidoTime && (
                <span className="profile-apelido">{usuario.apelidoTime} | </span>
              )}
              {usuario.nome}
            </h1>

            {/* UbiConnect */}
            <p className="profile-ubi">
              <strong className="ubisoft-text">
                <Icon path={mdiUbisoft} size={1} className="ubisoft-icon" />
                UbiConnect:
              </strong>
              <span className="ubi-connect-valor">{usuario.ubiConnect || 'Não informado'}</span>
            </p>

            {/* Plataforma */}
            <p className="profile-ubi platform-row">
              <strong className="ubisoft-text">Plataforma:</strong>
              {usuario.plataforma ? (
                <span className="platform-info platform-inline">
                  {usuario.plataforma.toUpperCase() === "PC" && (
                    <span className="platform-item">
                      <FaWindows size={22} color="#00A4EF" />
                      <span>PC</span>
                    </span>
                  )}
                  {usuario.plataforma.toUpperCase() === "XBOX" && (
                    <span className="platform-item">
                      <FaXbox size={22} color="#107C10" />
                      <span>Xbox</span>
                    </span>
                  )}
                  {usuario.plataforma.toUpperCase() === "PLAYSTATION" && (
                    <span className="platform-item">
                      <FaPlaystation size={22} color="#003791" />
                      <span>PlayStation</span>
                    </span>
                  )}
                </span>
              ) : (
                <span className="platform-info">Não informado</span>
              )}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="profile-body">
          {/* Rank */}
          <div className="rank-card">
            <h3 className="rank-title">Rank do time:</h3>
            <img className="rank-image" src={imagemRankTime} alt="Rank" />
            <p className="rank-name">{nomeRankTime}</p>
            {time?.tag && <p className="time-tag">Tag: {time.tag}</p>}
          </div>

          {/* Títulos */}
          <div className="titles-card">
            <h3 className="titles-header">Títulos:</h3>
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

        {/* BOTÕES */}
        <div className="profile-actions">
          {usuario.id === userId && (
            <>
              <button className="btn edit" onClick={handleEditClick}>
                ✏️ Editar Perfil
              </button>
              <button type="button" className="btn edit" onClick={handleSair}>
                Sair
              </button>
            </>
          )}

          {usuario.id !== userId && (
            <>
              {!isAmigo && (
                <button className="btn add-friend" onClick={handleAddFriend}>
                  📨 Adicionar Amizade
                </button>
              )}

              <button className="btn report" onClick={handleReportUser}>
                🚨 Reportar Usuário
              </button>
              
              {friendRequestStatus && (
                <p className="friend-request-status">{friendRequestStatus}</p>
              )}
            </>
          )}
        </div>

        {/* MODAL */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">

              {/* Avatar */}
              <div className="modal-avatar-wrapper">
                <label className="modal-avatar-label">
                  <img
                    src={
                      editData.imagemUsuario
                        ? (editData.imagemUsuario.startsWith("data:image")
                            ? editData.imagemUsuario
                            : `data:image/png;base64,${editData.imagemUsuario}`)
                        : avatardefault
                    }
                    alt="Avatar"
                    className="modal-avatar"
                  />

                  <div className="modal-avatar-overlay">Trocar foto</div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="modal-avatar-input"
                  />
                </label>
              </div>

              <h2>Editar Perfil</h2>

              <label>
                Nome:
                <input
                  type="text"
                  name="nome"
                  value={editData.nome}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                UbiConnect:
                <input
                  type="text"
                  name="ubiConnect"
                  value={editData.ubiConnect}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                Plataforma:
                <select
                  name="plataforma"
                  value={editData.plataforma}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione</option>
                  <option value="PC">PC</option>
                  <option value="XBOX">Xbox</option>
                  <option value="PLAYSTATION">PlayStation</option>
                </select>
              </label>

              {editStatus && <p className="edit-status">{editStatus}</p>}

              <div className="modal-actions">
                <button className="btn save" onClick={handleSaveEdit}>💾 Salvar</button>
                <button className="btn cancel" onClick={handleModalClose}>❌ Cancelar</button>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default User;
