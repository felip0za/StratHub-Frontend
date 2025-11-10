import './User.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../../../Services/API';
import Icon from '@mdi/react';
import { mdiUbisoft } from '@mdi/js';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { FaWindows, FaXbox, FaPlaystation } from "react-icons/fa";

// Imagens dos ranks do time
import ferro from '../../../assets/ferro.png';
import bronze from '../../../assets/bronze.png';
import prata from '../../../assets/prata.png';
import ouro from '../../../assets/ouro.png';
import platina from '../../../assets/platina.png';
import challenger from '../../../assets/challenger.png';
import master from '../../../assets/master.png';
import noRank from '../../../assets/noRank.png';

//imagem default
import avatardefault from '/src/assets/avatar-default.png';

function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();

  const [usuario, setUsuario] = useState(null);
  const [time, setTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        const timeId = usuarioData.time?.id || usuarioData.idTime;
        if (timeId) {
          try {
            const { data: timeData } = await api.get(`/times/${timeId}`, { headers });
            setTime(timeData);
          } catch (err) {
            console.error('Erro ao buscar o time:', err);
            setTime(null);
          }
        } else {
          setTime(null);
        }

      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        if (err.response?.status === 400 || err.response?.status === 404) {
          setError('Usuário não encontrado.');
        } else if (err.response?.status === 403) {
          setError('Acesso negado. Faça login novamente.');
        } else {
          setError('Erro ao carregar os dados do usuário.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsuario();
  }, [id, api]);

  const handleSair = () => {
    logout();
    navigate("/login");
  };

  const handleEdit = () => {
    navigate(`/editar-usuario/${id}`);
  };

  if (loading) return <LoadingScreen />;
  if (error) return (
    <>
      <Navbar />
      <div className="profile-container">
        <p className="error-message">{error}</p>
      </div>
    </>
  );

  const imagemUsuario = usuario.imagemUsuario
    ? (usuario.imagemUsuario.startsWith('data:image') 
        ? usuario.imagemUsuario 
        : `data:image/png;base64,${usuario.imagemUsuario}`
      )
    : avatardefault;

  // Mapeamento de ranks do time
  const rankToImage = { 
    FERRO: ferro, 
    BRONZE: bronze, 
    PRATA: prata, 
    OURO: ouro,
    PLATINA: platina, 
    CHALLENGER: challenger, 
    MASTER: master 
  };

  const imagemRankTime = time?.rank 
    ? (rankToImage[time.rank.toUpperCase()] || noRank) 
    : noRank;
  const nomeRankTime = time?.rank || 'Sem rank';

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <img className="profile-avatar" src={imagemUsuario} alt={`Foto de ${usuario.nome || 'usuário'}`} />
          <div className="profile-text">
            <h1 className="profile-nome">
              {usuario.apelidoTime && <span className="profile-apelido">{usuario.apelidoTime} | </span>}
              {usuario.nome || 'Nome não disponível'}
            </h1>

            <p className="profile-email">
              <strong className="ubisoft-text"><Icon path={mdiUbisoft} size={1} className="ubisoft-icon" /> UbiConnect:</strong><span className="ubi-connect-valor">{usuario.ubiConnect || 'Não informado'}</span>
            </p>
            <p className="profile-email">
              <strong className="ubisoft-text">Plataforma:</strong>{" "}
              {usuario.plataforma ? (
                <span className="ubi-connect-valor">
                  {usuario.plataforma.toUpperCase() === "PC" && (
                    <>
                      <FaWindows className="platform-icon pc" /> PC
                    </>
                  )}
                  {usuario.plataforma.toUpperCase() === "XBOX" && (
                    <>
                      <FaXbox className="platform-icon xbox" /> Xbox
                    </>
                  )}
                  {usuario.plataforma.toUpperCase() === "PLAYSTATION" && (
                    <>
                      <FaPlaystation className="platform-icon ps" /> PlayStation
                    </>
                  )}
                </span>
              ) : (
                <span className="ubi-connect-valor">Não informado</span>
              )}
            </p>
          </div>
        </div>

        <div className="profile-body">
          {/* Rank do time */}
          <div className="rank-card">
            <h3 className="rank-title">Rank do time:</h3>
            <img className="rank-image" src={imagemRankTime} alt="Rank do time" />
            <p className="rank-name">{nomeRankTime}</p>
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
                      src={titulo.imagem 
                        ? `data:image/png;base64,${titulo.imagem}` 
                        : '/default-campeonato.png'}
                      alt={titulo.nome || 'Campeonato'}
                    />
                    <p className="title-name">{titulo.nome}</p>
                  </div>
                ))
              ) : (
                <p className="no-titles">Nenhum título conquistado.</p>
              )}
            </div>
          </div>

          {/* Campeonatos Participados */}
          <div className="titles-card">
            <h3 className="titles-header">Campeonatos Participados:</h3>
            <div className="titles-list">
              {usuario.campeonatos && usuario.campeonatos.length > 0 ? (
                usuario.campeonatos.map((campeonato, index) => (
                  <div key={index} className="title-item">
                    <img
                      className="champ-image"
                      src={titulo.imagem 
                        ? `data:image/png;base64,${titulo.imagem}` 
                        : '/default-campeonato.png'}
                      alt={titulo.nome || 'Campeonato'}
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

        <div className="profile-actions">
          <button className="btn edit" onClick={handleEdit}>✏️ Editar Perfil</button>
        </div>
        <button
                type="button"
                onClick={handleSair}
                className="btn edit"
              >
                Sair
              </button>
      </div>
    </>
  );
}

export default User;
