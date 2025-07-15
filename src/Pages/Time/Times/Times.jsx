import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import { useAuth } from '../../../contexts/AuthContext';  // Importa o hook do usuário logado
import Navbar from '../../../Components/Navbar/Navbar';
import Icon from '@mdi/react';
import { mdiUbisoft } from '@mdi/js';
import './Times.css';

function Times() {
  const [time, setTime] = useState(null);
  const [membros, setMembros] = useState([]);
  const [error, setError] = useState('');
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [amigos, setAmigos] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();
  const api = useApi();
  const { user } = useAuth(); // Obtém usuário logado

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const response = await api.get(`/times/${id}`);
        setTime(response.data);
      } catch (err) {
        console.error('Erro ao buscar time:', err);
        setError('Erro ao buscar time.');
      }
    };

    const fetchMembros = async () => {
      try {
        const response = await api.get(`/times/${id}/membros`);
        setMembros(response.data);
      } catch (err) {
        console.error('Erro ao buscar membros:', err);
        setError('Erro ao buscar membros do time.');
      }
    };

    fetchTime();
    fetchMembros();
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
        idSolicitante: user.id,  // Enviando o solicitante corretamente
      });
      alert("Convite enviado com sucesso!");
    } catch {
      alert("Erro ao enviar convite para o time.");
    }
  };

  const handleEdit = () => navigate(`/editar-time/${id}`);
  const handleAddMember = () => buscarAmigos();

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

  if (!time) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Carregando time...</p>
        </div>
      </>
    );
  }

  const imagemTime = time.imagemBase64
    ? `data:image/*;base64,${time.imagemBase64}`
    : "/default-team.png";

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

            <button className="edit-logo" onClick={handleEdit}>
              Editar Time
            </button>
          </div>
        </div>

        <div className="team-section">
          <h2 className="team-title">MEMBROS</h2>

          {membros.length > 0 ? (
            membros.map((member, index) => (
              <div className="member-card" key={index}>
                <img
                  src={member.imagemUsuario || "/default-avatar.png"}
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

      {/* Popup de convite */}
      {showInvitePopup && (
        <div className="popup-overlay">
          <div className="popup-box">
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
            <button onClick={() => setShowInvitePopup(false)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Times;
  