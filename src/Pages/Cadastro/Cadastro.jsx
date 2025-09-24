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

  // ---- Navegação entre etapas ----
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

  // ---- Input genérico ----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ---- Upload da foto de perfil ----
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
      // Mantém o prefixo data:image/... para preview e envio
      setFormData(prev => ({ ...prev, imagemUsuario: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ---- Upload OCR (KD e Rank) ----
  const handleOcrImageChange = (e, type) => {
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
      if (type === 'rank') setFormData(prev => ({ ...prev, rankPreview: imageBase64, rank: '' }));
      else setFormData(prev => ({ ...prev, kdPreview: imageBase64, kd: '' }));

      Tesseract.recognize(imageBase64, 'por', { logger: m => console.log(m) })
        .then(({ data: { text } }) => {
          setOcrLoading(false);
          const cleanText = text.replace(/\s+/g, ' ').trim().toUpperCase();
          console.log(`Texto extraído (${type}):`, cleanText);

          if (type === 'kd') {
            const kdMatch = cleanText.match(/K[\/\s]*D\s*[:=]?\s*([\d.,]+)/i);
            const kd = kdMatch ? kdMatch[1].replace(',', '.').trim() : '';
            setFormData(prev => ({ ...prev, kd }));
            if (!kd) setError('⚠️ Não foi possível extrair o KD da imagem.');
          }

          if (type === 'rank') {
            const rankMatch = cleanText.match(
              /(COBRE|BRONZE|PRATA|OURO|PLATINA|DIAMANTE|CHAMPION)\s*[IVX0-9]*/i
            );
            let rank = rankMatch ? rankMatch[0].trim().toUpperCase() : '';

            if (rank.includes('COBRE') || rank.includes('BRONZE') || rank.includes('PRATA') ||
                rank.includes('OURO') || rank.includes('PLATINA') || rank.includes('DIAMANTE') ||
                rank.includes('CHAMPION')) {
              rank = rank.replace(/\bCOBRE I\b/, 'COBRE II');
              rank = rank.replace(/[^A-Z0-9\sIVX]/g, '').trim();
              if (!/\d|I|V|X/.test(rank)) {
                rank += ' I';
              }
            }

            setFormData(prev => ({ ...prev, rank }));
            if (!rank) setError('⚠️ Não foi possível extrair o Rank da imagem.');
          }
        })
        .catch(err => {
          setOcrLoading(false);
          setError('Erro ao processar OCR. Tente outra imagem.');
          console.error(err);
        });
    };
    reader.readAsDataURL(file);
  };

  // ---- Envio final ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.kd || !formData.rank) {
      setError('Certifique-se de enviar imagens válidas com KD e Rank.');
      return;
    }
    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Se o backend NÃO aceita o prefixo data:image..., enviar só o base64 puro:
      const payload = {
        ...formData,
        imagemUsuario: formData.imagemUsuario
          ? formData.imagemUsuario.split(',')[1] // só base64 puro
          : ''
      };

      const response = await api.post('/usuario/cadastrar', payload);
      const dados = response.data;

      console.log('Resposta do cadastro:', dados);

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
          {/* Etapas 1 a 4 */}
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
              <label>Imagem do Rank</label>
              <input type="file" accept="image/*" onChange={(e) => handleOcrImageChange(e, 'rank')} />
              {formData.rankPreview && (
                <div className="preview-container">
                  <p>Pré-visualização Rank:</p>
                  <img src={formData.rankPreview} alt="Rank Preview" className="preview-img" />
                </div>
              )}

              <label>Imagem do K/D</label>
              <input type="file" accept="image/*" onChange={(e) => handleOcrImageChange(e, 'kd')} />
              {formData.kdPreview && (
                <div className="preview-container">
                  <p>Pré-visualização KD:</p>
                  <img src={formData.kdPreview} alt="KD Preview" className="preview-img" />
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
