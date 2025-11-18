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

  useEffect(() => {
    if (!id) {
      setError('ID do usuário não fornecido.');
      setLoading(false);
      return;
    }

    async function fetchUsuario() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Busca o usuário
        const { data: usuarioData } = await api.get(`/usuario/${id}`, { headers });
        setUsuario(usuarioData);

        // Verifica amizade (se não for você mesmo)
        if (parseInt(id) !== userId) {
          try {
            const { data: amigos } = await api.get('/amizade/amigos', { headers });
            const amigoExiste = amigos.some(a => a.id === parseInt(id));
            setIsAmigo(amigoExiste);
          } catch {
            setIsAmigo(false);
          }
        }

        // Busca time
        const timeId = usuarioData.time?.id || usuarioData.idTime;
        if (timeId) {
          try {
            const { data: timeData } = await api.get(`/times/${timeId}`, { headers });
            setTime(timeData);
          } catch {
            setTime(null);
          }
        } else {
          setTime(null);
        }

      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        setError('Erro ao carregar os dados do usuário.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsuario();
  }, [id, api]);

  // Enviar convite de amizade
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

  const handleEdit = () => {
    navigate(`/editar-usuario/${id}`);
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

          {/* Campeonatos */}
          <div className="titles-card">
            <h3 className="titles-header">Campeonatos Participados:</h3>

            <div className="titles-list">
              {usuario.campeonatos?.length > 0 ? (
                usuario.campeonatos.map((c, i) => (
                  <div className="title-item" key={i}>
                    <img
                      className="champ-image"
                      src={c.imagem ? `data:image/png;base64,${c.imagem}` : '/default-campeonato.png'}
                      alt={c.nome}
                    />
                    <p className="title-name">{c.nome}</p>
                  </div>
                ))
              ) : (
                <p className="no-titles">Nenhum campeonato participado.</p>
              )}
            </div>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="profile-actions">

          {/* Se for o próprio usuário → apenas Editar + Sair */}
          {usuario.id === userId && (
            <>
              <button className="btn edit" onClick={handleEdit}>
                ✏️ Editar Perfil
              </button>

              <button type="button" className="btn edit" onClick={handleSair}>
                Sair
              </button>
            </>
          )}

          {/* Se NÃO for o próprio usuário */}
          {usuario.id !== userId && (
            <>
              {/* Se NÃO for amigo → botão adicionar */}
              {!isAmigo && (
                <button className="btn add-friend" onClick={handleAddFriend}>
                  📨 Adicionar Amizade
                </button>
              )}

              {/* Status */}
              {friendRequestStatus && (
                <p className="friend-request-status">{friendRequestStatus}</p>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default User;
