import { useState } from "react";
import "./Login.css"; 
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && password) {
            navigate('/'); // Redireciona para a página inicial
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    };

    const handleClick = (e) => {
        e.preventDefault();
        navigate('/cadastro')
    };

    return (
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
            <form onClick={handleClick}>
                <button type="click">Cadastre-se</button>
            </form>
        </div>
    );
}

export default Login;