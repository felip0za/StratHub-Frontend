import './User.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../../../Services/API';

function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('ID do usuário não fornecido.');
      setLoading(false);
      return;
    }

    async function fetchUsuario() {
      try {
        const { data } = await api.get(`/usuario/${id}`);
        console.log('imagemUsuario:', data.imagemUsuario); // debug
        setUsuario(data);
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        if (err.response?.status === 400 || err.response?.status === 404) {
          setError('Usuário não encontrado.');
        } else {
          setError('Erro ao carregar os dados do usuário.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsuario();
  }, [id, api]);

  const handleEdit = () => {
    navigate(`/editar-usuario/${id}`);
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

  // Usar imagem base64 com fallback, igual no Times
  const imagemUsuario = usuario.imagemUsuario
    ? `${usuario.imagemUsuario}`
    : "/default-user.png"; // Coloque um caminho válido para a imagem padrão

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-image-section">
            <img className="profile-photo" src={imagemUsuario} alt="Logo do time" />
          </div>

          <div className="profile-info-section">
            <h2 className="profile-name">{usuario.nome || 'Nome não disponível'}</h2>
            <p className="profile-detail">Email: {usuario.email || 'Email não disponível'}</p>
          </div>
        </div>

        <div className="profile-buttons">
          <button className="btn edit" onClick={handleEdit}>
            Editar Perfil
          </button>
        </div>
      </div>
    </>
  );
}

export default User;