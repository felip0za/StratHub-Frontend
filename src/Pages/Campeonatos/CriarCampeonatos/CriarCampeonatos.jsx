import React, { useState, useEffect } from 'react';
import './CriarCampeonatos.css';
import Navbar from '../../../Components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../Services/API';
import { useAuth } from '../../../contexts/AuthContext';

const CriarCampeonatos = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('GRATUITO');
  const [valorPremiacao, setValorPremiacao] = useState('0');
  const [maxEquipes, setMaxEquipes] = useState(4);
  const [formatoCampeonato, setFormatoCampeonato] = useState('FASE_DE_GRUPOS_E_ELIMINATORIAS');
  const [imagemBase64, setImagemBase64] = useState('');
  const [previewImagem, setPreviewImagem] = useState('');
  const [plataforma, setPlataforma] = useState('PC');
  const [consoleTipo, setConsoleTipo] = useState('AMBOS');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const api = useApi();
  const { user, token } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (formatoCampeonato === 'TABELA_ELIMINATORIAS') setMaxEquipes(10);
  }, [formatoCampeonato]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('❌ Selecione um arquivo de imagem válido.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemBase64(reader.result.split(',')[1]);
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
    if (!userId) { setError('❌ Usuário não autenticado.'); setLoading(false); return; }
    if (plataforma === 'CONSOLE' && !consoleTipo) { setError('❌ Selecione o tipo de console.'); setLoading(false); return; }

    const totalPremiacao = Number(valorPremiacao) || 0;
    if (tipo === 'PAGO' && totalPremiacao <= 0) {
      setError('❌ Informe o valor da premiação para campeonatos pagos.');
      setLoading(false);
      return;
    }

    const novoCampeonato = {
      nome,
      descricao,
      tipo,
      status: 'ABERTO',
      valor: totalPremiacao,
      maxEquipes,
      formatoCampeonato,
      imagemCampeonato: imagemBase64,
      dataInicio: new Date().toISOString(),
      dataFim: null,
      idCriador: userId,
      plataforma,
      console: plataforma === 'CONSOLE' ? consoleTipo : null,
      ...(tipo === 'PAGO' && { valorPorEquipe: totalPremiacao / maxEquipes }),
    };

    try {
      await api.post('/campeonatos', novoCampeonato, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Campeonato criado com sucesso!');
      navigate('/campeonatos');
    } catch (err) {
      console.error('Erro ao criar campeonato:', err);
      setError(err.response?.data?.message || '❌ Erro ao criar campeonato. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="criar-page">
        <div className="criar-container">

          <div className="criar-header">
            <button className="btn-back" onClick={() => navigate(-1)}>← Voltar</button>
            <div>
              <h1 className="criar-title">Criar Campeonato</h1>
              <p className="criar-subtitle">Configure seu torneio</p>
            </div>
          </div>

          {error && <div className="criar-error">{error}</div>}

          <form onSubmit={handleSubmit} className="criar-form">

            {/* Nome */}
            <div className="form-field">
              <label className="form-label">Nome do Campeonato <span className="required">*</span></label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="form-input"
                placeholder="Ex: Copa de Inverno 2025"
                required
              />
            </div>

            {/* Descrição */}
            <div className="form-field">
              <label className="form-label">Descrição <span className="required">*</span></label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows="4"
                className="form-input"
                placeholder="Descreva as regras e informações do campeonato..."
                required
              />
            </div>

            {/* Imagem */}
            <div className="form-field">
              <label className="form-label">Imagem de Capa <span className="required">*</span></label>
              <label className="form-file-label">
                <span className="form-file-icon">📸</span>
                <span>{previewImagem ? 'Trocar imagem' : 'Selecionar imagem'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="form-file-input" required={!imagemBase64} />
              </label>
              {previewImagem && (
                <div className="form-preview-wrap">
                  <img src={previewImagem} alt="Preview" className="form-preview" />
                </div>
              )}
            </div>

            {/* Row: Tipo + Formato */}
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Tipo</label>
                <div className="form-toggle">
                  <button type="button" className={`toggle-opt ${tipo === 'GRATUITO' ? 'active' : ''}`} onClick={() => setTipo('GRATUITO')}>
                    🆓 Gratuito
                  </button>
                  <button type="button" className={`toggle-opt ${tipo === 'PAGO' ? 'active' : ''}`} onClick={() => setTipo('PAGO')}>
                    💳 Pago
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Formato</label>
                <select
                  value={formatoCampeonato}
                  onChange={(e) => setFormatoCampeonato(e.target.value)}
                  className="form-select"
                >
                  <option value="FASE_DE_GRUPOS_E_ELIMINATORIAS">Grupos + Eliminatórias</option>
                  <option value="TABELA_ELIMINATORIAS">Tabela + Eliminatórias</option>
                </select>
              </div>
            </div>

            {/* Row: Premiação + Equipes */}
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Premiação (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorPremiacao}
                  onChange={(e) => setValorPremiacao(e.target.value)}
                  className="form-input"
                />
                <span className="form-hint">
                  {tipo === 'PAGO'
                    ? `Entrada: R$ ${(Number(valorPremiacao) / maxEquipes).toFixed(2)} por equipe`
                    : `Premiação gratuita: R$ ${Number(valorPremiacao).toFixed(2)}`}
                </span>
              </div>

              <div className="form-field">
                <label className="form-label">Máx. Equipes</label>
                {formatoCampeonato === 'TABELA_ELIMINATORIAS' ? (
                  <input type="number" value={10} disabled className="form-input" />
                ) : (
                  <select
                    value={maxEquipes}
                    onChange={(e) => setMaxEquipes(Number(e.target.value))}
                    className="form-select"
                  >
                    {[4, 8, 12, 16].map((q) => <option key={q} value={q}>{q} equipes</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Row: Plataforma + Console */}
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Plataforma</label>
                <div className="form-toggle">
                  <button type="button" className={`toggle-opt ${plataforma === 'PC' ? 'active' : ''}`} onClick={() => setPlataforma('PC')}>
                    🖥️ PC
                  </button>
                  <button type="button" className={`toggle-opt ${plataforma === 'CONSOLE' ? 'active' : ''}`} onClick={() => setPlataforma('CONSOLE')}>
                    🎮 Console
                  </button>
                </div>
              </div>

              {plataforma === 'CONSOLE' && (
                <div className="form-field">
                  <label className="form-label">Console</label>
                  <select
                    value={consoleTipo}
                    onChange={(e) => setConsoleTipo(e.target.value)}
                    className="form-select"
                  >
                    <option value="AMBOS">Ambos</option>
                    <option value="XBOX">Xbox</option>
                    <option value="PS">PlayStation</option>
                  </select>
                </div>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Criando…' : '🏆 Criar Campeonato'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CriarCampeonatos;