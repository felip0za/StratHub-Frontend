import React, { useEffect, useState } from 'react';
import './Profile.css';
import Navbar from '../../Components/Navbar/Navbar';
import Icon from '@mdi/react';
import { mdiUbisoft } from '@mdi/js';
import { useParams } from 'react-router-dom';
import { useApi } from '../../Services/API';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';

// Imagens dos ranks
import ferro from '../../assets/ferro.png';
import bronze from '../../assets/bronze.png';
import prata from '../../assets/prata.png';
import ouro from '../../assets/ouro.png';
import platina from '../../assets/platina.png';
import master from '../../assets/master.png';
import challenger from '../../assets/challenger.png';
import noRank from '../../assets/noRank.png';

// Ranks de usuário (R6)
import COBREII from '../../assets/ranks/cobre/COBREII.png';
import COBREIII from '../../assets/ranks/cobre/COBREIII.png';

function Profile() {
  const { id } = useParams();
  const api = useApi();

  const [usuario, setUsuario] = useState(null);
  const [time, setTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendRequestStatus, setFriendRequestStatus] = useState('');
  const [error, setError] = useState('');
  const [isAmigo, setIsAmigo] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
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

        // Verifica se o usuário logado é amigo
        try {
          const { data: amigos } = await api.get('/amizade/amigos', { headers });
          const amigoExiste = amigos.some((amigo) => amigo.id === parseInt(id));
          setIsAmigo(amigoExiste);
        } catch {
          setIsAmigo(false);
        }

        // Busca dados do time (se houver)
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
        console.error(err);
        setError('Erro ao carregar o perfil.');
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
      const msg = err?.response?.data?.message || 'Erro ao enviar pedido de amizade.';
      setFriendRequestStatus(`❌ ${msg}`);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error)
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <p className="error-message">{error}</p>
        </div>
      </>
    );

  const imagemUsuario = usuario.imagemUsuario
    ? usuario.imagemUsuario.startsWith('data:image')
      ? usuario.imagemUsuario
      : `data:image/png;base64,${usuario.imagemUsuario}`
    : '/default-user.png';

  const rankToImage = {
    FERRO: ferro,
    BRONZE: bronze,
    PRATA: prata,
    OURO: ouro,
    PLATINA: platina,
    MASTER: master,
    CHALLENGER: challenger,
  };

  const rankUsuarioToImage = {
    COBREII: COBREII,
    COBREIII: COBREIII,
  };

  const imagemRankTime = time?.rank
    ? rankToImage[time.rank.toUpperCase()] || noRank
    : noRank;

  const rankUsuarioKey = usuario.rank
    ? usuario.rank.replace(/\s+/g, '').toUpperCase()
    : '';
  const imagemRankUsuario =
    rankUsuarioKey && rankUsuarioToImage[rankUsuarioKey]
      ? rankUsuarioToImage[rankUsuarioKey]
      : noRank;

  return (
    <>
      <Navbar />
      <div className="profile-container">
        {/* Cabeçalho */}
        <div className="profile-header">
          <img
            className="profile-avatar"
            src={imagemUsuario}
            alt={`Foto de ${usuario.nome || 'usuário'}`}
          />
          <div className="profile-text">
            <h1 className="profile-nome">
              {usuario.apelidoTime && <span className="profile-apelido">{usuario.apelidoTime} | </span>}
              {usuario.nome || 'Nome não disponível'}
            </h1>

            <p className="profile-email">
              <strong className="ubisoft-text">
                <Icon path={mdiUbisoft} size={1} className="ubisoft-icon" />
                Ubisoft Connect:
              </strong>
              <span className="ubi-connect-valor">
                {usuario.ubiConnect || 'Não informado'}
              </span>
            </p>

            <p className="profile-kd">
              <strong>K/D:</strong>{' '}
              {usuario.kd !== undefined && usuario.kd !== null
                ? usuario.kd.toFixed(2)
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Corpo */}
        <div className="profile-body">
          {/* Rank do time */}
          <div className="rank-card">
            <h3 className="rank-title">Rank do time:</h3>
            <img
              className="rank-image"
              src={imagemRankTime}
              alt="Rank do time"
            />
            <p className="rank-name">{time?.rank || 'Sem rank'}</p>
            {time?.tag && (
              <p className="time-tag">
                <strong>Tag do time:</strong> {time.tag}
              </p>
            )}
          </div>
          {/* Rank do usuário */}
          <div className="rank-usuario-card">
            <h3 className="rank-title">Rank do usuário:</h3>
            <img
              className="rank-usuario-image"
              src={imagemRankUsuario}
              alt="Rank do usuário"
            />
            <p className="rank-usuario-name">{usuario.rank || 'Sem rank'}</p>
          </div>

          {/* Títulos */}
          <div className="titles-card">
            <h3 className="titles-header">Títulos:</h3>
            <div className="titles-list">
              {usuario.titulos && usuario.titulos.length > 0 ? (
                usuario.titulos.map((titulo, index) => (
                  <div key={index} className="title-item">
                    <img
                      className="champ-image"
                      src={
                        titulo.imagem
                          ? `data:image/png;base64,${titulo.imagem}`
                          : '/default-campeonato.png'
                      }
                      alt={titulo.nome}
                    />
                    <p className="title-name">{titulo.nome}</p>
                  </div>
                ))
              ) : (
                <p className="no-titles">Nenhum título conquistado.</p>
              )}
            </div>
          </div>
        </div>

        {/* Botão de amizade */}
        {!isAmigo && (
          <div className="profile-actions">
            <button className="btn add-friend" onClick={handleAddFriend}>
              📨 Adicionar Amizade
            </button>
            {friendRequestStatus && (
              <p className="friend-request-status">{friendRequestStatus}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;
