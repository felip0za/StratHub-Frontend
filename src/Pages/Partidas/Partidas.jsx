import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importando o hook de navegação
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
    if (message) {
      setMessages([...messages, `Player: ${message}`]);
      setMessage('');
    }
  };

  return (
    <>
      <Navbar />
      <div className="game-screen">
        {/* Botão de voltar para a Home no canto superior esquerdo */}
        <button className="back-button" onClick={() => navigate('/home')}>
          Voltar
        </button>

        <div className="game-area">
          <h1 className='title-game'>PARTIDA</h1>
          <div className="team1">
            <h2>Team 1</h2>
            {team1.map((player, index) => (
              <p key={index}>{player}</p>
            ))}
          </div>
          <h2>X</h2>
          <div className="team2">
            <h2>Team 2</h2>
            {team2.map((player, index) => (
              <p key={index}>{player}</p>
            ))}
          </div>
        </div>

        <div className="chatbox">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="input-field"
            />
            <button onClick={sendMessage} className="send-button">
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Partidas;
