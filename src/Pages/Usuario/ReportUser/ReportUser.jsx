import './ReportUser.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../../../Services/API';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import avatardefault from '/src/assets/avatar-default.png';
import { useAuth } from '../../../contexts/AuthContext';

function ReportUser() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const api      = useApi();
  const { token, userId } = useAuth();

  const [usuario, setUsuario]     = useState(null);
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading]     = useState(true);
  const [status, setStatus]       = useState({ msg: '', tipo: '' });

  useEffect(() => {
    if (Number(id) === userId) { navigate('/perfil'); return; }

    const fetchUsuario = async () => {
      try {
        const { data } = await api.get(`/usuario/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setUsuario(data);
      } catch {
        setStatus({ msg: 'Erro ao carregar usuário.', tipo: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [id, api, token, userId, navigate]);

  const handleSubmit = async () => {
    if (!descricao.trim()) { setStatus({ msg: 'Descreva o motivo do report.', tipo: 'warning' }); return; }
    try {
      await api.post('/report', { reportadoId: Number(id), descricao: descricao.trim() }, { headers: { Authorization: `Bearer ${token}` } });
      setStatus({ msg: 'Report enviado com sucesso!', tipo: 'success' });
      setTimeout(() => navigate(-1), 1500);
    } catch {
      setStatus({ msg: 'Erro ao enviar report.', tipo: 'error' });
    }
  };

  if (loading) return <LoadingScreen />;

  const imagemUsuario = usuario?.imagemUsuario
    ? (usuario.imagemUsuario.startsWith('data:image') ? usuario.imagemUsuario : `data:image/png;base64,${usuario.imagemUsuario}`)
    : avatardefault;

  return (
    <>
      <Navbar />
      <div className="profile-container">

        {/* ── Header ── */}
        <div className="profile-header">
          <img className="profile-avatar" src={imagemUsuario} alt="Usuário reportado" />
          <div className="profile-text">
            <h1 className="profile-nome">Reportar Usuário</h1>
            <p style={{ color: '#8b949e', fontSize: '0.875rem', margin: 0 }}>
              Você está reportando: <strong style={{ color: '#e6edf3' }}>{usuario?.nome}</strong>
            </p>
          </div>
        </div>

        {/* ── Card Report ── */}
        <div className="report-card">
          <h3>Motivo do Report</h3>

          <textarea
            className="report-textarea"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Descreva o motivo do report..."
            rows={6}
          />

          {status.msg && (
            <p className={`report-status ${status.tipo}`}>{status.msg}</p>
          )}
        </div>

        {/* ── Ações ── */}
        <div className="profile-actions">
          <button className="btn report" onClick={handleSubmit}>
            🚨 Enviar Report
          </button>
          <button className="btn-logout btn" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>

      </div>
    </>
  );
}

export default ReportUser;