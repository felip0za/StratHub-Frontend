import React from 'react';
import './User.css';
import Navbar from '../../Components/Navbar/Navbar';
import R6HubLogo from "/src/assets/R6HubLogo.png";
//import Ubisoft from "/src/assets/Ubisoft.png"

function User() {
  const user = {
    id: 'J4iminh0',
    apelido: 'Jaime Silva',
    photo: 'https://via.placeholder.com/150', // URL da foto do usuário
    valor:'125.50'
  };

  return (
    <>
      <Navbar />
      <div className="user-profile">
      <img src={R6HubLogo} alt="Logo do sistema" className="user-photo" />
          <div className="user-details">
            <h2 className="user-name">{user.apelido}</h2>
          </div>
          <p className='ubi-id'>Ubisoft connect : {user.id}</p>
          <p className='user-valor'> Carteira: {user.valor}</p>
        <div className="button-group">
          <button className="user-button deactivate-button">Desativar Conta</button>
          <button className="user-button edit-button">Editar</button>
        </div>
      </div>
    </>
  );
};

export default User;