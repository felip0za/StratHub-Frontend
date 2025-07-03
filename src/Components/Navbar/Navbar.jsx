import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../Services/API";
import { FaUsers } from "react-icons/fa";
import StratHub from "/src/assets/StratHub.png";
import "./Navbar.css";

function Navbar() {
    const [usuario, setUsuario] = useState('');
    const navigate = useNavigate();
    const id = localStorage.getItem("id");

    useEffect(() => {
        async function fetchUsuario() {
            try {
                const { data } = await api.get(`/usuario/${id}`);
                setUsuario(data);
            } catch (err) {
                console.error("Erro ao buscar usuário:", err);
            }
        }

        fetchUsuario();
    }, [id]);

    return (
        <header>
            <nav className="nav">
                <img src={StratHub} alt="Logo do sistema" onClick={() => navigate("/")} className="nav-logo"/>
                
                <span onClick={() => navigate("/home")} className="nav-link">Salas</span>
                <span onClick={() => navigate("/chatbox")} className="nav-link">Campeonatos (em Breve)</span>
                <span onClick={() => navigate("/criartime")} className="nav-link">Time</span>
                
                <span onClick={() => navigate("/amigos")} className="nav-link-friends">
                    <FaUsers className="friends-icon" /> 
                </span>
                
                <div className="user-info">
                    <img className="profile-icon-img" src={usuario.imagem_usuario} alt="Foto do usuário" onClick={() => navigate(`/usuario/${id}`)}/>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
