import { useState } from "react";
import { FaUserFriends, FaUserPlus, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./Invites.css";
import Navbar from "../../Components/Navbar/Navbar";

function Invites() {
    const navigate = useNavigate();
    
    const [friends, setFriends] = useState([
        { id: 1, name: "Carlos Silva" },
        { id: 2, name: "Ana Souza" },
        { id: 3, name: "João Pereira" }
    ]);

    const [friendRequests, setFriendRequests] = useState([
        { id: 4, name: "Mariana Costa" },
        { id: 5, name: "Lucas Martins" }
    ]);

    const [teamInvites, setTeamInvites] = useState([
        { id: 1, teamName: "R6 Elite Squad" },
        { id: 2, teamName: "Ghost Operators" }
    ]);

    const [currentTeam, setCurrentTeam] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [showRequestsPopup, setShowRequestsPopup] = useState(false);
    const [teamWarningId, setTeamWarningId] = useState(null);

    const handleAcceptFriend = (id) => {
        const acceptedFriend = friendRequests.find(request => request.id === id);
        if (acceptedFriend) {
            setFriends(prev => [...prev, acceptedFriend]);
            setFriendRequests(prev => prev.filter(request => request.id !== id));
        }
    };

    const handleAcceptTeamInvite = (inviteId) => {
        if (currentTeam !== null) {
            setTeamWarningId(inviteId);
            return;
        }

        const invite = teamInvites.find(team => team.id === inviteId);
        if (invite) {
            setCurrentTeam(invite.teamName);
            setTeamInvites(prev => prev.filter(team => team.id !== inviteId));
            setTeamWarningId(null);
        }
    };

    const confirmRemoveFriend = (friend) => {
        setSelectedFriend(friend);
        setShowConfirm(true);
    };

    const handleRemoveConfirmed = () => {
        setFriends(prev => prev.filter(f => f.id !== selectedFriend.id));
        setShowConfirm(false);
        setSelectedFriend(null);
    };

    const handleCancelRemove = () => {
        setShowConfirm(false);
        setSelectedFriend(null);
    };

    const handleGoToProfile = () => {
        navigate(`/profile`);
    };

    return (
        <>
            <Navbar />
            <div className="friends-screen">
                <h1>Amigos e Convites</h1>

                <section className="friends-list">
                    <h2><FaUserFriends /> Seus Amigos</h2>
                    <ul>
                        {friends.map(friend => (
                            <li key={friend.id}>
                                <span onClick={() => handleGoToProfile(friend.id)} className="friend-name">{friend.name}</span>
                                <button
                                    className="delete-button"
                                    onClick={() => confirmRemoveFriend(friend)}
                                >
                                    Excluir
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="friend-requests">
                    <h2><FaUserPlus /> Convites</h2>
                    <button className="open-popup-button" onClick={() => setShowRequestsPopup(true)}>
                        Ver Convites
                    </button>
                </section>
            </div>

            {/* Modal de confirmação de exclusão */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <p>Deseja realmente remover <strong>{selectedFriend.name}</strong> da sua lista de amigos?</p>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={handleRemoveConfirmed}>Sim</button>
                            <button className="cancel-button" onClick={handleCancelRemove}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup de convites */}
            {showRequestsPopup && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h3><FaUserPlus /> Convites de Amizade</h3>
                        {friendRequests.length > 0 ? (
                            <ul>
                                {friendRequests.map(request => (
                                    <li key={request.id}>
                                        <span onClick={() => handleGoToProfile(request.id)} className="friend-name">{request.name}</span>
                                        <button onClick={() => handleAcceptFriend(request.id)}>Aceitar</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhum convite de amizade.</p>
                        )}

                        <h3 style={{ marginTop: '20px' }}><FaUsers /> Convites para Times</h3>
                        {teamInvites.length > 0 ? (
                            <ul>
                                {teamInvites.map(invite => (
                                    <li key={invite.id}>
                                        {invite.teamName}
                                        <button onClick={() => handleAcceptTeamInvite(invite.id)}>Aceitar</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhum convite de time.</p>
                        )}

                        {/* ⚠️ Mensagem posicionada fora da box de times */}
                        {teamWarningId !== null && currentTeam && (
                            <p className="team-warning-outside">⚠️Você já está em um time.</p>
                        )}

                        <button className="close-popup-button" onClick={() => setShowRequestsPopup(false)}>
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Invites;
