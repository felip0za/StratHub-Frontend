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
import timedefault from '../../../assets/time_default.png';
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

  /*
    Agora a função é segura.
    - mostrarLoading = true → mostra loading (primeira carga)
    - mostrarLoading = false → atualiza em segundo plano (interval)
  */
  const carregarDados = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);

      const [timeRes, membrosRes, pontuacaoRes] = await Promise.all([
        api.get(`/times/${id}`),
        api.get(`/times/${id}/membros`),
        api.get(`/times/${id}/pontuacao`)
      ]);

      setTime({ ...timeRes.data, pontuacao: pontuacaoRes?.data?.pontuacao ?? 0 });
      setMembros(membrosRes.data || []);
      setError('');
    } catch (err) {
      setError('Erro ao carregar dados do time.');
      setTime(null);
      setMembros([]);
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  };


  useEffect(() => {
    let ativo = true;

    // Primeira carga → com loading
    carregarDados(true);

    // Atualizações → sem loading
    const intervalo = setInterval(() => {
      if (ativo) carregarDados(false);
    }, 5000); // 5s é mais seguro (1s era exagerado)

    const handleGlobalClick = () => {
      if (contextMenu) {
        setContextMenu(null);
        setSelectedMember(null);
      }
    };

    window.addEventListener('click', handleGlobalClick);

    return () => {
      ativo = false;
      clearInterval(intervalo);
      window.removeEventListener('click', handleGlobalClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  const buscarAmigos = async () => {
    try {
      const res = await api.get("/amizade/amigos");
      setAmigos(res.data || []);
      setShowInvitePopup(true);
    } catch (err) {
      alert("Erro ao buscar amigos.");
    }
  };

  const handleClickUser = (memberId) => {
    navigate(`/usuario/${memberId}`);
  };

  const convidarParaTime = async (idAmigo) => {
    if (!time?.id) return alert('Time inválido.');

    try {
      await api.post(`/convites/enviar`, {
        idTime: time.id,
        idConvidado: idAmigo,
        idSolicitante: user.id,
      });
      alert("Convite enviado com sucesso!");
    } catch (err) {
      alert("Erro ao enviar convite para o time.");
    }
  };

  const handleEdit = () => {
    if (id) navigate(`/editar-time/${id}`);
  };

  const handleAddMember = () => buscarAmigos();

  const handleLeaveTeam = async () => {
    if (!time) return;

    if (window.confirm("Tem certeza que deseja sair do time?")) {
      try {
        setLoading(true);
        const isDono = user?.id === time?.idCriador;

        if (membros.length === 1 && isDono) {
          await api.delete(`/times/${id}`);
          alert("Você era o único membro. O time foi excluído.");
          navigate("/campeonatos");
        } else if (isDono) {
          alert("Você é o dono do time. Promova outro membro antes de sair.");
        } else {
          await api.post(`/times/${id}/sair`);
          alert("Você saiu do time.");
          navigate("/campeonatos");
        }
      } catch (err) {
        if (err.response?.status === 403) {
          alert(err.response.data || "Você não tem permissão.");
        } else {
          alert("Erro ao sair do time.");
        }
      } finally {
        setLoading(false);
      }
    }
  };


  const openContextMenu = (event, member) => {
    event.preventDefault();
    event.stopPropagation();

    if (!time) return;

    if (user?.id === time.idCriador && member.id !== user.id) {
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
    if (!selectedMember) return;

    if (!window.confirm(`Expulsar ${selectedMember.nome}?`)) {
      closeContextMenu();
      return;
    }

    try {
      await api.post(`/times/${id}/expulsar`, {
        idUsuario: selectedMember.id
      });
      alert("Membro expulso!");
      await carregarDados(false);
    } catch {
      alert("Erro ao expulsar membro.");
    } finally {
      closeContextMenu();
    }
  };

  const promoverParaDono = async () => {
    if (!selectedMember) return;

    if (!window.confirm(`Promover ${selectedMember.nome} a dono do time?`)) {
      closeContextMenu();
      return;
    }

    try {
      await api.post(`/times/${id}/promover`, {
        idNovoDono: selectedMember.id
      });
      alert("Novo dono promovido!");
      await carregarDados(false);
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

  const imagemTime = time?.imagemBase64
    ? `data:image/*;base64,${time.imagemBase64}`
    : timedefault;

  const rankToImage = {
    FERRO: ferro,
    BRONZE: bronze,
    PRATA: prata,
    OURO: ouro,
    PLATINA: platina,
    CHALLENGER: challenger,
    MASTER: master,
  };

  const timePontuacao = time?.pontuacao || 0;

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

  const rankImage = time?.rank ? rankToImage[time.rank.toUpperCase()] : null;

  return (
    <>
      <Navbar />

      <div className="container">
        {/* === ESQUERDA === */}
        <div className="left-section">
          <div className="logo-section">
            <img className="logo" src={imagemTime} alt="Logo do time" />

            <h2 className="team-title">
              {time?.nome}
              {time?.apelido && <span className="team-apelido"> | {time.apelido}</span>}
            </h2>

            <p className="description-label">DESCRIÇÃO:</p>
            <p className="description-text">{time?.descricao}</p>

            <p className="description-label">RANK:</p>
            {rankImage ? (
              <div className="rank-display">
                <img src={rankImage} alt={`Rank ${time?.rank}`} className="rank-image" />
                <span className={`rank-label rank-${time?.rank?.toLowerCase()}`}>{time?.rank}</span>
              </div>
            ) : (
              <p className="rank-text">Sem rank</p>
            )}

            <div className="progress-container">
              {rankInfo.pontuacaoProximo ? (
                <>
                  <div className="rank-progress-bar">
                    <div className="rank-progress-fill" style={{ width: `${progresso}%` }}></div>
                  </div>
                  <p className="score-text">
                    {rankInfo.pontuacaoAtual} / {rankInfo.pontuacaoProximo} PONTOS
                  </p>
                </>
              ) : (
                rankInfo.pontuacaoAtual >= 800 && (
                  <span className="classified-text">Classificados</span>
                )
              )}
            </div>

            {/* === Redes Sociais === */}
            <div className="team-social-box">
              <h3>REDES SOCIAIS</h3>
              <div className="social-icons">
                {time?.instagram && (
                  <a href={time.instagram} target="_blank" rel="noopener noreferrer">
                    <FaInstagram size={24} />
                  </a>
                )}
                {time?.discord && (
                  <a href={time.discord} target="_blank" rel="noopener noreferrer">
                    <FaDiscord size={24} />
                  </a>
                )}
                {time?.twitter && (
                  <a href={time.twitter} target="_blank" rel="noopener noreferrer">
                    <FaTwitter size={24} />
                  </a>
                )}
              </div>
            </div>

            <div className="btn-group">
              {user?.id === time?.idCriador && (
                <button className="edit-logo" onClick={handleEdit}>
                  Editar Time
                </button>
              )}

              {membros.some(m => m.id === user?.id) && (
                <button className="leave-team" onClick={handleLeaveTeam}>
                  Sair do Time
                </button>
              )}
            </div>
          </div>
        </div>

        {/* === MEMBROS === */}
        <div className="team-section">
          <h2 className="team-title">MEMBROS</h2>

          {membros.length > 0 ? (
            membros.map((member, index) => (
              <div
                className="member-card"
                key={member.id ?? index}
                onContextMenu={(e) => openContextMenu(e, member)}
                onClick={() => handleClickUser(member.id)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={
                    member.imagemUsuario?.startsWith?.("data:image")
                      ? member.imagemUsuario
                      : member.imagemUsuario
                        ? `data:image/*;base64,${member.imagemUsuario}`
                        : avatardefault
                  }
                  alt="Foto do membro"
                  className="member-logo"
                />

                <div className="member-info">
                  <strong>
                    {member.nome}
                    {member.id === time?.idCriador && ' (Dono)'}
                  </strong>

                  <div className="profile-stats">
                    <span className="ubisoft-label">
                      <Icon path={mdiUbisoft} size={1} /> UbiConnect:
                    </span>
                    <span className="ubisoft-valor">{member.ubiConnect || 'Não informado'}</span>
                  </div>

                  <div className="social-links">
                    {member.instagram && (
                      <a href={member.instagram} target="_blank" rel="noopener noreferrer">
                        <FaInstagram size={20} />
                      </a>
                    )}
                    {member.discord && (
                      <a href={member.discord} target="_blank" rel="noopener noreferrer">
                        <FaDiscord size={20} />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noopener noreferrer">
                        <FaTwitter size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Nenhum membro encontrado.</p>
          )}

          {membros.some(m => m.id === user?.id) && membros.length < 5 && (
            <button className="add-member" onClick={handleAddMember}>
              ADICIONAR MEMBRO +
            </button>
          )}
        </div>
      </div>

      {/* === POPUP === */}
      {showInvitePopup && (
        <div className="popup-overlay" onClick={() => setShowInvitePopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Convidar Amigos para o Time</h3>

            {amigos.length > 0 ? (
              <ul>
                {amigos.map((amigo) => {
                  const jaEstaNoTime = membros.some(m => m.id === amigo.id);

                  return (
                    <li className='amigo-box' key={amigo.id}>
                      <img
                        src={
                          amigo.imagemUsuario?.startsWith?.("data:image")
                            ? amigo.imagemUsuario
                            : amigo.imagemUsuario
                              ? `data:image/*;base64,${amigo.imagemUsuario}`
                              : avatardefault
                        }
                        alt="Foto"
                        style={{ width: 40, height: 40, borderRadius: '50%' }}
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

            <button className="fechar-btn" onClick={() => setShowInvitePopup(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* === MENU CONTEXTUAL === */}
      {contextMenu && (
        <div
          className="contextual-popup"
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={expulsarMembro}>Expulsar Membro</button>
          <button onClick={promoverParaDono}>Promover a Dono</button>
        </div>
      )}
    </>
  );
}

export default Times;
