import React from 'react';
import './User.css';
import Navbar from '../../Components/Navbar/Navbar';
import StratHub from '/src/assets/Strathub.png'

function User() {
  const user = {
    id: 'J4iminh0',
    apelido: 'Jaime Silva',
    photo: 'https://via.placeholder.com/200',
    valor: 'R$ 125,50'
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
            <p className="profile-detail"><strong>Carteira:</strong> {user.valor}</p>
          </div>
        </div>

        <div className="profile-buttons">
          <button className="btn deactivate">Desativar Conta</button>
          <button className="btn edit">Editar Perfil</button>
        </div>
      </div>
    </>
  );
}

export default User;
