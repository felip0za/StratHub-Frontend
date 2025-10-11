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
  const [valorPremiacao, setValorPremiacao] = useState('0');
  const [maxEquipes, setMaxEquipes] = useState(4);
  const [imagemBase64, setImagemBase64] = useState('');
  const [previewImagem, setPreviewImagem] = useState('');
  const [plataforma, setPlataforma] = useState('PC'); // PC ou CONSOLE
  const [consoleTipo, setConsoleTipo] = useState(''); // AMBOS, XBOX, PS
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
      setError('❌ Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    if (!userId) {
      setError('❌ Usuário não autenticado.');
      setLoading(false);
      return;
    }

    const totalPremiacao = Number(valorPremiacao) || 0;

    const novoCampeonato = {
      nome,
      descricao,
      tipo,
      status: 'ABERTO',
      valor: totalPremiacao,
      maxEquipes,
      imagemCampeonato: imagemBase64,
      dataInicio: new Date().toISOString(),
      dataFim: null,
      idCriador: userId,
      plataforma,
      console: plataforma === 'CONSOLE' ? consoleTipo : null
    };

    if (tipo === 'PAGO') {
      if (totalPremiacao <= 0) {
        setError('❌ Informe o valor da premiação (obrigatório) para campeonatos pagos.');
        setLoading(false);
        return;
      }
      novoCampeonato.valorPorEquipe = totalPremiacao / maxEquipes;
    }

    try {
      await api.post('/campeonatos', novoCampeonato, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('✅ Campeonato criado com sucesso!');
      navigate('/campeonatos');
    } catch (err) {
      console.error('Erro ao criar campeonato:', err);
      setError(
        err.response?.data?.message || '❌ Erro ao criar campeonato. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => navigate(-1);

  return (
    <>
      <Navbar />

      <div>
        <button className="btn-voltar" onClick={handleVoltar}>
          ← Voltar
        </button>
      </div>

      <div className="campeonatos-create-container">
        <h1 className="campeonatos-create-title">Criar Novo Campeonato</h1>

        {error && <div className="campeonatos-create-error">{error}</div>}

        <form onSubmit={handleSubmit} className="campeonatos-create-form">
          {/* Nome */}
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

          {/* Descrição */}
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

          {/* Imagem */}
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

          {/* Tipo de Campeonato */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Tipo de Campeonato:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="campeonatos-create-select"
            >
              <option value="GRATUITO">Gratuito</option>
              <option value="PAGO">Pago</option>
            </select>
          </div>

          {/* Valor da premiação (sempre visível) */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Valor da Premiação (R$):</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={valorPremiacao}
              onChange={(e) => setValorPremiacao(e.target.value)}
              className="campeonatos-create-input"
            />
            <small className="campeonatos-create-hint">
              {tipo === 'PAGO'
                ? `O valor total da premiação será dividido entre as equipes: cada equipe pagará R$ ${(Number(valorPremiacao) / maxEquipes).toFixed(2)}.`
                : `Este campeonato é gratuito; o valor da premiação será de R$ ${Number(valorPremiacao).toFixed(2)}.`}
            </small>

          </div>

          {/* Máximo de equipes */}
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

          {/* Plataforma */}
          <div className="campeonatos-create-field">
            <label className="campeonatos-create-label">Plataforma:</label>
            <select
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
              className="campeonatos-create-select"
            >
              <option value="PC">PC</option>
              <option value="CONSOLE">Console</option>
            </select>
          </div>

          {/* Console (aparece somente se plataforma = CONSOLE) */}
          {plataforma === 'CONSOLE' && (
            <div className="campeonatos-create-field">
              <label className="campeonatos-create-label">Console:</label>
              <select
                value={consoleTipo}
                onChange={(e) => setConsoleTipo(e.target.value)}
                className="campeonatos-create-select"
              >
                <option value="AMBOS">Ambos</option>
                <option value="XBOX">Xbox</option>
                <option value="PS">PlayStation</option>
              </select>
            </div>
          )}

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
