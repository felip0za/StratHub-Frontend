import React, { useState } from 'react';
import './CriarCampeonatos.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import { useAuth } from '../../../contexts/AuthContext';

const CriarCampeonatos = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('GRATUITO');
  const [status, setStatus] = useState('ABERTO');
  const [valor, setValor] = useState('');
  const [maxEquipes, setMaxEquipes] = useState(4);
  const [imagemBase64, setImagemBase64] = useState('');
  const [previewImagem, setPreviewImagem] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const api = useApi();
  const { user, token } = useAuth();
  const userId = user?.id;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('❌ Selecione um arquivo de imagem válido.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setImagemBase64(base64);
      setPreviewImagem(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!nome.trim() || !descricao.trim() || !imagemBase64) {
      setError('❌ Preencha todos os campos e selecione uma imagem.');
      setLoading(false);
      return;
    }

    if (!userId) {
      setError('❌ Usuário não autenticado.');
      setLoading(false);
      return;
    }

    if (tipo === 'PAGO' && (!valor || Number(valor) <= 0)) {
      setError('❌ Informe um valor válido para o campeonato pago.');
      setLoading(false);
      return;
    }

    const novoCampeonato = {
      nome,
      descricao,
      tipo,
      status,
      valor: tipo === 'PAGO' ? Number(valor) : 0,
      maxEquipes,
      imagemCampeonato: imagemBase64,
      idCriador: userId
    };

    try {
      await api.post('/campeonatos', novoCampeonato, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('✅ Campeonato criado com sucesso!');
      navigate('/campeonatos');
    } catch (err) {
      console.error('Erro ao criar campeonato:', err);
      setError(
        err.response?.data?.message ||
        '❌ Erro ao criar campeonato. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Botão de voltar
  const handleVoltar = () => navigate(-1);

  return (
    <>
      <Navbar />

      {/* Botão de voltar fora da box */}
      <div>
        <button className="btn-voltar" onClick={handleVoltar}>
          ← Voltar
        </button>
      </div>

      <div className="campeonatos-create-container">
        <h1 className="campeonatos-create-title">Criar Novo Campeonato</h1>

        {error && <div className="campeonatos-create-error">{error}</div>}

        <form onSubmit={handleSubmit} className="campeonatos-create-form">
          {/* Campos do formulário */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Nome do Campeonato:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="campeonatos-create-input"
              required
            />
          </div>

          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Descrição:</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows="4"
              className="campeonatos-create-input"
              required
            />
          </div>

          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Imagem:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="campeonatos-create-input"
              required
            />
            {previewImagem && (
              <img
                src={previewImagem}
                alt="Pré-visualização"
                className="campeonatos-create-preview"
              />
            )}
          </div>

          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Tipo:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="campeonatos-create-select"
            >
              <option value="GRATUITO">Gratuito</option>
              <option value="PAGO">Pago</option>
            </select>
          </div>

          {tipo === 'PAGO' && (
            <div className="campeonatos-create-field">
              <label className="campeonatos-create-label">Valor (R$):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="campeonatos-create-input"
                required
              />
            </div>
          )}

          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="campeonatos-create-select"
            >
              <option value="ABERTO">Aberto</option>
              <option value="FECHADO">Fechado</option>
            </select>
          </div>

          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Máximo de Equipes:</label>
            <select
              value={maxEquipes}
              onChange={(e) => setMaxEquipes(Number(e.target.value))}
              className="campeonatos-create-select"
            >
              {[4, 8, 12, 16].map((qtd) => (
                <option key={qtd} value={qtd}>
                  {qtd} equipes
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="campeonatos-create-button"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Criar Campeonato'}
          </button>
        </form>
      </div>
    </>
  );
};

export default CriarCampeonatos;
