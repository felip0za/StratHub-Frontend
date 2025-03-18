import { useState } from "react";
import "./Login.css"; 
import { useNavigate } from "react-router-dom";
import R6HubLogo from "/src/assets/R6HubLogo.png";; // Certifique-se de que a imagem está no diretório correto

function Login() {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email && password) {
            navigate('/home'); // Redireciona para a página inicial
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    };

    const handleClickSignin = (e) => {
        e.preventDefault();
        navigate('/cadastro');
    };

    return (
        <div className="login-page">
            {/* Logo posicionada no lado direito */}
            <img src={R6HubLogo} alt="Logo do site" className="login-logo" />

            {/* Container do formulário de login */}
            <div className="login-container">
                <h2>Tela de Login</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Senha:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Entrar</button>
                </form>
                <h2>ou</h2>
                <form onClick={handleClickSignin}>
                    <button type="button">Cadastre-se</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
