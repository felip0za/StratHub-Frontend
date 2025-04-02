// src/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Lendpage.css'; /* Importando o CSS */

/* Caso tenha o logo, descomente e ajuste o caminho correto */
import R6HubLogo from "/src/assets/R6HubLogo.png";  

const Lendpage = () => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();
        navigate("/login");
    }

    return (
        <div className="presentation-container">
            {/* Caso tenha o logo, adicione-o assim */}
            <img src={R6HubLogo} alt="R6Hub Logo" className="logo_" /> 
            
            <h2>Bem-vindo ao R6HUB!</h2>
            <p>Encontre e crie lobbies para Rainbow Six Siege com facilidade.</p>
            <button className="btn-login" onClick={handleClick}>
                Entrar
            </button>
        </div>
    );
};

export default Lendpage;
