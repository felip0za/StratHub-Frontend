import React, { useState } from 'react';
import './Profile.css';
import Navbar from '../../Components/Navbar/Navbar';
import StratHub from '/src/assets/Strathub.png'

function Profile() {
  const user = {
    id: 'J4iminh0',
    apelido: 'Jaime Silva',
  };

  // Estado para gerenciar o status do pedido de amizade
  const [friendRequestStatus, setFriendRequestStatus] = useState('');


  const handleAddFriend = () => {
    setFriendRequestStatus('Pedido de amizade enviado!');
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-image-section">
            <img src={StratHub} alt="Foto do usuário" className="profile-photo" />
          </div>
          <div className="profile-info-section">
            <h2 className="profile-name">{user.apelido}</h2>
            <p className="profile-detail"><strong>Ubisoft Connect:</strong> {user.id}</p>
          </div>
        </div>

        <div className="profile-buttons">
          {/* Novo botão para adicionar amizade */}
          <button className="btn add-friend" onClick={handleAddFriend}>
            Adicionar Amizade
          </button>
        </div>

        {/* Mensagem de status do pedido de amizade */}
        {friendRequestStatus && <p className="friend-request-status">{friendRequestStatus}</p>}
      </div>
    </>
  );
}

export default Profile;
