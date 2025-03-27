import React from 'react';
import './User.css';
import Navbar from '../../Components/Navbar/Navbar';
import R6HubLogo from "/src/assets/R6HubLogo.png";
import Ubisoft from "/src/assets/Ubisoft.png"

const User = () => {
  const user = {
    id: 'J4iminh0',
    apelido: 'Jaime Silva',
    photo: 'https://via.placeholder.com/150' // URL da foto do usuário
  };

  return (
    <>
      <Navbar />
      <div className="user-profile">
      <img src={R6HubLogo} alt="Logo do sistema" className="user-photo" />
        <div className="user-info">
          <div className="user-details">
            <h2 className="user-name">{user.apelido}</h2>
          </div>
          <img src={Ubisoft} alt="Logo da ubisoft" className="ubi-logo" />
          <p className='ubi-id'>:{user.id}</p>
        </div>
        <div className="button-group">
          <button className="user-button deactivate-button">Desativar Conta</button>
          <button className="user-button">Editar</button>
        </div>
      </div>
    </>
  );
};

export default User;