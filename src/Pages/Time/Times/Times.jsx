import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import { useAuth } from '../../../contexts/AuthContext';
import Navbar from '../../../Components/Navbar/Navbar';
import Icon from '@mdi/react';
import { mdiUbisoft } from '@mdi/js';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import ferro from '../../../assets/ferro.png';
import bronze from '../../../assets/bronze.png';
import prata from '../../../assets/prata.png';
import ouro from '../../../assets/ouro.png';
import platina from '../../../assets/platina.png';
import challenger from '../../../assets/challenger.png';
import master from '../../../assets/master.png';
import { FaInstagram, FaDiscord, FaTwitter } from 'react-icons/fa';
import './Times.css';

function Times() {
  const [time, setTime] = useState(null);
  const [membros, setMembros] = useState([]);
  const [error, setError] = useState('');
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [amigos, setAmigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const api = useApi();
  const { user } = useAuth();

  const carregarDados = async () => {
    try {
      const [timeRes, membrosRes, pontuacaoRes] = await Promise.all([
        api.get(`/times/${id}`),
        api.get(`/times/${id}/membros`),
        api.get(`/times/${id}/pontuacao`)
      ]);

      const usuarioNoTime = membrosRes.data.some((m) => m.id === user.id);

      if (!usuarioNoTime) {
        try {
          const { data: meuTime } = await api.get(`/usuarios/${user.id}/time`);
          if (meuTime?.id) {
            navigate(`/times/${meuTime.id}`);
          } else {
            navigate('/home');
          }
        } catch (err) {
          console.error('Erro ao buscar time do usuário:', err);
          navigate(`/times/${meuTime.id}`);
        }
        return;
      }

      setTime({
        ...timeRes.data,
        pontuacao: pontuacaoRes.data.pontuacao
      });
      setMembros(membrosRes.data);
      setError('');
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const intervalo = setInterval(() => {
      carregarDados();
    }, 1000);
    return () => clearInterval(intervalo);
  }, [id, api]);

  const buscarAmigos = async () => {
    try {
      const res = await api.get("/amizade/amigos");
      setAmigos(res.data || []);
      setShowInvitePopup(true);
    } catch {
      alert("Erro ao buscar amigos.");
    }
  };

  const handleClickUser = (memberId) => {
    navigate(`/profile/${memberId}`);
  };

  const convidarParaTime = async (idAmigo) => {
    try {
      await api.post(`/convites/enviar`, {
        idTime: time.id,
        idConvidado: idAmigo,
        idSolicitante: user.id,
      });
      alert("Convite enviado com sucesso!");
    } catch {
      alert("Erro ao enviar convite para o time.");
    }
  };

  const handleEdit = () => navigate(`/editar-time/${id}`);
  const handleAddMember = () => buscarAmigos();

  const handleLeaveTeam = async () => {
    if (window.confirm("Tem certeza que deseja sair do time?")) {
      try {
        setLoading(true);
        const isDono = user.id === time.idCriador;

        if (membros.length === 1 && isDono) {
          await api.delete(`/times/${id}`);
          alert("Você era o único membro. O time foi excluído.");
          navigate("/home");
        } else if (isDono) {
          alert("Você é o dono do time. Promova outro membro antes de sair.");
        } else {
          await api.post(`/times/${id}/sair`);
          alert("Você saiu do time.");
          navigate("/home");
        }
      } catch (err) {
        if (err.response?.status === 403) {
          alert(err.response.data || "Você não tem permissão para realizar esta ação.");
        } else {
          alert("Erro ao sair do time ou excluir o time.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const openContextMenu = (event, member) => {
    event.preventDefault();
    if (user.id === time.idCriador && member.id !== user.id) {
      const menuWidth = 160;
      const menuHeight = 100;
      let x = event.pageX;
      let y = event.pageY;
      if (x + menuWidth > window.innerWidth) x -= menuWidth;
      if (y + menuHeight > window.innerHeight) y -= menuHeight;
      setSelectedMember(member);
      setContextMenu({ x, y });
    }
  };

  const closeContextMenu = () => {
    setContextMenu(null);
    setSelectedMember(null);
  };

  const expulsarMembro = async () => {
    try {
      await api.post(`/times/${id}/expulsar`, {
        idUsuario: selectedMember.id
      });
      alert("Membro expulso com sucesso.");
      await carregarDados();
    } catch {
      alert("Erro ao expulsar membro.");
    } finally {
      closeContextMenu();
    }
  };

  const promoverParaDono = async () => {
    try {
      await api.post(`/times/${id}/promover`, {
        idNovoDono: selectedMember.id
      });
      alert("Novo dono promovido com sucesso.");
      await carregarDados();
    } catch {
      alert("Erro ao promover novo dono.");
    } finally {
      closeContextMenu();
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingScreen />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p className="error-message">{error}</p>
        </div>
      </>
    );
  }

  const imagemTime = time.imagemBase64
    ? `data:image/*;base64,${time.imagemBase64}`
    : "/default-team.png";

  const rankToImage = {
    FERRO: ferro,
    BRONZE: bronze,
    PRATA: prata,
    OURO: ouro,
    PLATINA: platina,
    CHALLENGER: challenger,
    MASTER: master,
  };

  const timePontuacao = time.pontuacao || 0;

  const getRankInfo = (pontuacao) => {
    if (pontuacao < 800) {
      return {
        pontuacaoAtual: pontuacao,
        pontuacaoProximo: 800,
      };
    }
    return {
      pontuacaoAtual: pontuacao,
      pontuacaoProximo: null,
    };
  };

  const rankInfo = getRankInfo(timePontuacao);
  const progresso = rankInfo.pontuacaoProximo
    ? Math.min(100, (rankInfo.pontuacaoAtual / rankInfo.pontuacaoProximo) * 100).toFixed(1)
    : 0;

  const rankImage = time.rank ? rankToImage[time.rank.toUpperCase()] : null;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="left-section">
          <div className="logo-section">
            <img className="logo" src={imagemTime} alt="Logo do time" />
            <h2 className="team-title">
              {time.nome}
              {time.apelido && <span className="team-apelido"> | {time.apelido}</span>}
            </h2>
            <p className="description-label">DESCRIÇÃO:</p>
            <p className="description-text">{time.descricao}</p>

            <p className="description-label">RANK:</p>
            {rankImage ? (
              <div className="rank-display">
                <img src={rankImage} alt={`Rank ${time.rank}`} className="rank-image" />
                <span className={`rank-label rank-${time.rank.toLowerCase()}`}>{time.rank}</span>
              </div>
            ) : (
              <p className="rank-text">Sem rank</p>
            )}

            <div className="progress-container">
              {rankInfo.pontuacaoProximo ? (
                <>
                  <div className="rank-progress-bar">
                    <div
                      className="rank-progress-fill"
                      style={{ width: `${progresso}%` }}
                    ></div>
                  </div>
                  <p className="score-text">{rankInfo.pontuacaoAtual} / {rankInfo.pontuacaoProximo} PONTOS</p>
                </>
              ) : (
                rankInfo.pontuacaoAtual >= 800 && (
                  <span className="classified-text"> Classificados </span>
                )
              )}
            </div>

            {/* === NOVA BOX DE REDES SOCIAIS DO TIME === */}
            <div className="team-social-box">
              <h3>REDES SOCIAIS</h3>
              <div className="social-icons">
                {time.instagram && time.instagram.trim() !== '' && (
                  <a href={time.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                    <FaInstagram size={24} />
                  </a>
                )}
                {time.discord && time.discord.trim() !== '' && (
                  <a href={time.discord} target="_blank" rel="noopener noreferrer" title="Discord">
                    <FaDiscord size={24}  />
                  </a>
                )}
                {time.twitter && time.twitter.trim() !== '' && (
                  <a href={time.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">
                    <FaTwitter size={24}  />
                  </a>
                )}
              </div>
            </div>

            <div className="btn-group">
              {user.id === time.idCriador && (
                <button className="edit-logo" onClick={handleEdit}>
                  Editar Time
                </button>
              )}
              {membros.some(m => m.id === user.id) && (
                <button className="leave-team" onClick={handleLeaveTeam}>
                  Sair do Time
                </button>
              )}
            </div>
          </div>
        </div>

        {/* === SEÇÃO DE MEMBROS === */}
        <div className="team-section">
          <h2 className="team-title">MEMBROS</h2>

          {membros.length > 0 ? (
            membros.map((member, index) => (
              <div
                className="member-card"
                key={index}
                onContextMenu={(e) => openContextMenu(e, member)}
                onClick={() => handleClickUser(member.id)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={
                    member.imagemUsuario?.startsWith('data:image')
                      ? member.imagemUsuario
                      : member.imagemUsuario
                        ? `data:image/*;base64,${member.imagemUsuario}`
                        : "/default-avatar.png"
                  }
                  alt="Foto do membro"
                  className="member-logo"
                />
                <div className="member-info">
                  <strong>
                    {member.nome}
                    {member.id === time.idCriador && ' (Dono)'}
                  </strong>

                  <div className="profile-stats" style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
                      <span className="ubisoft-label">
                        <Icon path={mdiUbisoft} size={1} className="ubisoft-icon" />
                        UbiConnect:
                      </span>
                      <span className="ubisoft-valor">{member.ubiConnect || 'Não informado'}</span>
                    </div>

                  </div>

                  {/* === LINKS SOCIAIS DOS MEMBROS === */}
                  <div className="social-links" style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    {member.instagram && member.instagram.trim() !== '' && (
                      <a href={member.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                        <FaInstagram size={20} color="#E1306C" />
                      </a>
                    )}
                    {member.discord && member.discord.trim() !== '' && (
                      <a href={member.discord} target="_blank" rel="noopener noreferrer" title="Discord">
                        <FaDiscord size={20} color="#7289DA" />
                      </a>
                    )}
                    {member.twitter && member.twitter.trim() !== '' && (
                      <a href={member.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">
                        <FaTwitter size={20} color="#1DA1F2" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum membro encontrado.</p>
          )}

          <button className="add-member" onClick={handleAddMember}>
            ADICIONAR MEMBRO +
          </button>
        </div>
      </div>

      {/* === POPUP DE CONVITE === */}
      {showInvitePopup && (
        <div className="popup-overlay" onClick={() => setShowInvitePopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Convidar Amigos para o Time</h3>
            {amigos.length > 0 ? (
              <ul>
                {amigos.map((amigo) => {
                  const jaEstaNoTime = membros.some(m => m.id === amigo.id);
                  return (
                    <li key={amigo.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <img
                        src={amigo.imagemUsuario || "/default-avatar.png"}
                        alt="Foto"
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                      />
                      <span>{amigo.nome}</span>
                      {!jaEstaNoTime ? (
                        <button onClick={() => convidarParaTime(amigo.id)}>Convidar</button>
                      ) : (
                        <span style={{ color: 'green' }}>Já no time</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>Você não possui amigos.</p>
            )}
            <button className="fechar-btn" onClick={() => setShowInvitePopup(false)}>Fechar</button>
          </div>
        </div>
      )}

      {/* === MENU CONTEXTUAL === */}
      {contextMenu && (
        <div
          className="contextual-popup"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={closeContextMenu}
        >
          <button onClick={expulsarMembro}>Expulsar Membro</button>
          <button onClick={promoverParaDono}>Promover a Dono</button>
        </div>
      )}
    </>
  );
}

export default Times;