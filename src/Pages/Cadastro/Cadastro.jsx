import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import Tesseract from "tesseract.js";
import "./Cadastro.css";

/**
 * Novo fluxo de cadastro (Opção A)
 * - Wizard em 4 passos
 * - OCR integrado com feedback de progresso
 * - Upload de imagem de perfil
 * - Validações de email, senha, ubiConnect
 * - Possibilidade de editar manualmente KD/Rank após OCR
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minPasswordLength = 6;

const Cadastro = () => {
  const api = useApi();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const ocrFileRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    confirmEmail: "",
    nome: "",
    senha: "",
    ubiConnect: "",
    imagemUsuario: "",
    kd: "",
    rank: "",
    kdPreview: "",
  });

  const update = (patch) => setForm((p) => ({ ...p, ...patch }));
  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    update({ [name]: value });
  };

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem válida para o perfil.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update({ imagemUsuario: reader.result });
    reader.readAsDataURL(file);
  };

  const handleOcrImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem válida para OCR.");
      return;
    }
    setError("");
    setOcrRunning(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageBase64 = reader.result;
      update({ kdPreview: imageBase64, kd: "", rank: "" });

      Tesseract.recognize(imageBase64, "por", { logger: (m) => {
        if (m.status === "recognizing text" && m.progress) setOcrProgress(Math.round(m.progress * 100));
      }})
        .then(({ data: { text } }) => {
          setOcrRunning(false);
          setOcrProgress(100);
          let cleanText = text.replace(/\s+/g, " ").trim().toUpperCase();

          // --- KD ---
          const kdMatch =
            cleanText.match(/MRT[\/\s]*ELIM[^\d]*([\d.,]+)/i) ||
            cleanText.match(/MRT[^\d]*([\d.,]+)/i) ||
            cleanText.match(/ELIM[^\d]*([\d.,]+)/i) ||
            cleanText.match(/COLOCA[ÇC][AÃ]O[^\d]*([\d.,]+)/i);
          let kd = kdMatch ? kdMatch[1].replace(",", ".").trim() : "";
          if (/^\d{2,}$/.test(kd)) { const val = parseInt(kd, 10); if (val > 10) kd = (val / 10).toFixed(1); }

          // --- Rank ---
          let rankMatch = cleanText.match(/(COBRE|BRONZE|PRATA|OURO|PLATINA|DIAMANTE|CAMPEA?O)\s*[IVX0-9]*/i);
          let rank = rankMatch ? rankMatch[0].replace(/[^A-Z0-9\sIVX]/g, "").trim() : "";

          // --- Nivel refinado ---
          const levelMatch = cleanText.match(/\bII\b|\bIII\b|\bIV\b|\bV\b|\bI\b/g);
          if (rank && /(COBRE|BRONZE|PRATA|OURO|PLATINA|DIAMANTE|CAMPEA)/.test(rank)) {
            if (levelMatch) {
              const level = levelMatch[levelMatch.length - 1];
              if (!rank.includes(level)) rank = rank.replace(/\s*[IVX0-9]*$/, "") + " " + level;
            } else { if (!/\bI{1,3}\b|IV|V/.test(rank)) rank += " II"; }
          }

          // --- Correção comum ---
          if (/COBRE I\b/.test(rank) && /\bII\b/.test(cleanText)) rank = rank.replace("COBRE I", "COBRE II");

          update({ kd, rank });
          if (!kd) setError("⚠️ Não foi possível extrair o KD da imagem.");
          if (!rank) setError("⚠️ Não foi possível extrair o Rank da imagem.");
        })
        .catch((err) => {
          setOcrRunning(false);
          setOcrProgress(0);
          setError("Erro ao processar OCR. Tente outra imagem.");
          console.error(err);
        });
    };
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    setError("");
    if (step === 1 && !emailRegex.test(form.email)) { setError("Digite um e-mail válido."); return false; }
    if (step === 2 && form.confirmEmail !== form.email) { setError("E-mails não coincidem."); return false; }
    if (step === 3) {
      if (!form.nome || form.nome.length < 2) { setError("Digite um apelido válido."); return false; }
      if (!form.ubiConnect || form.ubiConnect.length < 3) { setError("Digite seu Ubisoft Connect (apenas letras/números)."); return false; }
      if (form.senha.length < minPasswordLength) { setError(`Senha deve ter ao menos ${minPasswordLength} caracteres.`); return false; }
    }
    if (step === 4 && (!form.kd || !form.rank)) { setError("Envie a imagem com KD e Rank ou preencha manualmente antes de prosseguir."); return false; }
    return true;
  };

  const handleNext = () => { if (validateStep()) { goNext(); window.scrollTo({ top: 0, behavior: "smooth" }); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validateStep()) return;
    try {
      setLoading(true); setError("");
      const payload = { email: form.email, nome: form.nome, senha: form.senha, ubiConnect: form.ubiConnect, kd: form.kd, rank: form.rank, imagemUsuario: form.imagemUsuario ? form.imagemUsuario.split(",")[1] : "" };
      const resp = await api.post("/usuario/cadastrar", payload); const data = resp.data;
      if (data?.id) { alert("Cadastro realizado com sucesso!"); navigate("/login"); } 
      else setError("Erro no cadastro. Verifique os dados e tente novamente.");
    } catch (err) { console.error("Erro no cadastro:", err); setError("Erro ao enviar cadastro. Tente novamente mais tarde."); }
    finally { setLoading(false); }
  };

  const passwordStrength = () => { const p = form.senha; if (p.length >= 12) return "Alta"; if (p.length >= 8) return "Boa"; if (p.length >= minPasswordLength) return "Fraca"; return "Muito fraca"; };

  if (loading || ocrRunning) return <LoadingScreen />;

  return (
    <div className="register-container modern">
      <div className="register-card">
        <div className="card-header">
          <h1>Criar Conta</h1>
          <p className="subtitle">Registro seguro — leve 1 minuto</p>
        </div>

        <div className="steps-indicator" aria-hidden>
          <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`connector ${step > 1 ? "active" : ""}`} />
          <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className={`connector ${step > 2 ? "active" : ""}`} />
          <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
          <div className={`connector ${step > 3 ? "active" : ""}`} />
          <div className={`step ${step >= 4 ? "active" : ""}`}>4</div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {step === 1 && (
            <section className="form-step">
              <label>Email</label>
              <input type="email" name="email" placeholder="seu@exemplo.com" value={form.email} onChange={handleChange} required autoFocus aria-label="email" />
              <div className="helper">Usaremos para login e recuperação de conta.</div>
              <div className="controls"><button type="button" onClick={handleNext} className="btn-primary">Continuar</button></div>
            </section>
          )}

          {step === 2 && (
            <section className="form-step">
              <label>Confirmar Email</label>
              <input type="email" name="confirmEmail" placeholder="confirme seu email" value={form.confirmEmail} onChange={handleChange} required aria-label="confirmEmail" />
              <div className="controls">
                <button type="button" onClick={goPrev} className="btn-ghost">Voltar</button>
                <button type="button" onClick={handleNext} className="btn-primary">Próximo</button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="form-step">
              <label>Apelido</label>
              <input type="text" name="nome" placeholder="Seu apelido" value={form.nome} onChange={handleChange} required aria-label="nome" />
              <div className="two-cols">
                <div>
                  <label>Ubisoft Connect</label>
                  <input type="text" name="ubiConnect" placeholder="Ex: PlayerXYZ#123" value={form.ubiConnect} onChange={handleChange} required />
                </div>
                <div>
                  <label>Senha</label>
                  <input type="password" name="senha" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={handleChange} required aria-describedby="pw-strength" />
                  <div id="pw-strength" className="helper">Força: {passwordStrength()}</div>
                </div>
              </div>
              <label>Imagem de Perfil (opcional)</label>
              <input type="file" accept="image/*" onChange={handleProfileImage} ref={fileInputRef} />
              {form.imagemUsuario && (<div className="img-preview"><img src={form.imagemUsuario} alt="Avatar preview" /></div>)}
              <div className="controls">
                <button type="button" onClick={goPrev} className="btn-ghost">Voltar</button>
                <button type="button" onClick={handleNext} className="btn-primary">Próximo</button>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="form-step">
              <label>Imagem com KD e Rank</label>
              <input type="file" accept="image/*" onChange={handleOcrImage} ref={ocrFileRef} />
              {form.kdPreview && (<div className="ocr-preview"><img src={form.kdPreview} alt="OCR preview" /></div>)}
              <div className="ocr-status">
                {ocrRunning ? (<div className="ocr-loading">Processando OCR: {ocrProgress}%</div>) : ocrProgress > 0 ? (<div className="ocr-loading">OCR concluído: {ocrProgress}%</div>) : (<div className="helper">Envie uma imagem nítida do placar com KD e Rank</div>)}
              </div>
              <div className="ocr-fields">
                <div><label>KD (extraído automaticamente)</label><input type="text" name="kd" value={form.kd} onChange={handleChange} placeholder="Ex: 1.23" /></div>
                <div><label>Rank (extraído automaticamente)</label><input type="text" name="rank" value={form.rank} onChange={handleChange} placeholder="Ex: OURO II" /></div>
              </div>
              <div className="controls">
                <button type="button" onClick={goPrev} className="btn-ghost">Voltar</button>
                <button type="submit" className="btn-primary">Cadastrar</button>
              </div>
            </section>
          )}
        </form>

        <div className="card-footer"><small>Ao se cadastrar você concorda com os termos de uso.</small></div>
      </div>
    </div>
  );
};

export default Cadastro;
