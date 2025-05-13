import { useState } from "react";
import "./CriarLobby.css"; // Importa o CSS

export default function CreateLobby() {
  const [lobbyName, setLobbyName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  const handleCreateLobby = () => {
    const lobbyData = {
      name: lobbyName,
      private: isPrivate,
      password: isPrivate ? password : null,
    };
    console.log("Lobby criado:", lobbyData);
    // Enviar para backend se necessário
  };

  return (
    <div className="create-lobby-container">
      <div className="create-lobby-card">
        <h2 className="create-lobby-title">Criar Lobby</h2>

        <div className="form-group">
          <label className="form-label">Nome do Lobby</label>
          <input
            type="text"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            className="form-input"
            placeholder="Digite o nome do lobby"
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="form-label">Lobby Privado?</label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="checkbox-input"
          />
        </div>

        {isPrivate && (
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Digite a senha do lobby"
            />
          </div>
        )}

        <button className="create-button" onClick={handleCreateLobby}>
          Criar Lobby
        </button>
      </div>
    </div>
  );
}
