import React, { useEffect, useState } from 'react';
import './InfoEditCampeonatos.css';
import Navbar from '../../../Components/Navbar/Navbar';
import LoadingScreen from '../../../Components/LoadingScreen/LoadingScreen';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../Services/API';

const InfoEditCampeonatos = () => {
  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editDataFim, setEditDataFim] = useState('');
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
        setCampeonato(response.data);
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

  const formatarImagem = (img) => {
    if (!img || img === '') return 'https://via.placeholder.com/200?text=Sem+Imagem';
    return img.startsWith('data:image') ? img : `data:image/png;base64,${img}`;
  };

  const abrirModal = () => {
    setEditNome(campeonato.nome);
    setEditDataFim(campeonato.dataFim || '');
    setEditStatus(campeonato.status);
    setEditImagem(campeonato.imagemCampeonato || '');
    setPreviewImagem(formatarImagem(campeonato.imagemCampeonato));
    setModalOpen(true);
  };

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;

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
      await api.put(`/campeonatos/${id}`, {
        nome: editNome,
        dataFim: editDataFim || null,
        status: editStatus,
        imagemCampeonato: editImagem || null
      });
      alert('✅ Campeonato atualizado com sucesso!');
      setModalOpen(false);
      // Recarregar dados do campeonato
      const response = await api.get(`/campeonatos/${id}`);
      setCampeonato(response.data);
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
                <span className={`tag-tipo ${campeonato.tipo.toLowerCase()}`}>{campeonato.tipo}</span>
                <span className={`tag-status ${campeonato.status.toLowerCase()}`}>{campeonato.status}</span>
              </div>
              <p>{campeonato.dataInicio} - {campeonato.dataFim || '-'}</p>
              <p>Entrada: {campeonato.tipo === 'GRATUITO' ? 'Gratuito' : `R$ ${Number(campeonato.valor || 0).toFixed(2)}`}</p>
              <p>Prêmio: {campeonato.premio || '-'}</p>
            </div>
            <div className="botoes-box">
              <button className="btn-editar" onClick={abrirModal}>Editar</button>
              <button className="btn-voltar" onClick={handleVoltar}>Voltar</button>
            </div>
          </div>

          {/* DESCRIÇÃO */}
          <div className="card-desc">
            <h2>Descrição</h2>
            <p>{campeonato.descricao || '-'}</p>
          </div>

        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Campeonato</h2>

            <div className="modal-field">
              <label>Nome do Campeonato:</label>
              <input
                type="text"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label>Data de Fim:</label>
              <input
                type="date"
                value={editDataFim}
                onChange={(e) => setEditDataFim(e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label>Status:</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <option value="ABERTO">Aberto</option>
                <option value="FECHADO">Fechado</option>
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
