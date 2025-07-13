import { useEffect, useState } from "react";
import { FaUserFriends, FaUserPlus, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../Components/Navbar/Navbar";
import "./Invites.css";

function Invites() {
  const api = useApi();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [teamInvites, setTeamInvites] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showRequestsPopup, setShowRequestsPopup] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [teamWarningId, setTeamWarningId] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId]);

  const fetchAll = async () => {
    try {
      const [friendsRes, friendReqRes, teamInvitesRes] = await Promise.all([
        api.get("/amizade/amigos"),
        api.get("/amizade/pendentes"),
        api.get(`/convites/usuario/${userId}`),
      ]);
      setFriends(friendsRes.data || []);
      setFriendRequests(friendReqRes.data || []);
      setTeamInvites(teamInvitesRes.data || []);
      setTeamWarningId(null);
    } catch {
      alert("Erro ao buscar dados. Tente novamente mais tarde.");
    }
  };

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    try {
      const res = await api.get(`/convites/usuarios/busca?nome=${encodeURIComponent(searchName)}`);
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
    } catch (err) {
      const msg = err?.response?.data?.message || "Não foi possível enviar o convite.";
      alert(`Erro: ${msg}`);
    }
  };

  const confirmRemoveFriend = (friend) => {
    setSelectedFriend(friend);
    setShowConfirm(true);
  };

  const handleRemoveConfirmed = async () => {
    try {
      await api.delete(`/amizade/remover/${selectedFriend.id}`);
      await fetchAll();
    } catch {
      alert("Erro ao remover amigo.");
    } finally {
      setShowConfirm(false);
      setSelectedFriend(null);
    }
  };

  const handleGoToProfile = (id) => {
    navigate(`/usuario/${id}`);
  };

  const handleAcceptFriend = async (conviteId) => {
    try {
      await api.post(`/amizade/aceitar/${conviteId}`);
      alert("Convite de amizade aceito!");
      await fetchAll();
    } catch {
      alert("Erro ao aceitar convite de amizade.");
    }
  };

  const handleAcceptTeamInvite = async (conviteId) => {
    try {
      await api.post(`/convites/${conviteId}/aceitar`);
      alert("Convite para time aceito!");
      await fetchAll();
    } catch {
      alert("Erro ao aceitar convite de time.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="friends-screen">
        <h1>Amigos e Convites</h1>
        <section className="friends-list">
          <h2><FaUserFriends /> Seus Amigos</h2>
          <ul>
            {friends.length > 0 ? (
              friends.map(friend => (
                <li key={friend.id}>
                  <span
                    className="friend-name"
                    onClick={() => handleGoToProfile(friend.id)}
                    tabIndex={0}
                    role="button"
                  >
                    {friend.nome}
                  </span>
                  <button className="delete-button" onClick={() => confirmRemoveFriend(friend)}>Excluir</button>
                </li>
              ))
            ) : (
              <p>Você ainda não tem amigos.</p>
            )}
          </ul>
        </section>
        <section className="friend-requests">
          <h2><FaUserPlus /> Convites</h2>
          <button className="open-popup-button" onClick={() => setShowRequestsPopup(true)}>Ver Convites</button>
        </section>
        <section className="friend-search">
          <h2><FaUserPlus /> Procurar Amigos</h2>
          <button className="open-popup-button" onClick={() => setShowSearchPopup(true)}>Procurar Amigos</button>
        </section>
      </div>
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Deseja remover <strong>{selectedFriend?.nome}</strong> da sua lista de amigos?</p>
            <div className="modal-buttons">
              <button className="confirm-button" onClick={handleRemoveConfirmed}>Sim</button>
              <button className="cancel-button" onClick={() => setShowConfirm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {showRequestsPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3><FaUserPlus /> Convites de Amizade</h3>
            {friendRequests.length > 0 ? (
              <ul>
                {friendRequests.map(request => (
                  <li key={request.id}>
                    <span onClick={() => handleGoToProfile(request.id)}>{request.nome}</span>
                    <button onClick={() => handleAcceptFriend(request.id)}>Aceitar</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-invite-highlight">Nenhum convite de amizade.</p>
            )}
            <h3 style={{ marginTop: "20px" }}><FaUsers /> Convites para Times</h3>
            {teamInvites.length > 0 ? (
              <ul>
                {teamInvites.map(invite => (
                  <li key={invite.id}>
                    {invite.time?.nm_time || "Time desconhecido"}
                    <button onClick={() => handleAcceptTeamInvite(invite.id)}>Aceitar</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-invite-highlight">Nenhum convite de time.</p>
            )}
            {teamWarningId !== null && (
              <p className="team-warning-outside">⚠️ Você já está em um time.</p>
            )}
            <button className="close-popup-button" onClick={() => setShowRequestsPopup(false)}>Fechar</button>
          </div>
        </div>
      )}
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
            <button onClick={handleSearch}>Buscar</button>
            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map(user => (
                  <li key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={user.imagemUsuario || "/default-avatar.png"}
                      alt="Foto"
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                    <span>{user.nome}</span>
                    <button onClick={() => handleSendFriendRequest(user.id)}>Adicionar</button>
                  </li>
                ))}
              </ul>
            ) : (
              searchName.trim() !== "" && <p>Nenhum usuário encontrado.</p>
            )}
            <button className="close-popup-button" onClick={() => setShowSearchPopup(false)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Invites;
