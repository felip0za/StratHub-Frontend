import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import './Cadastro.css';

const Cadastro = () => {
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
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && !formData.email) {
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
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
      const base64 = reader.result.split(',')[1];
      setPreviewUrl(reader.result);

      if (step === 3) {
        setFormData((prev) => ({ ...prev, imagemUsuario: base64 }));
        setOcrLoading(false);
      } else if (step === 4) {
        Tesseract.recognize(reader.result, 'eng', { logger: m => console.log(m) })
          .then(({ data: { text } }) => {
            setOcrLoading(false);
            console.log('Texto extraído:', text);

            // Regex flexível para KD (Ranked K/D, K/D, Kill/Death)
            const kdMatch = 
              text.match(/RANKED\s*KILL\/DEATH\s*[:\-]?\s*([\d.,]+)/i) ||
              text.match(/KILL\/DEATH\s*[:\-]?\s*([\d.,]+)/i) ||
              text.match(/K\/D\s*[:\-]?\s*([\d.,]+)/i) ||
              text.match(/KD\s*[:\-]?\s*([\d.,]+)/i);

            // Regex para Rank: aceita letras e números maiúsculos/minúsculos
            const rankMatch = text.match(/RANK\s*[:\-]?\s*([A-Za-z0-9]+)/i);

            const kd = kdMatch ? kdMatch[1].replace(',', '.') : '';
            const rank = rankMatch ? rankMatch[1].toUpperCase() : '';

            setFormData(prev => ({
              ...prev,
              kd,
              rank
            }));

            if (!kd || !rank) {
              setError('Não foi possível extrair KD ou Rank com clareza da imagem. Tente outra foto.');
            } else {
              setError('');
            }
          })
          .catch(err => {
            setOcrLoading(false);
            setError('Não foi possível ler os dados da imagem.');
            console.error(err);
          });
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.kd || !formData.rank) {
      setError('Certifique-se de enviar uma imagem válida com KD e Rank.');
      return;
    }

    console.log('Dados enviados:', formData);
    alert('Cadastro finalizado!');
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Cadastro</h2>
        <p className="step-indicator">Etapa {step} de 4</p>

        {error && <div className="error-text">{error}</div>}
        {ocrLoading && <div className="fetching-loader">Lendo dados da imagem...</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step fade-in">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="wizard-buttons">
                <button type="button" onClick={handleNext}>Próximo</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step fade-in">
              <label>Confirme seu Email</label>
              <input
                type="email"
                name="confirmEmail"
                value={formData.confirmEmail}
                onChange={handleChange}
                required
              />
              <div className="wizard-buttons">
                <button type="button" onClick={handleBack}>Voltar</button>
                <button type="button" onClick={handleNext}>Próximo</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step fade-in">
              <label>Apelido</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />

              <label>Ubisoft Connect</label>
              <input
                type="text"
                name="ubiConnect"
                value={formData.ubiConnect}
                onChange={handleChange}
                required
              />

              <label>Senha</label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                required
              />

              <label>Imagem do Perfil</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {formData.imagemUsuario && (
                <div className="preview-container">
                  <p>Pré-visualização:</p>
                  <img src={`data:image/png;base64,${formData.imagemUsuario}`} alt="Preview" className="preview-img" />
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
              <label>Imagem com Rank e K/D</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {previewUrl && (
                <div className="preview-container">
                  <p>Pré-visualização:</p>
                  <img src={previewUrl} alt="Preview" className="preview-img" />
                </div>
              )}

              <label>KD (extraído automaticamente)</label>
              <input
                type="text"
                name="kd"
                value={formData.kd}
                onChange={handleChange}
                placeholder="KD extraído"
              />

              <label>Rank (extraído automaticamente)</label>
              <input
                type="text"
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                placeholder="Rank extraído"
              />

              <div className="wizard-buttons">
                <button type="button" onClick={handleBack}>Voltar</button>
                <button type="submit" disabled={!formData.kd || !formData.rank}>
                  Cadastrar
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
