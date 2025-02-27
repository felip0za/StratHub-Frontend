// src/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Presentation.css'; 
/*import R6HubLogo from './assets/R6HubLogo.png'; // Ajuste o caminho e a extensão conforme necessário*/

const Presentation = () => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();
        navigate("/login");
    }

    return (
        <div className="presentation-container">
            <h2>Página Inicial</h2>
            <button onClick={handleClick}>Cadastrar-se</button>
        </div>
    );
};

export default Presentation;