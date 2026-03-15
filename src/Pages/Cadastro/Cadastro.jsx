import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import { FaWindows, FaXbox, FaPlaystation } from "react-icons/fa";
import "./Cadastro.css";

const emailRegex        = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minPasswordLength = 8;  // alinhado com o backend

// Regras de senha — deve espelhar UsuarioService.validarSenha()
const PASSWORD_RULES = [
  { test: (s) => s.length >= 8,              label: 'Mínimo 8 caracteres'       },
  { test: (s) => /[A-Z]/.test(s),            label: 'Uma letra maiúscula'        },
  { test: (s) => /[a-z]/.test(s),            label: 'Uma letra minúscula'        },
  { test: (s) => /\d/.test(s),               label: 'Um número'                  },
  { test: (s) => /[^A-Za-z0-9]/.test(s),    label: 'Um caractere especial'      },
];

const senhaStrength = (senha) => {
  if (!senha) return { label: '', score: 0 };
  const score = PASSWORD_RULES.filter(r => r.test(senha)).length;
  const labels = ['', 'Muito fraca', 'Fraca', 'Razoável', 'Forte', 'Muito forte'];
  return { label: labels[score] || 'Muito fraca', score };
};

const strengthColor = (score) => {
  if (score <= 1) return '#ef4444';
  if (score === 2) return '#f97316';
  if (score === 3) return '#f59e0b';
  if (score === 4) return '#10b981';
  return '#06b6d4';
};

const Cadastro = () => {
  const api      = useApi();
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [touched, setTouched] = useState({});
  const fileInputRef          = useRef(null);

  const [form, setForm] = useState({
    email: '', confirmEmail: '', nome: '', senha: '',
    ubiConnect: '', imagemUsuario: '', plataforma: '', openPlataforma: false,
  });

  const update = (patch) => setForm(p => ({ ...p, ...patch }));
  const touch  = (name) => setTouched(t => ({ ...t, [name]: true }));
  const goNext = () => setStep(s => Math.min(3, s + 1));
  const goPrev = () => setStep(s => Math.max(1, s - 1));

  const fieldError = {
    email:        touched.email        && !emailRegex.test(form.email)         ? 'E-mail inválido' : '',
    confirmEmail: touched.confirmEmail && form.confirmEmail !== form.email      ? 'E-mails não coincidem' : '',
    nome:         touched.nome         && form.nome.length < 2                 ? 'Mínimo 2 caracteres' : '',
    ubiConnect:   touched.ubiConnect   && form.ubiConnect.length < 3           ? 'Mínimo 3 caracteres' : '',
    senha:        touched.senha        && form.senha.length < minPasswordLength ? `Mínimo ${minPasswordLength} caracteres` : '',
  };

  const emailMatch = form.confirmEmail && form.confirmEmail === form.email;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    update({ [name]: value });
    touch(name);
    if (name === 'ubiConnect') setUbiConflict(false);
    if (name === 'nome')       setNomeConflict(false);
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;
    touch(name);

    if (name === 'ubiConnect' && value.length >= 3) {
      setCheckingUbi(true);
      try {
        const res = await api.get(`/usuario/ubiconnect-disponivel?ubiConnect=${encodeURIComponent(value)}`);
        setUbiConflict(!res.data?.disponivel);
      } catch { setUbiConflict(false); }
      finally  { setCheckingUbi(false); }
    } else if (name === 'ubiConnect') {
      setUbiConflict(false);
    }

    if (name === 'nome' && value.length >= 2) {
      setCheckingNome(true);
      try {
        const res = await api.get(`/usuario/apelido-disponivel?nome=${encodeURIComponent(value)}`);
        setNomeConflict(!res.data?.disponivel);
      } catch { setNomeConflict(false); }
      finally  { setCheckingNome(false); }
    } else if (name === 'nome') {
      setNomeConflict(false);
    }
  };

  const handleProfileImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Selecione uma imagem válida.'); return; }
    const reader = new FileReader();
    reader.onload = () => update({ imagemUsuario: reader.result });
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      touch('email');
      if (!emailRegex.test(form.email)) { setError('Digite um e-mail válido.'); return false; }
    }
    if (step === 2) {
      touch('confirmEmail');
      if (form.confirmEmail !== form.email) { setError('E-mails não coincidem.'); return false; }
    }
    if (step === 3) {
      ['nome', 'ubiConnect', 'senha'].forEach(touch);
      if (!form.nome || form.nome.length < 2)             { setError('Digite um apelido válido.'); return false; }
      if (nomeConflict)                                   { setError('Este apelido já está em uso. Escolha outro.'); return false; }
      if (!form.ubiConnect || form.ubiConnect.length < 3) { setError('Digite seu Ubisoft Connect.'); return false; }
      if (ubiConflict)                                    { setError('Este UbiConnect já está em uso por outro usuário.'); return false; }
      const regraFalha = PASSWORD_RULES.find(r => !r.test(form.senha));
      if (regraFalha) { setError(`Senha inválida: ${regraFalha.label.toLowerCase()}.`); return false; }
      if (!form.plataforma)                               { setError('Selecione sua plataforma.'); return false; }
    }
    return true;
  };

  const [checkingEmail,      setCheckingEmail]      = useState(false);
  const [checkingUbi,        setCheckingUbi]        = useState(false);
  const [ubiConflict,        setUbiConflict]        = useState(false);
  const [checkingNome,       setCheckingNome]       = useState(false);
  const [nomeConflict,       setNomeConflict]       = useState(false);

  const handleNext = async () => {
    if (!validateStep()) return;

    // Step 1 — verifica disponibilidade do email antes de avançar
    if (step === 1) {
      setCheckingEmail(true);
      try {
        const res = await api.get(`/usuario/email-disponivel?email=${encodeURIComponent(form.email)}`);
        if (!res.data?.disponivel) {
          setError('Este e-mail já está cadastrado. Tente fazer login.');
          setCheckingEmail(false);
          return;
        }
      } catch {
        // se o endpoint falhar, deixa passar — o submit vai pegar no final
      } finally {
        setCheckingEmail(false);
      }
    }

    goNext();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    try {
      setLoading(true);
      setError('');
      const payload = {
        email:         form.email,
        nome:          form.nome,
        senha:         form.senha,
        ubiConnect:    form.ubiConnect,
        plataforma:    form.plataforma?.toUpperCase() || 'PC',
        imagemUsuario: form.imagemUsuario ? form.imagemUsuario.split(',')[1] : '',
      };
      const resp = await api.post('/usuario/cadastrar', payload);
      if (resp.data?.id) {
        navigate('/login');
      } else if (resp.data?.erro) {
        setError(resp.data.erro);  // ex: "Email já cadastrado."
      } else {
        setError('Erro no cadastro. Verifique os dados.');
      }
    } catch (err) {
      const msg = err?.response?.data?.erro || err?.response?.data?.message;
      setError(msg || 'Erro ao enviar cadastro. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const strength = senhaStrength(form.senha);

  const plataformaLabel =
    form.plataforma === 'PC'          ? 'PC'          :
    form.plataforma === 'XBOX'        ? 'Xbox'        :
    form.plataforma === 'PLAYSTATION' ? 'PlayStation' : 'Selecione...';

  if (loading) return <LoadingScreen />;

  return (
    <div className="register-container">
      <div className="register-card">

        <div className="card-header">
          <h1>Criar Conta</h1>
          <p className="subtitle">Registro rápido — leva 1 minuto</p>
        </div>

        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`connector ${step > 1 ? 'active' : ''}`} />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`connector ${step > 2 ? 'active' : ''}`} />
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form className="register-form" onSubmit={handleSubmit} noValidate>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <section className="form-step">
              <label>Email</label>
              <div className="input-wrapper">
                <input
                  type="email" name="email"
                  placeholder="seu@exemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldError.email ? 'input-error' : touched.email && !fieldError.email ? 'input-ok' : ''}
                  required
                />
                {touched.email && !fieldError.email && form.email && <span className="input-check">✓</span>}
              </div>
              {fieldError.email && <span className="field-error">{fieldError.email}</span>}
              <div className="controls">
                <button type="button" className="btn-primary" onClick={handleNext} disabled={checkingEmail}>
                  {checkingEmail ? 'Verificando…' : 'Continuar'}
                </button>
              </div>
            </section>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <section className="form-step">
              <div className="step-recap">
                Confirmando: <strong>{form.email}</strong>
              </div>
              <label>Confirmar Email</label>
              <div className="input-wrapper">
                <input
                  type="email" name="confirmEmail"
                  placeholder="repita seu e-mail"
                  value={form.confirmEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldError.confirmEmail ? 'input-error' : emailMatch ? 'input-ok' : ''}
                  required
                />
                {emailMatch && <span className="input-check">✓</span>}
              </div>
              {fieldError.confirmEmail && <span className="field-error">{fieldError.confirmEmail}</span>}
              <div className="controls">
                <button type="button" className="btn-ghost" onClick={goPrev}>Voltar</button>
                <button type="button" className="btn-primary" onClick={handleNext}>Próximo</button>
              </div>
            </section>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <section className="form-step">
              <label>Apelido</label>
              <div className="input-wrapper">
                <input
                  type="text" name="nome"
                  placeholder="Seu apelido no game"
                  value={form.nome}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    nomeConflict || fieldError.nome ? 'input-error'
                    : checkingNome ? ''
                    : touched.nome && !fieldError.nome && form.nome && !nomeConflict ? 'input-ok'
                    : ''
                  }
                  required
                />
                {checkingNome && <span className="input-spinner" />}
                {!checkingNome && touched.nome && !fieldError.nome && form.nome && !nomeConflict && (
                  <span className="input-check">✓</span>
                )}
              </div>
              {fieldError.nome && <span className="field-error">{fieldError.nome}</span>}
              {!fieldError.nome && nomeConflict && <span className="field-error">Apelido já em uso</span>}
              {!fieldError.nome && checkingNome && <span className="field-checking">Verificando…</span>}

              <div className="two-cols">
                <div>
                  <label>Ubisoft Connect</label>
                  <div className="input-wrapper">
                    <input
                      type="text" name="ubiConnect"
                      placeholder="Ex: PlayerXYZ#123"
                      value={form.ubiConnect}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={
                        ubiConflict || fieldError.ubiConnect ? 'input-error'
                        : checkingUbi ? ''
                        : touched.ubiConnect && !fieldError.ubiConnect && form.ubiConnect && !ubiConflict ? 'input-ok'
                        : ''
                      }
                      required
                    />
                    {checkingUbi && <span className="input-spinner" />}
                    {!checkingUbi && touched.ubiConnect && !fieldError.ubiConnect && form.ubiConnect && !ubiConflict && (
                      <span className="input-check">✓</span>
                    )}
                  </div>
                  {fieldError.ubiConnect && <span className="field-error">{fieldError.ubiConnect}</span>}
                  {!fieldError.ubiConnect && ubiConflict  && <span className="field-error">UbiConnect já em uso</span>}
                  {!fieldError.ubiConnect && checkingUbi  && <span className="field-checking">Verificando…</span>}
                </div>

                <div>
                  <label>Senha</label>
                  <div className="input-wrapper">
                    <input
                      type="password" name="senha"
                      placeholder="Mín. 8 caracteres"
                      value={form.senha}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={
                        touched.senha && PASSWORD_RULES.some(r => !r.test(form.senha)) ? 'input-error'
                        : touched.senha && form.senha && PASSWORD_RULES.every(r => r.test(form.senha)) ? 'input-ok'
                        : ''
                      }
                      required
                    />
                  </div>

                  {/* ── Barra de força ── */}
                  {form.senha.length > 0 && (
                    <div className="strength-wrap">
                      <div className="strength-bar">
                        {[1,2,3,4,5].map(i => (
                          <div
                            key={i}
                            className="strength-seg"
                            style={{ background: i <= strength.score ? strengthColor(strength.score) : '#21262d' }}
                          />
                        ))}
                      </div>
                      <span className="strength-label" style={{ color: strengthColor(strength.score) }}>
                        {strength.label}
                      </span>
                    </div>
                  )}

                  {/* ── Checklist de regras ── */}
                  {form.senha.length > 0 && (
                    <ul className="pwd-rules">
                      {PASSWORD_RULES.map((r, i) => (
                        <li key={i} className={r.test(form.senha) ? 'pwd-rule ok' : 'pwd-rule'}>
                          <span className="pwd-rule-dot" />
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <label>Plataforma</label>
              <div className="plataforma-dropdown">
                <div
                  className={`selected ${form.openPlataforma ? 'open' : ''}`}
                  onClick={() => update({ openPlataforma: !form.openPlataforma })}
                >
                  <div className="selected-content">
                    {form.plataforma === 'PC'          && <FaWindows    className="platform-icon pc"  />}
                    {form.plataforma === 'XBOX'        && <FaXbox       className="platform-icon xbox"/>}
                    {form.plataforma === 'PLAYSTATION' && <FaPlaystation className="platform-icon ps" />}
                    <span style={{ color: form.plataforma ? '#e6edf3' : '#484f58' }}>{plataformaLabel}</span>
                  </div>
                  <span className="arrow">{form.openPlataforma ? '▲' : '▼'}</span>
                </div>
                {form.openPlataforma && (
                  <ul className="dropdown">
                    {[
                      { val: 'PC',          icon: <FaWindows    className="platform-icon pc"  />, label: 'PC'          },
                      { val: 'XBOX',        icon: <FaXbox       className="platform-icon xbox"/>, label: 'Xbox'        },
                      { val: 'PLAYSTATION', icon: <FaPlaystation className="platform-icon ps" />, label: 'PlayStation' },
                    ].map(o => (
                      <li
                        key={o.val}
                        className={form.plataforma === o.val ? 'active' : ''}
                        onClick={() => update({ plataforma: o.val, openPlataforma: false })}
                      >
                        {o.icon} {o.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <label>
                Imagem de Perfil
                <span className="label-optional">opcional</span>
              </label>
              <input type="file" accept="image/*" onChange={handleProfileImage} ref={fileInputRef} />
              {form.imagemUsuario && (
                <div className="img-preview">
                  <img src={form.imagemUsuario} alt="Preview" />
                  <button
                    type="button"
                    className="img-remove"
                    onClick={() => { update({ imagemUsuario: '' }); fileInputRef.current.value = ''; }}
                  >
                    ✕ Remover
                  </button>
                </div>
              )}

              <div className="controls">
                <button type="button" className="btn-ghost" onClick={goPrev}>Voltar</button>
                <button type="submit" className="btn-primary">Cadastrar</button>
              </div>
            </section>
          )}

        </form>
      </div>
    </div>
  );
};

export default Cadastro;