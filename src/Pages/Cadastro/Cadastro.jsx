import React, { useState } from 'react';
import { useApi } from '../../Services/API';
import './Cadastro.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cadastro = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    confirmEmail: '',
    nome: '',
    senha: '',
    ubiConnect: '',
    imagemUsuario: '',
    rank: 'Unranked',
    kd: 0.0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStats, setIsFetchingStats] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const api = useApi();

  const handleNext = () => {
    if (step === 1 && !formData.email) {
      setError('Digite um e-mail válido.');
      return;
    }
    if (step === 2 && formData.confirmEmail !== formData.email) {
      setError('O e-mail de confirmação não corresponde.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchR6Stats = async (ubiConnect) => {
    setIsFetchingStats(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/stats/${ubiConnect}`);
      const segments = response.data.data.segments;
      const rankedSegment = segments.find(seg => seg.type === 'ranked');

      if (rankedSegment) {
        const rank = rankedSegment.stats.rank.metadata.name || 'Desconhecido';
        const kd = rankedSegment.stats.kd.value || 0.0;

        setFormData((prev) => ({
          ...prev,
          rank: rank,
          kd: parseFloat(kd.toFixed(2)),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          rank: 'Desconhecido',
          kd: 0.0,
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar stats do R6 (via backend):', err);
      setFormData((prev) => ({
        ...prev,
        rank: 'Erro ao buscar',
        kd: 0.0,
      }));
    } finally {
      setIsFetchingStats(false);
    }
  };

  const handleUbiConnectChange = (value) => {
    handleChange('ubiConnect', value);
    if (value && value.length > 2) {
      fetchR6Stats(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/usuario/cadastrar', formData);
      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (err) {
      console.error('Erro no cadastro:', err);
      if (err.response?.data?.erro) {
        setError(err.response.data.erro);
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      handleChange('imagemUsuario', base64String);
    };
    reader.readAsDataURL(file);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            <div className="wizard-buttons">
              <button type="button" onClick={handleNext}>Próximo</button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <label>Confirme seu Email</label>
            <input
              type="email"
              value={formData.confirmEmail}
              onChange={(e) => handleChange('confirmEmail', e.target.value)}
              required
            />
            <div className="wizard-buttons">
              <button type="button" onClick={handleBack}>Voltar</button>
              <button type="button" onClick={handleNext}>Próximo</button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <label>Apelido</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
            />

            <label>UbisoftConnect</label>
            <input
              type="text"
              value={formData.ubiConnect}
              onChange={(e) => handleUbiConnectChange(e.target.value)}
              required
            />

            {isFetchingStats && <p className="fetching-loader">Buscando stats do R6 Tracker...</p>}

            <label>Rank (R6)</label>
            <input type="text" value={formData.rank} disabled />

            <label>K/D (R6)</label>
            <input type="text" value={formData.kd} disabled />

            <label>Senha</label>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              required
            />

            <label>Imagem de perfil</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {formData.imagemUsuario && (
              <div className="preview-container">
                <p>Pré-visualização da imagem:</p>
                <img
                  src={`data:image/png;base64,${formData.imagemUsuario}`}
                  alt="Pré-visualização"
                  className="preview-img"
                />
              </div>
            )}

            <div className="wizard-buttons">
              <button type="button" onClick={handleBack}>Voltar</button>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="register-container">
      <h2>Cadastro - Etapa {step} de 3</h2>
      {error && <div className="error-text">{error}</div>}
      <form onSubmit={handleSubmit}>
        {renderStep()}
      </form>
    </div>
  );
};

export default Cadastro;
