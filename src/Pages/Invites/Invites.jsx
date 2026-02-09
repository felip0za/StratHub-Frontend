import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../Components/Navbar/Navbar";
import Icon from "@mdi/react";
import { mdiUbisoft } from "@mdi/js";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import avatardefault from '/src/assets/avatar-default.png';
import "./Invites.css";

function Invites() {
  const api = useApi();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [teamInvites, setTeamInvites] = useState([]);
  const [showRequestsPopup, setShowRequestsPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [usuarioJaTemTime, setUsuarioJaTemTime] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de aviso
  const [modalAviso, setModalAviso] = useState({ ativo: false, mensagem: "" });

  // Modal de confirmação para remover amigo
  const [confirmRemove, setConfirmRemove] = useState({ ativo: false, amigo: null });

  const mostrarAviso = (mensagem) => {
    setModalAviso({ ativo: true, mensagem });
  };

  useEffect(() => {
    if (!userId) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [friendsRes, friendReqRes, teamInvitesRes] = await Promise.all([
          api.get("/amizade/amigos"),
          api.get("/amizade/pendentes"),
          api.get(`/convites/usuario/${userId}`),
        ]);

        setFriends(friendsRes.data || []);
        setFriendRequests(friendReqRes.data || []);
        setTeamInvites(
          teamInvitesRes.data?.filter((i) => i.status === "PENDENTE") || []
        );

        await verificarTimeUsuario();
      } catch {
        mostrarAviso("Erro ao buscar dados. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    const atualizarSilenciosamente = async () => {
      try {
        const [friendsRes, friendReqRes, teamInvitesRes] = await Promise.all([
          api.get("/amizade/amigos"),
          api.get("/amizade/pendentes"),
          api.get(`/convites/usuario/${userId}`),
        ]);

        setFriends(friendsRes.data || []);
        setFriendRequests(friendReqRes.data || []);
        setTeamInvites(
          teamInvitesRes.data?.filter((i) => i.status === "PENDENTE") || []
        );

        await verificarTimeUsuario();
      } catch {}
    };

    fetchAll();
    const intervalo = setInterval(() => atualizarSilenciosamente(), 1000);
    return () => clearInterval(intervalo);
  }, [userId, api]);

  const verificarTimeUsuario = async () => {
    try {
      const res = await api.get(`/usuario/${Id}`);
      setUsuarioJaTemTime(res.data?.hasTime === true);
    } catch {
      setUsuarioJaTemTime(false);
    }
  };

  const handleSearch = async () => {
    if (!searchName.trim()) return;

    try {
      const res = await api.get(
        `/convites/usuarios/busca?nome=${encodeURIComponent(searchName)}`
      );
      setSearchResults(res.data || []);
    } catch {
      mostrarAviso("Erro ao buscar usuários.");
    }
  };

  const handleSendFriendRequest = async (idUsuario) => {
    try {
      await api.post(`/amizade/convidar/${idUsuario}`);
      mostrarAviso("Convite enviado com sucesso!");

      setSearchResults([]);
      setSearchName("");

      const [friendsRes, friendReqRes, teamInvitesRes] = await Promise.all([
        api.get("/amizade/amigos"),
        api.get("/amizade/pendentes"),
        api.get(`/convites/usuario/${userId}`),
      ]);

      setFriends(friendsRes.data || []);
      setFriendRequests(friendReqRes.data || []);
      setTeamInvites(
        teamInvitesRes.data?.filter((i) => i.status === "PENDENTE") || []
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Não foi possível enviar o convite.";
      mostrarAviso(`Erro: ${msg}`);
    }
  };

  const handleAcceptFriend = async (idConvite) => {
    try {
      await api.post(`/amizade/aceitar/${idConvite}`);
      mostrarAviso("Amizade aceita com sucesso!");

      setFriendRequests((prev) => prev.filter((req) => req.id !== idConvite));

      const updatedFriends = await api.get("/amizade/amigos");
      setFriends(updatedFriends.data || []);
    } catch {
      mostrarAviso("Erro ao aceitar convite.");
    }
  };

  const handleRemoveFriend = (idUsuario) => {
    const amigo = friends.find((f) => f.id === idUsuario);
    if (!amigo) return;
    setConfirmRemove({ ativo: true, amigo });
  };

  const handleAcceptTeamInvite = async (idConvite) => {
    if (usuarioJaTemTime) {
      mostrarAviso(
        "Você já pertence a um time. Saia do seu time atual antes de aceitar outro convite."
      );
      return;
    }

    try {
      await api.post(`/convites/${idConvite}/aceitar`);
      mostrarAviso("Você entrou no time!");

      setTeamInvites((prev) => prev.filter((invite) => invite.id !== idConvite));
      setUsuarioJaTemTime(true);
    } catch (err) {
      const msg = err?.response?.data?.erro || "Erro ao aceitar convite.";
      mostrarAviso(msg);
    }
  };

  const handleRejectTeamInvite = async (idConvite) => {
    try {
      await api.post(`/convites/${idConvite}/recusarTime`);
      mostrarAviso("Convite recusado.");

      setTeamInvites((prev) => prev.filter((invite) => invite.id !== idConvite));
    } catch {
      mostrarAviso("Erro ao recusar convite de time.");
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <LoadingScreen />
      </>
    );

  return (
    <>
      <Navbar />

      <div className="friends-screen">
        <h1 className="title-neon">Amigos e Convites</h1>

        {/* Lista de amigos */}
        <section className="friends-list">
          <ul>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <li
                  key={friend.id}
                  className="friend-card"
                  onClick={() => navigate(`/usuario/${friend.id}`)}
                >
                  <div className="avatar">
                    <img
                      src={friend.imagemUsuario || avatardefault}
                      alt={`Foto de ${friend.nome}`}
                    />
                  </div>

                  <div className="info">
                    <div className="username">{friend.nome}</div>

                    <p className="profile-ubi2">
                      <strong className="ubisoft-label">
                        <Icon path={mdiUbisoft} size={1} />
                        UbiConnect:
                      </strong>
                      <span className="ubisoft-valor">
                        {friend.username || friend.ubiConnect || "Não informado"}
                      </span>
                    </p>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFriend(friend.id);
                    }}
                  >
                    Remover
                  </button>
                </li>
              ))
            ) : (
              <p>Você ainda não tem amigos.</p>
            )}
          </ul>
        </section>

        {/* Botões */}
        <section className="friend-requests">
          <button
            className="open-popup-button"
            onClick={() => setShowRequestsPopup(true)}
          >
            Convites
            {(friendRequests.length + teamInvites.length) > 0 && (
              <span className="notification-badge">
                {(friendRequests.length + teamInvites.length) > 1 ? "1+" : "1"}
              </span>
            )}
          </button>

          <button
            className="open-popup-button"
            onClick={() => setShowSearchPopup(true)}
          >
            Adicionar Amigos
          </button>
        </section>
      </div>

      {/* Popups existentes (Convites e busca) */}
      {showRequestsPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3 className="title-neon">Convites de Amizade</h3>
            {friendRequests.length > 0 ? (
              <ul>
                {friendRequests.map((request) => (
                  <li key={request.id} className="friend-card">
                    <div className="avatar">
                      <img
                        src={request.imagemUsuario || avatardefault}
                        alt={`Foto de ${request.nome}`}
                      />
                    </div>
                    <div className="info">
                      <div className="username">{request.nome}</div>
                      <div className="userid">
                        UbiConnect: {request.username || request.nome.toLowerCase()}
                      </div>
                    </div>
                    <button
                      className="team-btn accept"
                      onClick={() => handleAcceptFriend(request.id)}
                    >
                      Aceitar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum convite de amizade.</p>
            )}

            <h3 className="title-neon" style={{ marginTop: 24 }}>
              Convites de Time
            </h3>
            {teamInvites.length > 0 ? (
              <ul>
                {teamInvites.map((convite) => {
                  const time = convite.time || {};
                  return (
                    <li key={convite.id} className="friend-card">
                      <div className="avatar">
                        <img
                          src={
                            time.imagemBase64
                              ? `data:image/png;base64,${time.imagemBase64}`
                              : "/default-team.png"
                          }
                          alt={`Time ${time.nome || "Desconhecido"}`}
                        />
                      </div>
                      <div className="info">
                        <div className="username">{time.nome || "Time desconhecido"}</div>
                        <div className="userid">Convite para entrar no time</div>
                      </div>
                      <div className="actions">
                        <button
                          className="team-btn accept"
                          onClick={() => handleAcceptTeamInvite(convite.id)}
                        >
                          Aceitar
                        </button>
                        <button
                          className="team-btn reject"
                          onClick={() => handleRejectTeamInvite(convite.id)}
                        >
                          Recusar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>Nenhum convite de time.</p>
            )}

            <button
              className="open-popup-button close-btn"
              onClick={() => setShowRequestsPopup(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showSearchPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3 className="title-neon">Buscar Usuários</h3>
            <input
              type="text"
              placeholder="Digite o nome"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="open-popup-button" onClick={handleSearch}>
              Buscar
            </button>

            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map((user) => {
                  const isAmigo = friends.some((f) => f.id === user.id);
                  const jaTemConvite = friendRequests.some((r) => r.id === user.id);
                  return (
                    <li key={user.id} className="friend-card search-card">
                      <div className="avatar">
                        <img
                          src={user.imagemUsuario || avatardefault}
                          alt={`Foto de ${user.nome}`}
                        />
                      </div>
                      <div className="info">
                        <div className="username">{user.nome}</div>
                        <div className="userid">
                          UbiConnect: {user.ubiConnect || user.nome.toLowerCase()}
                        </div>
                      </div>

                      {isAmigo ? (
                        <span className="status-badge">Amigo</span>
                      ) : jaTemConvite ? (
                        <span className="status-badge">Convite pendente</span>
                      ) : (
                        <button
                          className="remove-btn"
                          onClick={() => handleSendFriendRequest(user.id)}
                        >
                          Adicionar
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              searchName.trim() !== "" && <p>Nenhum usuário encontrado.</p>
            )}

            <button
              className="open-popup-button close-btn"
              onClick={() => setShowSearchPopup(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmação para remover amigo */}
      {confirmRemove.ativo && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Tem certeza que deseja remover {confirmRemove.amigo.nome} da sua lista de amigos?</p>
            <div className="modal-actions">
              <button
                className="modal-btn confirm"
                onClick={async () => {
                  try {
                    await api.delete(`/amizade/remover/${confirmRemove.amigo.id}`);
                    mostrarAviso("Amizade removida.");
                    const [friendsRes, friendReqRes, teamInvitesRes] = await Promise.all([
                      api.get("/amizade/amigos"),
                      api.get("/amizade/pendentes"),
                      api.get(`/convites/usuario/${userId}`),
                    ]);
                    setFriends(friendsRes.data || []);
                    setFriendRequests(friendReqRes.data || []);
                    setTeamInvites(
                      teamInvitesRes.data?.filter((i) => i.status === "PENDENTE") || []
                    );
                  } catch {
                    mostrarAviso("Erro ao remover amizade.");
                  } finally {
                    setConfirmRemove({ ativo: false, amigo: null });
                  }
                }}
              >
                Sim
              </button>
              <button
                className="modal-btn cancel"
                onClick={() => setConfirmRemove({ ativo: false, amigo: null })}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Avisos */}
      {modalAviso.ativo && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>{modalAviso.mensagem}</p>
            <button
              className="modal-close-btn"
              onClick={() => setModalAviso({ ativo: false, mensagem: "" })}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Invites;
