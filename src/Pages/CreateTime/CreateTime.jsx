import React, { useState } from 'react';
import './CreateTime.css'; // Importando o CSS para estilizar a página
import Navbar from '../../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

const CreateTime = () => {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    if (teamName && teamDescription) {
        console.log('Time Criado:', { teamName, teamDescription });
        navigate('/home');
    } else {
        alert('Por favor, preencha todos os campos.');
    }
};

  return (
    <>
    <Navbar />
    <div className="create-team-page">
      <div className="create-team-container">
        <h2>Criar Meu Time</h2>
        <form onSubmit={handleSubmit}>
          {/* Nome do time */}
          <label htmlFor="teamName">Nome do Time:</label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />

          {/* Descrição do time */}
          <label htmlFor="teamDescription">Descrição do Time:</label>
          <textarea
            id="teamDescription"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            placeholder="Digite uma breve descrição sobre o seu time"
            rows="4"
            required
          />

          {/* Botão de envio */}
          <button type="submit" className="submit-btn">
            Criar Time
          </button>
        </form>
      </div>
    </div>
    </>
    
  );
};

export default CreateTime;
