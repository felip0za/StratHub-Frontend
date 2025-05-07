import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Partidas.css';
import Navbar from '../../Components/Navbar/Navbar';

const Partidas = () => {
  const navigate = useNavigate();
  const team1 = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];
  const team2 = ['Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'];

  const [messages, setMessages] = useState([
    'Player 1: Ready to go!',
    'Player 6: Let\'s do this!',
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, `Player: ${message}`]);
      setMessage('');
    }
  };

  return (
    <>
      <Navbar />
      <div className="match-container">
        <button className="match-back-button" onClick={() => navigate('/home')}>
          Voltar
        </button>

        <h1 className="match-title">PARTIDA</h1>

        <div className="match-content">
          <div className="match-teams">
            <TeamCard title="Team 1" players={team1} align="left" />
            <h2 className="match-vs">X</h2>
            <TeamCard title="Team 2" players={team2} align="right" />
          </div>

          <div className="match-chat">
            <div className="match-chat-messages">
              {messages.map((msg, i) => <p key={i}>{msg}</p>)}
            </div>
            <div className="match-chat-input">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="match-input"
              />
              <button onClick={sendMessage} className="match-send-button">
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const TeamCard = ({ title, players, align }) => (
  <div className={`match-team-card ${align}`}>
    <h2>{title}</h2>
    {players.map((player, i) => (
      <p key={i}>{player}</p>
    ))}
  </div>
);

export default Partidas;
