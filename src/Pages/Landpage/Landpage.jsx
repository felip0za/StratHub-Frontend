// src/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landpage.css'; /* Importando o CSS */

/* Caso tenha o logo, descomente e ajuste o caminho correto */
import StratHub from "/src/assets/StratHub.png";  

const Landpage = () => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();
        navigate("/home");
    }

    return (
        <div className="presentation-container">
            {/* Caso tenha o logo, adicione-o assim */}
            <img src={StratHub} alt="R6Hub Logo" className="logo_" /> 
            
            <h2>Bem-vindo ao STRATHUB!</h2>
            <p>Encontre e crie lobbies para Rainbow Six Siege com facilidade.</p>
            <button className="btn-login" onClick={handleClick}>
                Entrar
            </button>
        </div>
    );
};

export default Landpage;
