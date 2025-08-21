import './User.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../../../Services/API';
import Icon from '@mdi/react';
import { mdiUbisoft } from '@mdi/js';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import ferro from '../../../assets/ferro.png';
import bronze from '../../../assets/bronze.png';
import prata from '../../../assets/prata.png';
import ouro from '../../../assets/ouro.png';
import platina from '../../../assets/platina.png';
import challenger from '../../../assets/challenger.png';
import master from '../../../assets/master.png';

function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();

  const [usuario, setUsuario] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token'); // Supondo que o token está no localStorage
    if (!id) {
      setError('ID do usuário não fornecido.');
      setLoading(false);
      return;
    }

    async function fetchUsuario() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`, // Adicionando o token no cabeçalho da requisição
        };

        const { data } = await api.get(`/usuario/${id}`, { headers });
        setUsuario(data);

        // Buscar o time do usuário pelo id_usuario
        try {
          const { data: timeData } = await api.get(`/usuario/${id}/time`, { headers });
          if (timeData.rank) {
            setRank(timeData.rank);
          }
        } catch (err) {
          console.error('Erro ao buscar o time:', err);
          setError('Erro ao carregar as informações do time.');
        }

      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        if (err.response?.status === 400 || err.response?.status === 404) {
          setError('Usuário não encontrado.');
        } else if (err.response?.status === 403) {
          setError('Acesso negado. Faça login novamente.');
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
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <p className="error-message">{error}</p>
        </div>
      </>
    );
  }

  const imagemUsuario = usuario.imagemUsuario
    ? usuario.imagemUsuario.startsWith('data:image')
      ? usuario.imagemUsuario
      : `data:image/png;base64,${usuario.imagemUsuario}`
    : '/default-user.png';

  const rankToImage = {
    FERRO: ferro,
    BRONZE: bronze,
    PRATA: prata,
    OURO: ouro,
    PLATINA: platina,
    CHALLENGER: challenger,
    MASTER: master,
  };

  const imagemRank = rank ? rankToImage[rank.toUpperCase()] : '/default-rank.png';
  const nomeRank = rank || 'Sem rank';

  return (
    <>
      <Navbar />
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <img
            className="profile-avatar"
            src={imagemUsuario}
            alt={`Foto de ${usuario.nome || 'usuário'}`}
          />
          <div className="profile-text">
            <h1 className="profile-nome">
              {usuario.apelidoTime && (
                <span className="profile-apelido">{usuario.apelidoTime} | </span>
              )}
              {usuario.nome || 'Nome não disponível'}
            </h1>
            <p className="profile-email">
              <strong className="ubisoft-text">
                <Icon path={mdiUbisoft} size={1} className="ubisoft-icon" />
                UbiConnect:
              </strong>{' '}
              <span className="ubi-connect-valor">
                {usuario.ubiConnect || 'Não informado'}
              </span>
            </p>
          </div>
        </div>

        {/* Rank + Títulos */}
        <div className="profile-body">
          {/* Rank do time */}
          <div className="rank-card">
            <img className="rank-image" src={imagemRank} alt="Rank do time" />
            <p className="rank-name">{nomeRank}</p>
          </div>

          {/* Títulos */}
          <div className="titles-card">
            <h3 className="titles-header">Títulos:</h3>
            <div className="titles-list">
              {usuario.titulos && usuario.titulos.length > 0 ? (
                usuario.titulos.map((titulo, index) => (
                  <div key={index} className="title-item">
                    <img
                      className="champ-image"
                      src={
                        titulo.imagem
                          ? `data:image/png;base64,${titulo.imagem}`
                          : '/default-campeonato.png'
                      }
                      alt={titulo.nome || 'Campeonato'}
                    />
                    <p className="title-name">{titulo.nome}</p>
                  </div>
                ))
              ) : (
                <p className="no-titles">Nenhum título conquistado.</p>
              )}
            </div>
          </div>
        </div>

        {/* Botão editar */}
        <div className="profile-actions">
          <button className="btn edit" onClick={handleEdit}>
            ✏️ Editar Perfil
          </button>
        </div>
      </div>
    </>
  );
}

export default User;
