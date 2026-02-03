import './ReportUser.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../../../Services/API';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import avatardefault from '/src/assets/avatar-default.png';
import { useAuth } from "../../../contexts/AuthContext";

function ReportUser() {
  const { id } = useParams(); // ID do usuário reportado
  const navigate = useNavigate();
  const api = useApi();
  const { token, userId } = useAuth();

  const [usuario, setUsuario] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [editImagem, setEditImagem] = useState('');

  useEffect(() => {
    async function fetchUsuario() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const { data } = await api.get(`/usuario/${id}`, { headers });
        setUsuario(data);
      } catch (err) {
        setStatus('❌ Erro ao carregar usuário.');
      } finally {
        setLoading(false);
      }
    }

    // bloqueia auto-report no frontend
    if (Number(id) === userId) {
      navigate('/perfil');
      return;
    }

    fetchUsuario();
  }, [id, api, token, userId, navigate]);

  const handleSubmit = async () => {
    if (!descricao.trim()) {
      setStatus('⚠️ Descreva o motivo do report.');
      return;
    }

    try {
      await api.post(
        '/report',
        {
          reportadoId: Number(id), // ✅ ID DO USUÁRIO REPORTADO
          descricao: descricao.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStatus('✅ Report enviado com sucesso!');
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setStatus('❌ Erro ao enviar report.');
    }
  };

  if (loading) return <LoadingScreen />;

  const imagemUsuario = usuario?.imagemUsuario
    ? (usuario.imagemUsuario.startsWith('data:image')
      ? usuario.imagemUsuario
      : `data:image/png;base64,${usuario.imagemUsuario}`)
    : avatardefault;

  return (
    <>
      <Navbar />

      <div className="profile-container">

        {/* HEADER */}
        <div className="profile-header">
          <img
            className="profile-avatar"
            src={imagemUsuario}
            alt="Usuário reportado"
          />

          <div className="profile-text">
            <h1 className="profile-nome">Reportar Usuário</h1>
            <p>
              Você está reportando:
              <strong> {usuario.nome}</strong>
            </p>
          </div>
        </div>

        {/* CARD DO REPORT */}
        <div className="rank-card" style={{ maxWidth: '600px', width: '100%' }}>
          <h3 style={{ marginBottom: '15px' }}>Motivo do Report</h3>

          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva o motivo do report..."
            rows={6}
            style={{
              width: '100%',
              borderRadius: '12px',
              padding: '12px',
              background: '#2a2a2a',
              color: '#fff',
              border: 'none',
              fontFamily: 'Poppins, sans-serif',
              resize: 'none'
            }}
          />

          {status && (
            <p
              style={{
                marginTop: '12px',
                fontWeight: '600',
                textAlign: 'center'
              }}
            >
              {status}
            </p>
          )}
        </div>

        {/* AÇÕES */}
        <div className="profile-actions">
          <button className="btn report" onClick={handleSubmit}>
            🚨 Enviar Report
          </button>

          <button
            className="btn edit"
            onClick={() => navigate(-1)}
          >
            ❌ Cancelar
          </button>
        </div>

      </div>
    </>
  );
}

export default ReportUser;
