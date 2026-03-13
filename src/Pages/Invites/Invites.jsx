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

  const [modalAviso, setModalAviso] = useState({ ativo: false, mensagem: "" });
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
      const res = await api.get(`/usuario/${userId}`);
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
      const resultados = (res.data || []).filter((user) => user.id !== userId);
      setSearchResults(resultados);
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
      const msg = err?.response?.data?.message || "Não foi possível enviar o convite.";
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

      <div className="inv-screen">
        <h1 className="inv-title">Amigos e Convites</h1>

        {/* Lista de amigos */}
        <section>
          <ul className="inv-list">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <li
                  key={friend.id}
                  className="inv-card"
                  onClick={() => navigate(`/usuario/${friend.id}`)}
                >
                  <div className="inv-avatar">
                    <img
                      src={friend.imagemUsuario || avatardefault}
                      alt={`Foto de ${friend.nome}`}
                    />
                  </div>

                  <div className="inv-info">
                    <div className="inv-name">{friend.nome}</div>
                    <p className="inv-ubi-row">
                      <strong className="inv-ubi-label">
                        <Icon path={mdiUbisoft} size={0.8} />
                        UbiConnect:
                      </strong>
                      <span className="inv-ubi-valor">
                        {friend.username || friend.ubiConnect || "Não informado"}
                      </span>
                    </p>
                  </div>

                  <button
                    className="inv-btn-ghost"
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
              <p className="inv-empty">Você ainda não tem amigos.</p>
            )}
          </ul>
        </section>

        {/* Botões inferiores */}
        <div className="inv-actions-row">
          <button
            className="inv-btn-primary"
            onClick={() => setShowRequestsPopup(true)}
          >
            Convites
            {(friendRequests.length + teamInvites.length) > 0 && (
              <span className="inv-badge">
                {(friendRequests.length + teamInvites.length) > 1 ? "1+" : "1"}
              </span>
            )}
          </button>

          <button
            className="inv-btn-primary"
            onClick={() => setShowSearchPopup(true)}
          >
            Adicionar Amigos
          </button>
        </div>
      </div>

      {/* Popup — Convites */}
      {showRequestsPopup && (
        <div className="inv-overlay">
          <div className="inv-popup">
            <h3 className="inv-title">Convites de Amizade</h3>

            {friendRequests.length > 0 ? (
              <ul className="inv-list">
                {friendRequests.map((request) => (
                  <li key={request.id} className="inv-card">
                    <div className="inv-avatar">
                      <img
                        src={request.imagemUsuario || avatardefault}
                        alt={`Foto de ${request.nome}`}
                      />
                    </div>
                    <div className="inv-info">
                      <div className="inv-name">{request.nome}</div>
                      <div className="inv-sub">
                        UbiConnect: {request.username || request.nome.toLowerCase()}
                      </div>
                    </div>
                    <button
                      className="inv-btn-primary"
                      onClick={() => handleAcceptFriend(request.id)}
                    >
                      Aceitar
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="inv-empty">Nenhum convite de amizade.</p>
            )}

            <h3 className="inv-title" style={{ marginTop: 24 }}>
              Convites de Time
            </h3>

            {teamInvites.length > 0 ? (
              <ul className="inv-list">
                {teamInvites.map((convite) => {
                  const time = convite.time || {};
                  return (
                    <li key={convite.id} className="inv-card">
                      <div className="inv-avatar">
                        <img
                          src={
                            time.imagemBase64
                              ? `data:image/png;base64,${time.imagemBase64}`
                              : "/default-team.png"
                          }
                          alt={`Time ${time.nome || "Desconhecido"}`}
                        />
                      </div>
                      <div className="inv-info">
                        <div className="inv-name">{time.nome || "Time desconhecido"}</div>
                        <div className="inv-sub">Convite para entrar no time</div>
                      </div>
                      <div className="inv-card-actions">
                        <button
                          className="inv-btn-primary"
                          onClick={() => handleAcceptTeamInvite(convite.id)}
                        >
                          Aceitar
                        </button>
                        <button
                          className="inv-btn-ghost"
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
              <p className="inv-empty">Nenhum convite de time.</p>
            )}

            <button
              className="inv-btn-close"
              onClick={() => setShowRequestsPopup(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Popup — Buscar */}
      {showSearchPopup && (
        <div className="inv-overlay">
          <div className="inv-popup">
            <h3 className="inv-title">Buscar Usuários</h3>

            <input
              className="inv-input"
              type="text"
              placeholder="Digite o nome"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="inv-btn-primary" onClick={handleSearch}>
              Buscar
            </button>

            {searchResults.length > 0 ? (
              <ul className="inv-list" style={{ marginTop: 12 }}>
                {searchResults.map((user) => {
                  const isAmigo = friends.some((f) => f.id === user.id);
                  const jaTemConvite = friendRequests.some((r) => r.id === user.id);
                  return (
                    <li key={user.id} className="inv-card inv-card-search">
                      <div className="inv-avatar">
                        <img
                          src={user.imagemUsuario || avatardefault}
                          alt={`Foto de ${user.nome}`}
                        />
                      </div>
                      <div className="inv-info">
                        <div className="inv-name">{user.nome}</div>
                        <div className="inv-sub">
                          UbiConnect: {user.ubiConnect || user.nome.toLowerCase()}
                        </div>
                      </div>
                      {isAmigo ? (
                        <span className="inv-status">Amigo</span>
                      ) : jaTemConvite ? (
                        <span className="inv-status">Pendente</span>
                      ) : (
                        <button
                          className="inv-btn-primary"
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
              searchName.trim() !== "" && (
                <p className="inv-empty">Nenhum usuário encontrado.</p>
              )
            )}

            <button
              className="inv-btn-close"
              onClick={() => setShowSearchPopup(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal — Confirmar remoção */}
      {confirmRemove.ativo && (
        <div className="inv-overlay">
          <div className="inv-modal">
            <p>
              Tem certeza que deseja remover{" "}
              <strong style={{ color: "#f0f0f0" }}>{confirmRemove.amigo.nome}</strong>{" "}
              da sua lista de amigos?
            </p>
            <div className="inv-modal-actions">
              <button
                className="inv-btn-primary"
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
                Sim, remover
              </button>
              <button
                className="inv-btn-ghost"
                onClick={() => setConfirmRemove({ ativo: false, amigo: null })}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Avisos */}
      {modalAviso.ativo && (
        <div className="inv-overlay">
          <div className="inv-modal">
            <p>{modalAviso.mensagem}</p>
            <button
              className="inv-btn-primary"
              style={{ marginTop: 18, width: "100%" }}
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