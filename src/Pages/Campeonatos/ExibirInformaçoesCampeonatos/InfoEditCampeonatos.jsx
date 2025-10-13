import React, { useEffect, useState } from 'react';
import './InfoEditCampeonatos.css';
import Navbar from '../../../Components/Navbar/Navbar';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';

// === COMPONENTE CHAVEAMENTO ===
const Chaveamento = ({ grupos }) => {
  const placeholderTimes = Array(4).fill({ nome: '-', pontos: '-' });

  return (
    <div className="chaveamento-box">
      <h2>CHAVEAMENTO</h2>
      <div className="grupos-container">
        {['A', 'B', 'C', 'D'].map((letra) => (
          <div key={letra} className="grupo">
            <h3>Grupo {letra}</h3>
            {(grupos?.[letra]?.length ? grupos[letra] : placeholderTimes).map((time, i) => (
              <div key={i} className="time-item">
                <div className="logo-time">
                  <img src={time.logo || 'https://via.placeholder.com/40'} alt={time.nome} />
                </div>
                <span className="nome-time">{time.nome}</span>
                <span className="pontos-time">{time.pontos}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const InfoEditCampeonatos = () => {
  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editImagem, setEditImagem] = useState('');
  const [previewImagem, setPreviewImagem] = useState('');
  const [saving, setSaving] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    const fetchCampeonato = async () => {
      try {
        const response = await api.get(`/campeonatos/${id}`);
        setCampeonato(formatarDatas(response.data));
      } catch (err) {
        console.error('Erro ao buscar campeonato:', err);
        setError('❌ Erro ao carregar informações do campeonato.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampeonato();
  }, [api, id]);

  const handleVoltar = () => navigate('/campeonatos');

  const formatarDatas = (campeonato) => {
    if (campeonato.dataInicio) campeonato.dataInicio = campeonato.dataInicio.split('T')[0];
    if (campeonato.dataFim) campeonato.dataFim = campeonato.dataFim.split('T')[0];
    return campeonato;
  };

  const formatarImagem = (img) => {
    if (!img || img === '') return 'https://via.placeholder.com/200?text=Sem+Imagem';
    return img.startsWith('data:image') ? img : `data:image/png;base64,${img}`;
  };

  const formatarStatus = (status) => {
    if (!status) return '';
    return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const abrirModal = () => {
    setEditNome(campeonato.nome);
    setEditStatus(campeonato.status === 'ABERTO' ? 'EM_ANDAMENTO' : campeonato.status);
    setEditImagem(campeonato.imagemCampeonato || '');
    setPreviewImagem(formatarImagem(campeonato.imagemCampeonato));
    setModalOpen(true);
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setEditImagem(base64);
      setPreviewImagem(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSalvarEdicao = async () => {
    setSaving(true);
    try {
      const payload = {
        nome: editNome,
        descricao: campeonato.descricao,
        status: editStatus,
        imagemCampeonato: editImagem || null
      };

      await api.put(`/campeonatos/${id}`, payload);
      alert('✅ Campeonato atualizado com sucesso!');
      setModalOpen(false);

      const response = await api.get(`/campeonatos/${id}`);
      setCampeonato(formatarDatas(response.data));
    } catch (err) {
      console.error('Erro ao atualizar campeonato:', err);
      alert('❌ Erro ao atualizar campeonato.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return (
    <>
      <Navbar />
      <div className="erro-msg">{error}</div>
    </>
  );
  if (!campeonato) return null;

  return (
    <>
      <Navbar />
      <div className="detalhes-pagina">
        <div className="detalhes-box">

          {/* HEADER */}
          <div className="header-box">
            <div className="logo-box">
              <img src={formatarImagem(campeonato.imagemCampeonato)} alt={campeonato.nome} />
            </div>

            <div className="info-box">
              <h1>{campeonato.nome}</h1>
              
              <div className="tags-box">
                <span className={`tag-tipo ${campeonato.tipo.toLowerCase()}`}>
                  {campeonato.tipo === 'GRATUITO' ? 'Gratuito' : 'Pago'}
                </span>
                <span className={`tag-status ${campeonato.status.toLowerCase()}`}>
                  {formatarStatus(campeonato.status)}
                </span>
              </div>

              <div className="info-dados">
                <div className="info-item">
                  <strong>Data de Início📅:</strong> {campeonato.dataInicio}
                </div>
                <div className="info-item">
                  <strong>Data de Fim📅:</strong> {campeonato.dataFim || 'A ser definido'}
                </div>
                <div className="info-item">
                  <strong>Prêmio💵:</strong> {campeonato.premio !== null ? `R$ ${Number(campeonato.valor || 0).toFixed(2)}` : '-'}
                </div>
                <div className="info-item">
                  <strong>Entrada🎟️:</strong> {campeonato.tipo === 'GRATUITO' ? 'Gratuito' : `R$ ${Number(campeonato.valorPorEquipe || 0).toFixed(2)}`}
                </div>
                <div className="info-item">
                  <strong>Numero de equipes👥:</strong> {campeonato.maxEquipes}
                </div>
              </div>
            </div>

            <div className="botoes-box">
              <button className="btn-editar" onClick={abrirModal}>Editar</button>
              <button className="btn-voltar2" onClick={handleVoltar}>Voltar</button>
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <div className="card-desc">
            <h2>Descrição</h2>
            <p>{campeonato.descricao || '-'}</p>
          </div>

          {/* CHAVEAMENTO */}
          <Chaveamento grupos={campeonato.grupos} />

        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Campeonato</h2>

            <div className="modal-field">
              <label>Nome do Campeonato:</label>
              <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} />
            </div>

            <div className="modal-field">
              <label>Descrição:</label>
              <textarea
                value={campeonato.descricao}
                onChange={(e) => setCampeonato({...campeonato, descricao: e.target.value})}
              />
            </div>

            <div className="modal-field">
              <label>Status:</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                {(() => {
                  const statusAtual = campeonato.status;
                  let opcoes = [];

                  if (statusAtual === 'ABERTO') {
                    opcoes = [
                      { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
                      { value: 'FECHADO', label: 'Fechado' }
                    ];
                  } else if (statusAtual === 'EM_ANDAMENTO') {
                    opcoes = [
                      { value: 'ABERTO', label: 'Aberto' },
                      { value: 'FECHADO', label: 'Fechado' }
                    ];
                  } else if (statusAtual === 'FECHADO') {
                    opcoes = [
                      { value: 'ABERTO', label: 'Aberto' },
                      { value: 'EM_ANDAMENTO', label: 'Em Andamento' }
                    ];
                  }

                  return opcoes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ));
                })()}
              </select>
            </div>

            <div className="modal-field">
              <label>Imagem do Campeonato:</label>
              <input type="file" accept="image/*" onChange={handleImagemChange} />
              {previewImagem && <img src={previewImagem} alt="Preview" className="preview-modal-img" />}
            </div>

            <div className="modal-buttons">
              <button onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
              <button onClick={handleSalvarEdicao} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoEditCampeonatos;
