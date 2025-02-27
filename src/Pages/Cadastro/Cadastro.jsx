// src/Register.jsx
import React, { useState } from 'react';
import './Cadastro.css'; // Importando o CSS
import { useNavigate } from 'react-router-dom';

const Cadastro = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aqui você pode adicionar a lógica para enviar os dados para o servidor
        console.log('Nome:', name);
        console.log('Email:', email);
        console.log('Senha:', password);
        alert('Cadastro realizado com sucesso!');
        navigate('/login')
    };

    return (
        <div className="register-container">
            <h2>Cadastro</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
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
                <button type="submit">CONCLUIR</button>
            </form>
        </div>
    );
};

export default Cadastro;