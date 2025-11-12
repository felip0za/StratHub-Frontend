import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../Components/Navbar/Navbar";
import Icon from "@mdi/react";
import { mdiUbisoft } from "@mdi/js";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
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
      } catch (error) {
        alert("Erro ao buscar dados. Tente novamente mais tarde.");
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
    const intervalo = setInterval(() => {
      atualizarSilenciosamente();
    }, 1000);

    return () => clearInterval(intervalo);
  }, [userId, api]);

  const verificarTimeUsuario = async () => {
    try {
      const res = await api.get("/usuario/time");
      setUsuarioJaTemTime(
        res.data?.time !== null && res.data?.time !== undefined
      );
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
      alert("Erro ao buscar usuários.");
    }
  };

  const handleSendFriendRequest = async (idUsuario) => {
    try {
      await api.post(`/amizade/convidar/${idUsuario}`);
      alert("Convite enviado com sucesso!");
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
      alert(`Erro: ${msg}`);
    }
  };

  const handleAcceptFriend = async (idConvite) => {
    try {
      await api.post(`/amizade/aceitar/${idConvite}`);
      alert("Amizade aceita com sucesso!");
      setFriendRequests((prev) => prev.filter((req) => req.id !== idConvite));
      const updatedFriends = await api.get("/amizade/amigos");
      setFriends(updatedFriends.data || []);
    } catch {
      alert("Erro ao aceitar convite.");
    }
  };

  const handleRemoveFriend = async (idUsuario) => {
    if (!window.confirm("Tem certeza que deseja remover este amigo?")) return;
    try {
      await api.delete(`/amizade/remover/${idUsuario}`);
      alert("Amizade removida.");
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
      alert("Erro ao remover amizade.");
    }
  };

  const handleAcceptTeamInvite = async (idConvite) => {
    if (usuarioJaTemTime) {
      alert(
        "Você já pertence a um time. Saia do time atual para aceitar novos convites."
      );
      return;
    }

    try {
      await api.post(`/convites/${idConvite}/aceitar`);
      alert("Você entrou no time!");
      setTeamInvites((prev) => prev.filter((invite) => invite.id !== idConvite));
      setUsuarioJaTemTime(true);
    } catch {
      alert("Erro ao aceitar convite de time.");
    }
  };

  const handleRejectTeamInvite = async (idConvite) => {
    try {
      await api.post(`/convites/${idConvite}/recusarTime`);
      alert("Convite recusado.");
      setTeamInvites((prev) => prev.filter((invite) => invite.id !== idConvite));
    } catch {
      alert("Erro ao recusar convite de time.");
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
        <h1>Amigos e Convites</h1>

        {/* Lista de amigos */}
        <section className="friends-list">
          <ul>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <li
                  key={friend.id}
                  className="friend-card"
                  onClick={() => navigate(`/userprofile/${friend.id}`)} // 👈 redireciona para o perfil
                  style={{ cursor: "pointer" }}
                >
                  <div className="avatar">
                    <img
                      src={friend.imagemUsuario || "/default-avatar.png"}
                      alt={`Foto de ${friend.nome}`}
                    />
                  </div>
                  <div className="info">
                    <div className="username">{friend.nome}</div>
                    <p className="profile-email">
                      <strong className="ubisoft-label">
                        <Icon
                          path={mdiUbisoft}
                          size={1}
                          className="ubisoft-icon"
                        />{" "}
                        UbiConnect:
                      </strong>{" "}
                      <span className="ubisoft-valor">
                        {friend.username ||
                          friend.ubiConnect ||
                          "Não informado"}
                      </span>
                    </p>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // 👈 impede abrir o perfil
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

        {/* Botões principais */}
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

      {/* Popup de convites */}
      {showRequestsPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Convites de Amizade</h3>
            {friendRequests.length > 0 ? (
              <ul>
                {friendRequests.map((request) => (
                  <li key={request.id} className="friend-card">
                    <div className="avatar">
                      <img
                        src={request.imagemUsuario || "/default-avatar.png"}
                        alt={`Foto de ${request.nome}`}
                      />
                    </div>
                    <div className="info">
                      <div className="username">{request.nome}</div>
                      <div className="userid">
                        UbiConnect:{" "}
                        {request.username || request.nome.toLowerCase()}
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

            <h3 style={{ marginTop: 24 }}>Convites de Time</h3>
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
                        <div className="username">
                          {time.nome || "Time desconhecido"}
                        </div>
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
              className="open-popup-button"
              onClick={() => setShowRequestsPopup(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Popup de busca de amigos */}
      {showSearchPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Buscar Usuários</h3>
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
                  const jaTemConvite = friendRequests.some(
                    (r) => r.id === user.id
                  );
                  return (
                    <li key={user.id} className="friend-card">
                      <div className="avatar">
                        <img
                          src={user.imagemUsuario || "/default-avatar.png"}
                          alt={`Foto de ${user.nome}`}
                        />
                      </div>
                      <div className="info">
                        <div className="username">{user.nome}</div>
                        <div className="userid">
                          UbiConnect:{" "}
                          {user.ubiConnect || user.nome.toLowerCase()}
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
              className="open-popup-button"
              onClick={() => setShowSearchPopup(false)}
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
