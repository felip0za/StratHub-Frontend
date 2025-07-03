import './User.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../../Services/API';

function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsuario() {
      try {
        const { data } = await api.get(`/usuario/${id}`);
        setUsuario(data);
      } catch (err) {
        setError('Usuário não encontrado ou erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsuario();
  }, [id]);

  const handleEdit = () => {
    navigate('/editar-usuario');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <p className="loading">Carregando usuário...</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <p className="error-message">{error}</p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-image-section">
            {usuario.imagem_usuario ? (
              <img className="profile-photo" src={usuario.imagem_usuario} alt="Foto do usuário" />
            ) : (
              <div className="profile-photo placeholder">Sem imagem</div>
            )}
          </div>

          <div className="profile-info-section">
            <h2 className="profile-name">{usuario.nome}</h2>
            <p className="profile-detail">Email:{usuario.email}</p>
          </div>
        </div>

        <div className="profile-buttons">
          <button className="btn deactivate">Desativar Conta</button>
          <button className="btn edit" onClick={handleEdit}>
            Editar Perfil
          </button>
        </div>
      </div>
    </>
  );
}

export default User;
