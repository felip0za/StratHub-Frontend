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
    setLoading(true);
    try {
      const [timeRes, membrosRes, pontuacaoRes] = await Promise.all([
        api.get(`/times/${id}`),
        api.get(`/times/${id}/membros`),
        api.get(`/times/${id}/pontuacao`) // novo endpoint
      ]);

      setTime({
        ...timeRes.data,
        pontuacao: pontuacaoRes.data.pontuacao // adiciona ao objeto
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
        await api.post(`/times/${id}/sair`, { idUsuario: user.id });
        alert("Você saiu do time.");
        navigate("/home");
      } catch {
        alert("Erro ao sair do time.");
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

        <div className="team-section">
          <h2 className="team-title">MEMBROS</h2>

          {membros.length > 0 ? (
            membros.map((member, index) => (
              <div
                className="member-card"
                key={index}
                onContextMenu={(e) => openContextMenu(e, member)}
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
                  <p className="profile-email">
                    <strong className="ubisoft-label">
                      <Icon path={mdiUbisoft} size={1} className="ubisoft-icon" />
                      UbiConnect:
                    </strong>{' '}
                    <span className="ubisoft-valor">
                      {member.ubiConnect || 'Não informado'}
                    </span>
                  </p>
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
