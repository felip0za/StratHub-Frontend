import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/API";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";
import { FaWindows, FaXbox, FaPlaystation } from "react-icons/fa";
import "./Cadastro.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minPasswordLength = 6;

const Cadastro = () => {
  const api = useApi();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    email: "",
    confirmEmail: "",
    nome: "",
    senha: "",
    ubiConnect: "",
    imagemUsuario: "",
    plataforma: "",
  });

  const update = (patch) => setForm((p) => ({ ...p, ...patch }));
  const goNext = () => setStep((s) => Math.min(3, s + 1));
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

  const validateStep = () => {
    setError("");
    if (step === 1 && !emailRegex.test(form.email)) {
      setError("Digite um e-mail válido.");
      return false;
    }
    if (step === 2 && form.confirmEmail !== form.email) {
      setError("E-mails não coincidem.");
      return false;
    }
    if (step === 3) {
      if (!form.nome || form.nome.length < 2) {
        setError("Digite um apelido válido.");
        return false;
      }
      if (!form.ubiConnect || form.ubiConnect.length < 3) {
        setError("Digite seu Ubisoft Connect.");
        return false;
      }
      if (form.senha.length < minPasswordLength) {
        setError(`Senha deve ter ao menos ${minPasswordLength} caracteres.`);
        return false;
      }
      if (!form.plataforma) {
        setError("Selecione sua plataforma de jogo.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      goNext();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    try {
      setLoading(true);
      setError("");
      const payload = {
        email: form.email,
        nome: form.nome,
        senha: form.senha,
        ubiConnect: form.ubiConnect,
        plataforma: form.plataforma?.toUpperCase() || "PC",
        imagemUsuario: form.imagemUsuario
          ? form.imagemUsuario.split(",")[1]
          : "",
      };
      const resp = await api.post("/usuario/cadastrar", payload);
      const data = resp.data;
      if (data?.id) {
        alert("Cadastro realizado com sucesso!");
        navigate("/login");
      } else setError("Erro no cadastro. Verifique os dados.");
    } catch (err) {
      console.error("Erro no cadastro:", err);
      setError("Erro ao enviar cadastro. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.senha;
    if (p.length >= 12) return "Alta";
    if (p.length >= 8) return "Boa";
    if (p.length >= minPasswordLength) return "Fraca";
    return "Muito fraca";
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="register-container modern">
      <div className="register-card">
        <div className="card-header">
          <h1>Criar Conta</h1>
          <p className="subtitle">Registro rápido — leve 1 minuto</p>
        </div>

        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`connector ${step > 1 ? "active" : ""}`} />
          <div className={`step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className={`connector ${step > 2 ? "active" : ""}`} />
          <div className={`step ${step >= 3 ? "active" : ""}`}>3</div>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {step === 1 && (
            <section className="form-step">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="seu@exemplo.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              <div className="controls">
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Continuar
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="form-step">
              <label>Confirmar Email</label>
              <input
                type="email"
                name="confirmEmail"
                placeholder="confirme seu email"
                value={form.confirmEmail}
                onChange={handleChange}
                required
              />
              <div className="controls">
                <button type="button" onClick={goPrev} className="btn-ghost">
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Próximo
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="form-step">
              <label>Apelido</label>
              <input
                type="text"
                name="nome"
                placeholder="Seu apelido"
                value={form.nome}
                onChange={handleChange}
                required
              />
              <div className="two-cols">
                <div>
                  <label>Ubisoft Connect</label>
                  <input
                    type="text"
                    name="ubiConnect"
                    placeholder="Ex: PlayerXYZ#123"
                    value={form.ubiConnect}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>Senha</label>
                  <input
                    type="password"
                    name="senha"
                    placeholder="Mínimo 6 caracteres"
                    value={form.senha}
                    onChange={handleChange}
                    required
                  />
                  <div className="helper">Força: {passwordStrength()}</div>
                </div>
              </div>

              <label>Plataforma</label>
              <div className="plataforma-dropdown">
                <div
                  className={`selected ${form.openPlataforma ? "open" : ""}`}
                  onClick={() =>
                    update({ openPlataforma: !form.openPlataforma })
                  }
                >
                  <div className="selected-content">
                    {form.plataforma === "PC" && (
                      <FaWindows className="platform-icon pc" />
                    )}
                    {form.plataforma === "XBOX" && (
                      <FaXbox className="platform-icon xbox" />
                    )}
                    {form.plataforma === "PLAYSTATION" && (
                      <FaPlaystation className="platform-icon ps" />
                    )}
                    <span>
                      {form.plataforma
                        ? form.plataforma === "PC"
                          ? "PC"
                          : form.plataforma === "XBOX"
                          ? "Xbox"
                          : "PlayStation"
                        : "Selecione..."}
                    </span>
                  </div>
                  <span className="arrow">
                    {form.openPlataforma ? "▲" : "▼"}
                  </span>
                </div>

                {form.openPlataforma && (
                  <ul className="dropdown">
                    <li
                      onClick={() =>
                        update({ plataforma: "PC", openPlataforma: false })
                      }
                      className={form.plataforma === "PC" ? "active" : ""}
                    >
                      <FaWindows className="platform-icon pc" /> PC
                    </li>
                    <li
                      onClick={() =>
                        update({ plataforma: "XBOX", openPlataforma: false })
                      }
                      className={form.plataforma === "XBOX" ? "active" : ""}
                    >
                      <FaXbox className="platform-icon xbox" /> Xbox
                    </li>
                    <li
                      onClick={() =>
                        update({ plataforma: "PLAYSTATION", openPlataforma: false })
                      }
                      className={form.plataforma === "PLAYSTATION" ? "active" : ""}
                    >
                      <FaPlaystation className="platform-icon ps" /> PlayStation
                    </li>
                  </ul>
                )}
              </div>

              <label>Imagem de Perfil (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImage}
                ref={fileInputRef}
              />
              {form.imagemUsuario && (
                <div className="img-preview">
                  <img src={form.imagemUsuario} alt="Avatar preview" />
                </div>
              )}
              <div className="controls">
                <button type="button" onClick={goPrev} className="btn-ghost">
                  Voltar
                </button>
                <button type="submit" className="btn-primary">
                  Cadastrar
                </button>
              </div>
            </section>
          )}
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
