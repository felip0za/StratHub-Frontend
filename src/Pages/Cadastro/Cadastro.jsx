import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../Services/API';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import Tesseract from 'tesseract.js';
import './Cadastro.css';

const Cadastro = () => {
  const navigate = useNavigate();
  const api = useApi();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    confirmEmail: '',
    nome: '',
    senha: '',
    ubiConnect: '',
    imagemUsuario: '',
    kd: '',
    rank: '',
    kdPreview: '',
    rankPreview: ''
  });
  const [error, setError] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && !formData.email.includes('@')) {
      setError('Digite um e-mail válido.');
      return;
    }
    if (step === 2 && formData.confirmEmail !== formData.email) {
      setError('Os e-mails não coincidem.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imagemUsuario: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // --- OCR para Rank e KD ---
  const handleOcrSingleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    setError('');
    setOcrLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageBase64 = reader.result;
      setFormData(prev => ({
        ...prev,
        kdPreview: imageBase64,
        rankPreview: imageBase64,
        kd: '',
        rank: ''
      }));

      Tesseract.recognize(imageBase64, 'por', { logger: m => console.log(m) })
        .then(({ data: { text } }) => {
          setOcrLoading(false);
          let cleanText = text.replace(/\s+/g, ' ').trim().toUpperCase();
          console.log('Texto extraído pelo OCR:', cleanText);

          // --- KD (valor após MRT ou ELIM) ---
          const kdMatch =
            cleanText.match(/MRT[\/\s]*ELIM[^\d]*([\d.,]+)/i) ||
            cleanText.match(/MRT[^\d]*([\d.,]+)/i) ||
            cleanText.match(/ELIM[^\d]*([\d.,]+)/i) ||
            cleanText.match(/COLOCA[ÇC][AÃ]O[^\d]*([\d.,]+)/i);

          let kd = kdMatch ? kdMatch[1].replace(',', '.').trim() : '';

          // Corrige KD mal lido (ex: 12 -> 1.2)
          if (/^\d{2,}$/.test(kd)) {
            const val = parseInt(kd, 10);
            if (val > 10) kd = (val / 10).toFixed(1);
          }

          // --- Rank (Cobre, Bronze, etc.) ---
          let rankMatch = cleanText.match(/(COBRE|BRONZE|PRATA|OURO|PLATINA|DIAMANTE|CAMPEA?O)\s*[IVX0-9]*/i);
          let rank = rankMatch ? rankMatch[0].trim().toUpperCase() : '';

          rank = rank.replace(/[^A-Z0-9\sIVX]/g, '').trim();

          // --- Detecção refinada do nível ---
          const levelMatch = cleanText.match(/\bII\b|\bIII\b|\bIV\b|\bV\b|\bI\b/g);

          if (rank && (rank.includes('COBRE') || rank.includes('BRONZE') || rank.includes('PRATA') ||
              rank.includes('OURO') || rank.includes('PLATINA') || rank.includes('DIAMANTE') || rank.includes('CAMPEA'))) {

            if (levelMatch) {
              const level = levelMatch[levelMatch.length - 1];
              if (!rank.includes(level)) {
                rank = rank.replace(/\s*[IVX0-9]*$/, '') + ' ' + level;
              }
            } else {
              if (!/\bI{1,3}\b|IV|V/.test(rank)) rank += ' II';
            }
          }

          // --- Correção de erro comum: COBRE I detectado, mas imagem mostra II ---
          if (/COBRE I\b/.test(rank) && /\bII\b/.test(cleanText)) {
            rank = rank.replace('COBRE I', 'COBRE II');
          }

          setFormData(prev => ({ ...prev, kd, rank }));

          if (!kd) setError('⚠️ Não foi possível extrair o KD da imagem.');
          if (!rank) setError('⚠️ Não foi possível extrair o Rank da imagem.');
        })
        .catch(err => {
          setOcrLoading(false);
          setError('Erro ao processar OCR. Tente outra imagem.');
          console.error(err);
        });
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.kd || !formData.rank) {
      setError('Certifique-se de enviar uma imagem válida com KD e Rank.');
      return;
    }
    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const payload = {
        ...formData,
        imagemUsuario: formData.imagemUsuario
          ? formData.imagemUsuario.split(',')[1]
          : ''
      };

      const response = await api.post('/usuario/cadastrar', payload);
      const dados = response.data;

      if (dados.id) {
        alert('Cadastro realizado com sucesso!');
        navigate('/login');
      } else {
        setError('Erro no cadastro. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setError('Erro ao enviar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || ocrLoading) return <LoadingScreen />;

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Cadastro</h2>
        <p className="step-indicator">Etapa {step} de 4</p>

        {error && <div className="error-text">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step fade-in">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              <div className="wizard-buttons">
                <button type="button" onClick={handleNext}>Próximo</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step fade-in">
              <label>Confirme seu Email</label>
              <input type="email" name="confirmEmail" value={formData.confirmEmail} onChange={handleChange} required />
              <div className="wizard-buttons">
                <button type="button" onClick={handleBack}>Voltar</button>
                <button type="button" onClick={handleNext}>Próximo</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step fade-in">
              <label>Apelido</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />

              <label>Ubisoft Connect</label>
              <input type="text" name="ubiConnect" value={formData.ubiConnect} onChange={handleChange} required />

              <label>Senha</label>
              <input type="password" name="senha" value={formData.senha} onChange={handleChange} required />

              <label>Imagem do Perfil</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {formData.imagemUsuario && (
                <div className="preview-container">
                  <p>Pré-visualização:</p>
                  <img src={formData.imagemUsuario} alt="Preview" className="preview-img" />
                </div>
              )}

              <div className="wizard-buttons">
                <button type="button" onClick={handleBack}>Voltar</button>
                <button type="button" onClick={handleNext}>Próximo</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="form-step fade-in">
              <label>Imagem com Rank e KD</label>
              <input type="file" accept="image/*" onChange={handleOcrSingleImageChange} />

              {formData.kdPreview && (
                <div className="preview-container">
                  <p>Pré-visualização:</p>
                  <img src={formData.kdPreview} alt="Preview OCR" className="preview-img" />
                </div>
              )}

              <label>KD (extraído automaticamente)</label>
              <input type="text" value={formData.kd} readOnly placeholder="KD extraído" />

              <label>Rank (extraído automaticamente)</label>
              <input type="text" value={formData.rank} readOnly placeholder="Rank extraído" />

              <div className="wizard-buttons">
                <button type="button" onClick={handleBack}>Voltar</button>
                <button type="submit" disabled={!formData.kd || !formData.rank}>Cadastrar</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
